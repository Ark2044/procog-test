import React from "react";
import { FaSync } from "react-icons/fa";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "default",
}) => {
  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-4xl",
  };

  return (
    <div className="flex justify-center items-center p-8">
      <FaSync className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
    </div>
  );
};

export default LoadingSpinner;
