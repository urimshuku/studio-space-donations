import { CheckCircle } from 'lucide-react';

interface SuccessPageProps {
  onBackHome: () => void;
}

export function SuccessPage({ onBackHome }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
              style={{ backgroundColor: '#c95b2d' }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600">
              Your donation has been successfully processed
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Your generous contribution is helping us create a better studio space
              for our community. Every donation makes a real difference, and we're
              incredibly grateful for your support.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onBackHome}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#c95b2d' }}
            >
              Back to Home
            </button>

            <p className="text-xs text-gray-500 pt-2">
              You'll receive a confirmation email shortly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
