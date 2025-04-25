import React from "react";

interface StatusSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  colorClasses: (value: string) => string;
  icon: React.ReactNode;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  options,
  onChange,
  colorClasses,
  icon,
}) => (
  <div className="relative">
    <select
      className={`rounded px-2 py-2 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer ${colorClasses(
        value
      )}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
      {icon}
    </div>
  </div>
);
