import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-2">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white" />
    </div>
  );
};
