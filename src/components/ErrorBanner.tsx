import React from "react";
import type { UserFriendlyError } from "../types/tiktok";

interface Props {
  error: UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<Props> = ({ error, onRetry, onDismiss }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-red-800 font-medium">{error.title}</h3>
        <p className="text-red-700 text-sm mt-1">{error.message}</p>
        <p className="text-red-600 text-xs mt-2">{error.action}</p>
      </div>
      <div className="flex gap-2">
        {error.canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  </div>
);
