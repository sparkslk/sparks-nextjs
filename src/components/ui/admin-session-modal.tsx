import React from 'react';
import { X, Clock } from 'lucide-react';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: {
    id: string;
    name: string;
    sessionDetails: string;
    amount: string;
    commission: string;
  }[];
}

const SessionModal: React.FC<SessionModalProps> = ({ 
  isOpen, 
  onClose, 
  sessions = [] 
}) => {
  if (!isOpen) return null;

  // Close modal when clicking on overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white/30 backdrop-blur-[4px] flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#8159A8] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🩺</span>
            <h2 className="text-lg font-semibold">Session Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-gray-800 font-medium mb-4">Recent Sessions</h3>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sessions found</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-start justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{session.name}</div>
                    <div className="text-sm text-gray-500">{session.sessionDetails}</div>
                    {/*<div className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      x<span>Duration: {session.duration}</span>
                    </div>*/}
                    <div className="text-sm text-gray-400">
                      Commission: {session.commission}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-[#8159A8]">
                      Rs. {session.amount.toLocaleString()}
                    </div>
                    {/*<div className="text-xs text-gray-500 mt-1">
                      Status: {session.status}
                    </div>*/}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { SessionModal };