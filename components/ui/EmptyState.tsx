import React from "react";
import { FaInbox } from "react-icons/fa";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = <FaInbox className="text-3xl text-gray-400" />,
}) => {
  return (
    <div className="bg-white py-8 px-4 text-center">
      <div className="flex flex-col items-center text-gray-500">
        <div className="mb-4">{icon}</div>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
