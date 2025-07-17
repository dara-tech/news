
import { FiAlertTriangle } from 'react-icons/fi';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 border border-red-200 rounded-lg">
      <FiAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-red-800">An Error Occurred</h3>
      <p className="text-red-600 mt-2 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
