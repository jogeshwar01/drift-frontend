"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  text = "Loading...",
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const spinnerSize = sizeClasses[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div
        className={`${spinnerSize} border-4 border-gray-300 border-t-chart-4 rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-2">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};
