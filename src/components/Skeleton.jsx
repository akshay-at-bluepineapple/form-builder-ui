import React from 'react';

function Skeleton({ rows = 3, count = 1, height = 'h-4', className = '' }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2">
          {Array.from({ length: count }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`bg-gray-300 rounded w-full ${height}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
