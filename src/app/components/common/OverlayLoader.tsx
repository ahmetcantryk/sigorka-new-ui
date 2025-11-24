import React from 'react';

interface OverlayLoaderProps {
  visible: boolean;
}

const OverlayLoader: React.FC<OverlayLoaderProps> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="overlay-loader">
      <div className="loader"></div>
    </div>
  );
};

export default OverlayLoader; 