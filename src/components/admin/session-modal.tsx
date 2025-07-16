import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Session {
  id: string;
  name: string;
  sessionDetails: string;
  amount: string;
  commission: string;
}

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, sessions = [] }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: '0.75rem',
          maxWidth: '36rem',
          width: '100%',
        }}
        className="shadow-2xl"
      >
        <div style={{
          background: '#8159A8',
          color: 'white',
          borderTopLeftRadius: '0.75rem',
          borderTopRightRadius: '0.75rem',
          padding: '1.5rem 2rem 1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span className="text-lg">🩺</span>
          <DialogTitle style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>All Sessions</DialogTitle>
        </div>
        <div style={{ padding: '2rem', background: 'white', borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
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
                    <div className="text-sm text-gray-400">Commission: {session.commission}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#8159A8]">
                      Rs. {session.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { SessionModal };