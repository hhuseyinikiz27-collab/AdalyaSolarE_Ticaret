'use client';

import { useState, useEffect } from 'react';
import { api, ApiProductQuestion } from '@/lib/api';
import { MessageCircle, CheckCircle, Eye, EyeOff, Trash2, X } from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<ApiProductQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAnswered, setFilterAnswered] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [answerModal, setAnswerModal] = useState<ApiProductQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.admin.questions.getAll()
      .then(setQuestions)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = questions.filter(q => {
    if (filterAnswered === 'unanswered') return !q.answer;
    if (filterAnswered === 'answered') return !!q.answer;
    return true;
  });

  const openAnswer = (q: ApiProductQuestion) => {
    setAnswerText(q.answer ?? '');
    setAnswerModal(q);
  };

  const submitAnswer = async () => {
    if (!answerModal || !answerText.trim()) return;
    setSubmitting(true);
    try {
      const updated = await api.admin.questions.answer(answerModal.id, answerText);
      setQuestions(prev => prev.map(q =>
        q.id === answerModal.id ? { ...q, answer: updated.answer, answeredAt: updated.answeredAt } : q
      ));
      window.dispatchEvent(new Event('question-answered'));
      setAnswerModal(null);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const toggleVisibility = async (q: ApiProductQuestion) => {
    await api.admin.questions.setVisibility(q.id, !q.isVisible);
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, isVisible: !x.isVisible } : x));
  };

  const deleteQ = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    await api.admin.questions.delete(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const unansweredCount = questions.filter(q => !q.answer).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Question Management</h1>
          {unansweredCount > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-0.5">
              {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'unanswered', 'answered'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterAnswered(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterAnswered === f ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'unanswered' ? 'Unanswered' : 'Answered'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageCircle size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold">No questions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <div key={q.id} className={`bg-white rounded-2xl shadow-sm border p-5 ${!q.isVisible ? 'opacity-60' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {q.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{q.userName}</p>
                    <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    {q.productName && (
                      <p className="text-xs text-orange-500 font-medium mt-0.5">{q.productName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!q.answer && (
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded-lg font-semibold">Unanswered</span>
                  )}
                  <button
                    onClick={() => openAnswer(q)}
                    className="flex items-center gap-1 text-xs bg-[#1B3A6B] hover:bg-[#2d5282] text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    <CheckCircle size={12} />
                    {q.answer ? 'Update' : 'Answer'}
                  </button>
                  <button
                    onClick={() => toggleVisibility(q)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    title={q.isVisible ? 'Hide' : 'Show'}
                  >
                    {q.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => deleteQ(q.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl px-4 py-3 mb-3">{q.question}</p>

              {q.answer && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-green-700 mb-1">Answer</p>
                  <p className="text-sm text-green-800 leading-relaxed">{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Answer Modal */}
      {answerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1B3A6B]">Answer Question</h3>
              <button onClick={() => setAnswerModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-gray-400 font-semibold mb-1">{answerModal.userName} asked:</p>
              <p className="text-sm text-gray-800 font-medium">{answerModal.question}</p>
            </div>
            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              rows={5}
              placeholder="Write your answer..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setAnswerModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAnswer}
                disabled={submitting || !answerText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Answer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
