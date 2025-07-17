import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="text-center py-16">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
      <h3 className="mt-2 text-sm font-semibold text-red-800">An Error Occurred</h3>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
};

export default ErrorState;
