import React from "react";

interface RiskStatusBadgeProps {
  status: string;
  type: "impact" | "status";
}

export const RiskStatusBadge: React.FC<RiskStatusBadgeProps> = ({
  status,
  type,
}) => {
  let bgColor = "";
  let textColor = "";

  if (type === "impact") {
    if (status === "high") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
    } else if (status === "medium") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
    } else {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    }
  } else {
    if (status === "active") {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
    } else if (status === "closed") {
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
    } else {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {status}
    </span>
  );
};

export default RiskStatusBadge;
