import { useState } from 'react';
import { X } from 'lucide-react';

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  title: string;
  actionType: 'block' | 'suspend' | 'message' | 'delete';
  userName: string;
}

export default function UserActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  actionType,
  userName,
}: UserActionModalProps) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('Admin Notice');
  const [days, setDays] = useState('7');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    switch (actionType) {
      case 'block':
        onConfirm({ reason });
        break;
      case 'suspend':
        onConfirm({ days: parseInt(days), reason });
        break;
      case 'message':
        onConfirm({ subject, message });
        break;
      case 'delete':
        if (confirmText === 'DELETE') {
          onConfirm({});
        } else {
          alert('Please type DELETE to confirm');
          return;
        }
        break;
    }

    // Reset form
    setReason('');
    setMessage('');
    setSubject('Admin Notice');
    setDays('7');
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-gray-400 mb-4">
              User: <span className="text-white font-semibold">{userName}</span>
            </p>

            {actionType === 'block' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for blocking
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-primary-600 focus:outline-none"
                  rows={3}
                  placeholder="Enter reason..."
                  required
                />
              </div>
            )}

            {actionType === 'suspend' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Suspend for (days)
                  </label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-primary-600 focus:outline-none"
                    min="1"
                    max="365"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for suspension
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-primary-600 focus:outline-none"
                    rows={3}
                    placeholder="Enter reason..."
                    required
                  />
                </div>
              </>
            )}

            {actionType === 'message' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-primary-600 focus:outline-none"
                    placeholder="Message subject..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-primary-600 focus:outline-none"
                    rows={5}
                    placeholder="Enter your message..."
                    required
                  />
                </div>
              </>
            )}

            {actionType === 'delete' && (
              <div>
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-400 text-sm">
                    ⚠️ This action cannot be undone. All user data will be permanently deleted.
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
                  placeholder="Type DELETE"
                  required
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                actionType === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

