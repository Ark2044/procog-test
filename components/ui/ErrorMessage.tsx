import React from "react";
import { FaExclamationCircle, FaSync } from "react-icons/fa";
import { Button } from "./button";

interface ErrorMessageProps {
  message: string;
  retryFn?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  retryFn,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-red-200 p-6 text-center">
      <div className="flex flex-col items-center text-red-500 mb-4">
        <FaExclamationCircle className="text-4xl mb-2" />
        <p className="text-lg font-medium">{message}</p>
      </div>
      {retryFn && (
        <Button onClick={retryFn} className="mt-2">
          <FaSync className="mr-2" /> Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
