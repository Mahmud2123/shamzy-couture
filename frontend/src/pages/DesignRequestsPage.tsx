import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { designRequestsService } from '../services/designRequests';
import { DesignRequest } from '../types';
import { FiEdit3, FiMessageSquare, FiPlus } from 'react-icons/fi';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEWING: 'bg-blue-100 text-blue-700',
  QUOTED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function DesignRequestsPage() {
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    designRequestsService.getMyRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendMessage = async (id: string) => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await designRequestsService.addMessage(id, message.trim());
      const updated = await designRequestsService.getMyRequests();
      setRequests(updated);
      setMessage('');
    } catch {
      // handled silently
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-stone-900">Design Requests</h1>
          <Link
            to="/design-requests/new"
            className="bg-stone-900 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-stone-700 transition-colors"
          >
            <FiPlus size={16} /> New Request
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => <div key={i} className="h-32 bg-stone-200 rounded-xl animate-pulse" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <FiEdit3 size={50} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-600 mb-4">No design requests yet</p>
            <Link to="/design-requests/new" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-stone-700 transition-colors">
              Request a Custom Design
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setSelectedId(selectedId === req.id ? null : req.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-800 truncate">{req.title}</h3>
                      <p className="text-stone-500 text-sm mt-1 line-clamp-2">{req.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {req.budget && <span className="text-xs text-stone-500">Budget: ${req.budget}</span>}
                        {req.deadline && (
                          <span className="text-xs text-stone-500">
                            Deadline: {new Date(req.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status]}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <FiMessageSquare size={10} /> {req.messages.length}
                      </span>
                    </div>
                  </div>
                  {req.adminNotes && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Admin Note:</p>
                      <p className="text-xs text-amber-600">{req.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Messages */}
                {selectedId === req.id && (
                  <div className="border-t border-stone-100 p-5">
                    <h4 className="font-semibold text-stone-700 mb-3 text-sm">Conversation</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {req.messages.length === 0 ? (
                        <p className="text-stone-400 text-sm">No messages yet</p>
                      ) : (
                        req.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-lg text-sm ${
                              msg.user?.role === 'ADMIN'
                                ? 'bg-amber-50 border border-amber-100'
                                : 'bg-stone-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs text-stone-600">{msg.user?.name}</span>
                              {msg.user?.role === 'ADMIN' && (
                                <span className="text-xs bg-amber-400 text-stone-900 px-1.5 rounded font-bold">SHAMZY</span>
                              )}
                              <span className="text-stone-400 text-xs">{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-stone-700">{msg.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(req.id)}
                        className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="Send a message..."
                      />
                      <button
                        onClick={() => handleSendMessage(req.id)}
                        disabled={sending || !message.trim()}
                        className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-stone-700 disabled:opacity-60"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
