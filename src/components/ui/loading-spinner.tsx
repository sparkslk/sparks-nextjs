interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );
}