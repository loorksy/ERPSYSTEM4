import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MessageSquare, Plus, X, GripVertical, Trash2 } from 'lucide-react';

const Messages = () => {
  const { api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  const fetchData = async () => {
    try {
      const response = await api.get('/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/api/messages', { content, order: messages.length });
    setShowModal(false);
    setContent('');
    fetchData();
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      await api.delete(`/api/messages/${messageId}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6" data-testid="messages-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ترتيب الرسائل</h1>
          <p className="text-slate-500 mt-1">إدارة وترتيب الرسائل الجاهزة</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-message-btn">
          <Plus className="w-4 h-4" />
          إضافة رسالة
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <MessageSquare className="empty-state-icon" />
            <p className="empty-state-title">لا توجد رسائل</p>
            <p className="empty-state-text">أضف رسالة جديدة للبدء</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message, idx) => (
            <div key={message._id} className="card p-4 flex items-center gap-4">
              <div className="cursor-grab text-slate-300 hover:text-slate-500">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-info">{idx + 1}</span>
                  <p className="text-slate-900">{message.content}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(message._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة رسالة</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">نص الرسالة *</label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input min-h-[120px]" required data-testid="message-content-input" placeholder="اكتب الرسالة هنا..." />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-message-btn">إضافة الرسالة</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
