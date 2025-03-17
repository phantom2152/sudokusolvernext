import { createRouter } from 'next-connect';
import multer from 'multer';
import { createWorker } from 'tesseract.js';

// Initialize middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Try to import opencv
let cv;
try {
  cv = require('opencv4nodejs-prebuilt-install');
  console.log('📚 OpenCV version:', cv.version);
} catch (error) {
  console.error('❌ Failed to load opencv4nodejs-prebuilt-install:', error);
}

// Add multer middleware to handle multipart/form-data
const uploadMiddleware = upload.single('image');

// Create handler function
async function handler(req, res) {
  try {
    // Check if OpenCV was loaded successfully
    if (!cv) {
      return res.status(500).json({ error: 'OpenCV is not available' });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Get image buffer from request
    const imageBuffer = req.file.buffer;

    // Process the Sudoku image
    const result = await processSudokuImage(imageBuffer);

    // Return the result
    res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ Error processing Sudoku image:', error);
    res.status(500).json({ 
      error: `Error processing Sudoku image: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Main function to process the Sudoku image
async function processSudokuImage(imageBuffer) {
  // Convert buffer to OpenCV Mat
  const src = cv.imdecode(Buffer.from(imageBuffer));
  
  try {
    console.log(`📊 Image dimensions: ${src.rows}x${src.cols}`);
    
    // Check if the image is already grayscale
    const isGray = src.channels === 1;
    console.log(`🎨 Image has ${isGray ? '1 channel (grayscale)' : `${src.channels} channels (color)`}`);
    
    // Make a copy for drawing on
    const debugImage = src.copy();
    
    // 1. Preprocessing
    const preprocessed = preprocessImage(src);
    
    // 2. Find and extract the Sudoku grid
    const result = findSudokuGrid(preprocessed, debugImage);
    const grid = result.grid;
    
    if (!grid) {
      console.log('❌ No valid Sudoku grid found in the image');
      return {
        success: false,
        message: 'Could not find Sudoku grid in the image',
        debugImage: encodeImage(debugImage)
      };
    }
    
    // 3. Split the grid into cells
    const cells = splitIntoGridCells(grid);
    console.log(`🔢 Successfully extracted ${cells.length} cells from the grid`);
    
    // 4. Recognize digits in the cells
    const sudokuArray = await recognizeDigits(cells);
    
    // 5. Encode processed images for debug visualization
    const gridImage = encodeImage(grid);
    const debugImg = encodeImage(debugImage);
    
    // Count detected digits
    const digitCount = sudokuArray.flat().filter(digit => digit > 0).length;
    console.log(`✅ Successfully detected ${digitCount} digits in the Sudoku grid`);
    
    return {
      success: true,
      puzzle: sudokuArray,
      gridImage: gridImage,
      debugImage: debugImg
    };
  } catch (error) {
    throw error;
  }
}

// Preprocess the image for better grid detection
function preprocessImage(src) {
  // Check if image is already grayscale to avoid the conversion error
  let gray;
  if (src.channels === 1) {
    console.log('🔍 Image is already grayscale, skipping conversion');
    gray = src.copy();
  } else {
    console.log('🔍 Converting image to grayscale');
    try {
      gray = src.bgrToGray();
    } catch (error) {
      console.log('⚠️ bgrToGray failed, trying cvtColor');
      gray = src.cvtColor(cv.COLOR_BGR2GRAY);
    }
  }
  
  // Apply Gaussian blur to reduce noise
  console.log('🔍 Applying Gaussian blur');
  const blurred = gray.gaussianBlur(new cv.Size(5, 5), 0);
  
  // Apply adaptive threshold to create binary image
  console.log('🔍 Applying adaptive threshold');
  const thresholded = blurred.adaptiveThreshold(
    255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY_INV,
    11,
    2
  );
  
  // Optional: Apply morphological operations to strengthen grid lines
  console.log('🔍 Applying morphological operations');
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
  const morphed = thresholded.morphologyEx(kernel, cv.MORPH_CLOSE);
  
  return morphed;
}

// Find and extract the Sudoku grid from the image
function findSudokuGrid(preprocessed, debugImage) {
  console.log('🔍 Finding contours');
  // Find contours in the preprocessed image
  const contours = preprocessed.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  console.log(`📈 Found ${contours.length} contours`);
  
  // Find the largest contour - should be the Sudoku grid
  let maxArea = 0;
  let maxContour = null;
  
  for (let i = 0; i < contours.length; i++) {
    const area = contours[i].area;
    if (area > maxArea) {
      maxArea = area;
      maxContour = contours[i];
    }
  }
  
  console.log(`📏 Largest contour area: ${maxArea}`);
  
  // If no significant contour found, return
  if (!maxContour || maxArea < 1000) {
    console.log("❌ No significant contour found");
    return { grid: null, debugImage };
  }
  
  // Approximate the contour to get a polygon
  const epsilon = 0.02 * maxContour.arcLength(true);
  const approx = maxContour.approxPolyDP(epsilon, true);
  
  console.log(`🔷 Approximated contour points: ${approx.length}`);
  
  // Try to find the four best corners if approx doesn't have exactly 4 points
  let corners;
  if (approx.length === 4) {
    console.log('✅ Found a perfect quadrilateral');
    corners = approx;
  } else if (approx.length > 4) {
    console.log('⚠️ Found more than 4 corners, using convex hull');
    // If we have more than 4 points, use the convex hull instead
    const hull = maxContour.convexHull();
    
    // Approximate the hull to get a simpler polygon
    const hullEpsilon = 0.02 * hull.arcLength(true);
    const hullApprox = hull.approxPolyDP(hullEpsilon, true);
    console.log(`🔷 Convex hull approximation points: ${hullApprox.length}`);
    
    if (hullApprox.length !== 4) {
      console.log("❌ Convex hull doesn't have 4 points either");
      return { grid: null, debugImage };
    }
    
    corners = hullApprox;
  } else {
    console.log("❌ Not enough corner points found");
    return { grid: null, debugImage };
  }
  
  // Get corners of the grid
  const points = [];
  for (let i = 0; i < corners.length; i++) {
    points.push(corners[i]);
  }
  
  // Sort the corners
  const sortedCorners = sortCorners(points);
  console.log("📍 Sorted corners:", sortedCorners);
  
  // Draw the corners on debug image
  sortedCorners.forEach((corner, i) => {
    try {
      // Use a different color for each corner
      const colors = [
        new cv.Vec(255, 0, 0),     // Blue - top-left
        new cv.Vec(0, 255, 0),     // Green - top-right
        new cv.Vec(0, 0, 255),     // Red - bottom-right
        new cv.Vec(255, 0, 255)    // Purple - bottom-left
      ];
      
      debugImage.drawCircle(
        new cv.Point(Math.round(corner.x), Math.round(corner.y)),
        10,
        colors[i],
        -1
      );
      
      // Label the corner
      const labels = ['TL', 'TR', 'BR', 'BL'];
      
      // Add corner labels near the circles
      const labelPos = new cv.Point(
        Math.round(corner.x) + 15, 
        Math.round(corner.y) + 15
      );
      
      // Draw white text with a black outline for visibility
      debugImage.putText(
        labels[i],
        labelPos,
        cv.FONT_HERSHEY_SIMPLEX,
        0.7,
        new cv.Vec(0, 0, 0),
        2
      );
      
      debugImage.putText(
        labels[i],
        labelPos,
        cv.FONT_HERSHEY_SIMPLEX,
        0.7,
        new cv.Vec(255, 255, 255),
        1
      );
    } catch (e) {
      console.log('⚠️ Error drawing corner visualizations:', e.message);
    }
  });
  
  // Apply perspective transform to get a straight grid
  try {
    console.log('🔄 Applying perspective transform');
    const grid = applyPerspectiveTransform(preprocessed, sortedCorners);
    console.log("✅ Successfully applied perspective transform");
    return { grid, debugImage };
  } catch (error) {
    console.log("❌ Error applying perspective transform:", error.message);
    return { grid: null, debugImage };
  }
}

// Sort corners in order: top-left, top-right, bottom-right, bottom-left
function sortCorners(corners) {
  // Calculate center point
  let centerX = 0;
  let centerY = 0;
  corners.forEach(corner => {
    centerX += corner.x;
    centerY += corner.y;
  });
  centerX /= corners.length;
  centerY /= corners.length;
  
  // Sort corners based on their position relative to center
  const sortedCorners = [];
  
  // Find top-left (both x and y less than center)
  sortedCorners[0] = corners.find(c => c.x < centerX && c.y < centerY) || corners[0];
  
  // Find top-right (x greater, y less than center)
  sortedCorners[1] = corners.find(c => c.x > centerX && c.y < centerY) || corners[1];
  
  // Find bottom-right (both x and y greater than center)
  sortedCorners[2] = corners.find(c => c.x > centerX && c.y > centerY) || corners[2];
  
  // Find bottom-left (x less, y greater than center)
  sortedCorners[3] = corners.find(c => c.x < centerX && c.y > centerY) || corners[3];
  
  return sortedCorners;
}

// Apply perspective transform to get a straight view of the grid
function applyPerspectiveTransform(img, corners) {
  const size = 450; // Output image size (450x450 pixels)
  
  // Using the proper Point constructor for opencv4nodejs
  const srcPoints = corners.map(corner => new cv.Point(Math.round(corner.x), Math.round(corner.y)));
  
  // Define destination points (corners of the output image)
  const dstPoints = [
    new cv.Point(0, 0),           // top-left
    new cv.Point(size - 1, 0),    // top-right
    new cv.Point(size - 1, size - 1), // bottom-right
    new cv.Point(0, size - 1)     // bottom-left
  ];
  
  // Get perspective transform matrix
  const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
  
  // Apply perspective transform
  const warpedImg = img.warpPerspective(M, new cv.Size(size, size));
  
  return warpedImg;
}

// Split the grid image into 81 cell images
function splitIntoGridCells(grid) {
  console.log('🔪 Splitting grid into 81 cells');
  const cells = [];
  const cellSize = Math.floor(grid.rows / 9);
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Extract cell region
      const x = col * cellSize;
      const y = row * cellSize;
      const cell = grid.getRegion(new cv.Rect(x, y, cellSize, cellSize));
      
      // Process cell for better digit recognition
      const processedCell = preprocessCell(cell);
      
      cells.push({
        row,
        col,
        image: processedCell,
        hasDigit: hasDigit(processedCell)
      });
    }
  }
  
  return cells;
}

// Preprocess a cell for better digit recognition
function preprocessCell(cell) {
  // Create a copy of the cell
  const cellCopy = cell.copy();
  
  // Apply morphological operations to remove grid lines
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
  const erosion = cellCopy.erode(kernel);
  
  // Crop the cell to remove borders (grid lines)
  const padding = Math.floor(cell.rows * 0.15); // 15% padding from each side
  const croppedWidth = Math.max(1, cell.cols - 2 * padding);
  const croppedHeight = Math.max(1, cell.rows - 2 * padding);
  
  const rect = new cv.Rect(
    padding, 
    padding, 
    croppedWidth, 
    croppedHeight
  );
  const cropped = erosion.getRegion(rect);
  
  // Resize to a standard size for OCR
  const resized = cropped.resize(28, 28);
  
  return resized;
}

// Check if a cell contains a digit
function hasDigit(cell) {
  // Count non-zero pixels in the cell
  const nonZeroPixels = cell.countNonZero();
  
  // For a 28x28 image, a digit typically has at least 20-30 non-zero pixels
  // Adjust this threshold based on your specific images
  return nonZeroPixels > 20;
}

// Recognize digits in cells using Tesseract.js
async function recognizeDigits(cells) {
  console.log('🔢 Recognizing digits with Tesseract.js');
  // Initialize Tesseract worker
  const worker = await createWorker('eng');
  
  // Configure Tesseract for digit recognition
  await worker.setParameters({
    tessedit_char_whitelist: '123456789',
    tessedit_pageseg_mode: '10' // Treat as a single character
  });
  
  // Create a 9x9 array to store the Sudoku puzzle
  const sudokuArray = Array(9).fill().map(() => Array(9).fill(0));
  
  // Count cells that might contain digits
  const cellsWithDigits = cells.filter(cell => cell.hasDigit);
  console.log(`🔍 Found ${cellsWithDigits.length} cells that may contain digits`);
  
  // Process cells that are likely to contain digits
  for (const cell of cells) {
    if (cell.hasDigit) {
      try {
        // Encode the cell image to a format Tesseract can process
        const cellBuffer = encodeImage(cell.image, '.png', false);
        
        // Recognize the digit
        const { data } = await worker.recognize(cellBuffer);
        const text = data.text.trim();
        
        // Parse recognized text as a digit
        if (text && /[1-9]/.test(text)) {
          const digit = parseInt(text.match(/[1-9]/)[0]);
          sudokuArray[cell.row][cell.col] = digit;
        }
      } catch (error) {
        console.error(`⚠️ Error recognizing digit at [${cell.row},${cell.col}]:`, error);
      }
    }
  }
  
  // Terminate Tesseract worker
  await worker.terminate();
  
  return sudokuArray;
}

// Helper function to encode an OpenCV Mat to a base64 data URL
function encodeImage(img, format = '.jpg', asDataUrl = true) {
  // Encode the image to a buffer
  const buffer = cv.imencode(format, img);
  
  if (asDataUrl) {
    // Convert the buffer to a base64 data URL
    const base64 = buffer.toString('base64');
    return `data:image/${format.replace('.', '')};base64,${base64}`;
  } else {
    return buffer;
  }
}

// Setup API route handler
const apiRoute = createRouter();

apiRoute.use(uploadMiddleware);
apiRoute.post(handler);

// Disable body parser since we're using multer
export const config = {
  api: {
    bodyParser: false,
  },
};

// Export a default function for API routes
export default apiRoute.handler();