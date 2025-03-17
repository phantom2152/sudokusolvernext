import React from 'react';

const ValidationMessage = ({ message }) => {
  if (!message) return null;
  
  const isPositive = message === 'Solved ✔️';
  
  return (
    <div 
      className={`
        p-3 text-center rounded mb-5
        ${isPositive ? 'bg-green-600 text-white' : 'bg-red-200 text-black'}
      `}
    >
      {message}
    </div>
  );
};

export default ValidationMessage;