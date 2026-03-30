import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { MessageSquare, Plus, X, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';

const Messages = () => {
  const { api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/messages');
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const orderedIds = useMemo(() => messages.map((message) => message._id), [messages]);

  const moveMessage = (index, direction) => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= messages.length) return;

    const next = [...messages];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setMessages(next);
  };

  const saveOrder = async () => {
    if (orderedIds.length === 0) return;

    setSavingOrder(true);
    try {
      await api.put('/api/messages/reorder', orderedIds);
      await fetchData();
    } catch (error) {
      console.error('Error reordering messages:', error);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    await api.post('/api/messages', { content: text, order: messages.length });
    setShowModal(false);
    setContent('');
    fetchData();
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    await api.delete(`/api/messages/${messageId}`);
    fetchData();
  };

  return (
    <div className="space-y-6" dir="rtl" data-testid="messages-page">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ترتيب الرسائل</h1>
            <p className="mt-1 text-sm text-slate-500">إدارة الرسائل الجاهزة وترتيبها حسب أولوية الظهور.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveOrder}
              disabled={savingOrder || messages.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {savingOrder ? 'جارٍ الحفظ...' : 'حفظ الترتيب'}
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              data-testid="add-message-btn"
            >
              <Plus className="h-4 w-4" />
              إضافة رسالة
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">جاري تحميل الرسائل...</section>
      ) : messages.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="text-base font-semibold text-slate-900">لا توجد رسائل حالياً</p>
          <p className="mt-1 text-sm text-slate-500">أضف رسالة جديدة للبدء.</p>
        </section>
      ) : (
        <section className="space-y-3">
          {messages.map((message, idx) => (
            <article key={message._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-50 px-2 text-xs font-bold text-primary-700">
                  {idx + 1}
                </span>

                <p className="flex-1 text-sm text-slate-800">{message.content}</p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveMessage(idx, 'up')}
                    disabled={idx === 0}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveMessage(idx, 'down')}
                    disabled={idx === messages.length - 1}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(message._id)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">إضافة رسالة جديدة</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">نص الرسالة *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[140px] w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  required
                  data-testid="message-content-input"
                  placeholder="اكتب الرسالة هنا..."
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  data-testid="save-message-btn"
                >
                  <Plus className="h-4 w-4" />
                  إضافة الرسالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
