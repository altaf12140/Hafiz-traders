import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle, Clock, Filter, Phone, Mail, MapPin, Wallet } from 'lucide-react';
import { CustomerFeedback, StoreSettings } from '../types';
import { formatDateTime } from '../utils/formatters';

interface FeedbackProps {
  feedbacks: CustomerFeedback[];
  settings: StoreSettings;
  onAddFeedback: (feedback: CustomerFeedback) => void;
  onUpdateFeedbackStatus: (id: string, status: 'pending' | 'resolved') => void;
}

export const Feedback: React.FC<FeedbackProps> = ({
  feedbacks,
  settings,
  onAddFeedback,
  onUpdateFeedbackStatus,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [feedbackType, setFeedbackType] = useState<'complaint' | 'suggestion' | 'appreciation' | 'general'>('appreciation');
  const [message, setMessage] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !message.trim()) return;

    const newFb: CustomerFeedback = {
      id: `fb-${Date.now()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      rating,
      feedbackType,
      message: message.trim(),
      date: new Date().toISOString(),
      status: 'pending',
    };

    onAddFeedback(newFb);
    setCustomerName('');
    setCustomerPhone('');
    setRating(5);
    setMessage('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filterType === 'all') return true;
    return f.feedbackType === filterType || f.status === filterType;
  });

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">Customer Feedback & Reviews</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Owned by <strong className="text-indigo-300">Pitafi Brothers</strong> • Wholesale & Retail General Store
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-3">
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Phone className="w-3.5 h-3.5 text-indigo-400" /> {settings.phone}
            </span>
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {settings.email}
            </span>
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Easypaisa: {settings.easypaisaNumber}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{settings.address}</span>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-center shrink-0">
          <div className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1">
            <span>{averageRating}</span>
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-1">
            Based on {feedbacks.length} Customer Reviews
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Submit Feedback Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              Submit Customer Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              We value your feedback to serve you better at Hafiz Traders (Pitafi Brothers).
            </p>
          </div>

          {submittedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your feedback has been submitted to Pitafi Brothers management.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 03001234567"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Rating (1 to 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Feedback Category</label>
              <select
                value={feedbackType}
                onChange={e => setFeedbackType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 capitalize font-medium"
              >
                <option value="appreciation">Appreciation / Praise</option>
                <option value="suggestion">Suggestion / Idea</option>
                <option value="complaint">Complaint / Issue</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Your Review / Message *</label>
              <textarea
                required
                rows={4}
                placeholder="Write your experience, suggestion, or complaint..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Feedback
            </button>
          </form>
        </div>

        {/* Feedback List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">Feedback Log ({feedbacks.length})</h3>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="all">All Reviews</option>
                <option value="appreciation">Appreciation</option>
                <option value="suggestion">Suggestions</option>
                <option value="complaint">Complaints</option>
                <option value="pending">Pending Status</option>
                <option value="resolved">Resolved Status</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm">No feedback entries found</p>
                <p className="text-xs text-slate-400">Be the first to submit a review for Pitafi Brothers General Store!</p>
              </div>
            ) : (
              filteredFeedbacks.map(fb => (
                <div key={fb.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{fb.customerName}</span>
                        {fb.customerPhone && (
                          <span className="text-[11px] text-slate-500 font-mono">({fb.customerPhone})</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          fb.feedbackType === 'complaint'
                            ? 'bg-rose-100 text-rose-700'
                            : fb.feedbackType === 'suggestion'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {fb.feedbackType}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{formatDateTime(fb.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= fb.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => onUpdateFeedbackStatus(fb.id, fb.status === 'pending' ? 'resolved' : 'pending')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          fb.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {fb.status === 'resolved' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Resolved
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" /> Mark Resolved
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans leading-relaxed">
                    "{fb.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
