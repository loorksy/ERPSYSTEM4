import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X } from 'lucide-react';

const Clients = () => {
  const { clients, createClient, updateClient, deleteClient } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingClient) {
      await updateClient(editingClient._id, formData);
    } else {
      await createClient(formData);
    }
    setShowModal(false);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      await deleteClient(clientId);
    }
  };

  return (
    <div className="space-y-6" data-testid="clients-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">بيانات العملاء</h1>
          <p className="text-slate-500 mt-1">إدارة قاعدة بيانات العملاء</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          data-testid="add-client-btn"
        >
          <Plus className="w-4 h-4" />
          إضافة عميل جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pr-11"
          placeholder="ابحث عن عميل..."
          data-testid="search-clients-input"
        />
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Users className="empty-state-icon" />
            <p className="empty-state-title">
              {searchQuery ? 'لا توجد نتائج' : 'لا يوجد عملاء'}
            </p>
            <p className="empty-state-text">
              {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'أضف عميلاً جديداً للبدء'}
            </p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>رقم الهاتف</th>
                  <th>البريد الإلكتروني</th>
                  <th>العنوان</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={client._id}>
                    <td className="font-medium text-slate-900">{client.name}</td>
                    <td>
                      {client.phone ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {client.email ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {client.address ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{client.address}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(client)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          data-testid={`edit-client-${client._id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          data-testid={`delete-client-${client._id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content w-full max-w-lg mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    required
                    data-testid="client-name-input"
                  />
                </div>
                
                <div>
                  <label className="label">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input"
                    data-testid="client-phone-input"
                  />
                </div>
                
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input"
                    data-testid="client-email-input"
                  />
                </div>
                
                <div>
                  <label className="label">العنوان</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input"
                    data-testid="client-address-input"
                  />
                </div>
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="input min-h-[100px]"
                    data-testid="client-notes-input"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-client-btn">
                    {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
