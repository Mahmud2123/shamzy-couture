import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { designRequestsService } from '../services/designRequests';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function NewDesignRequestPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center bg-white rounded-xl shadow-sm p-8 max-w-sm">
          <h2 className="text-xl font-bold text-stone-800 mb-2">Login Required</h2>
          <p className="text-stone-500 mb-4 text-sm">Please login to submit a bespoke design request</p>
          <button onClick={() => navigate('/login')} className="bg-stone-900 text-white px-6 py-2 rounded-xl font-semibold hover:bg-stone-700 transition-colors">
            Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await designRequestsService.create({
        title: form.title,
        description: form.description,
        budget: form.budget ? Number(form.budget) : undefined,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      });
      toast.success('Design request submitted! We\'ll be in touch soon.');
      navigate('/design-requests');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Request a Bespoke Design</h1>
          <p className="text-stone-500 mb-8 text-sm">
            Describe your vision and our master tailors at SHAMZY COUTURE will craft it to perfection.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="e.g. Custom 3-piece wedding suit"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Description *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                rows={6}
                placeholder="Describe your design vision in detail — fabric preferences, colors, style, occasion, any references..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Budget (USD) <span className="font-normal text-stone-400">optional</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Deadline <span className="font-normal text-stone-400">optional</span>
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-700 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-semibold border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
