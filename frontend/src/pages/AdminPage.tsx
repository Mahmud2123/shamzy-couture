import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/admin';
import { AdminStats, Order, User } from '../types';
import { FiUsers, FiShoppingBag, FiPackage, FiEdit3, FiDollarSign, FiTrendingUp, FiActivity, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PRODUCTION: 'bg-purple-100 text-purple-700', SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'measurements' | 'products' | 'audit'>('overview');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    adminService.getStats().then(setStats).catch(() => toast.error('Failed to load stats')).finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-stone-400 text-sm">SHAMZY COUTURE Management</p>
          </div>
          <Link to="/" className="text-stone-400 hover:text-white text-sm">← Back to Store</Link>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto py-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'orders', label: 'Orders' },
            { key: 'users', label: 'Users' },
            { key: 'products', label: 'Products' },
            { key: 'measurements', label: 'Measurements' },
            { key: 'audit', label: 'Audit Log' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.key ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} loading={loading} />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'measurements' && <MeasurementsTab />}
        {activeTab === 'audit' && <AuditTab />}
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-stone-200 rounded-xl animate-pulse" />)}</div>;
  if (!stats) return <p className="text-stone-500">Failed to load stats</p>;

  const { overview, ordersByStatus, recentOrders, recentUsers } = stats;

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Customers', value: overview.totalUsers, icon: <FiUsers />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Orders', value: overview.totalOrders, icon: <FiShoppingBag />, color: 'text-purple-600 bg-purple-50' },
          { label: 'Products', value: overview.totalProducts, icon: <FiPackage />, color: 'text-green-600 bg-green-50' },
          { label: 'Design Requests', value: overview.totalDesignRequests, icon: <FiEdit3 />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Revenue', value: `$${overview.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <FiDollarSign />, color: 'text-emerald-600 bg-emerald-50', span: true },
        ].map((card) => (
          <div key={card.label} className={`bg-white rounded-xl p-5 shadow-sm ${(card as any).span ? 'col-span-2 lg:col-span-1' : ''}`}>
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>{card.icon}</div>
            <p className="text-2xl font-bold text-stone-900">{card.value}</p>
            <p className="text-stone-500 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><FiTrendingUp /> Orders by Status</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className={`px-4 py-2 rounded-lg text-sm font-semibold ${STATUS_COLORS[status] || 'bg-stone-100 text-stone-700'}`}>
              {status.replace('_', ' ')}: {count}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-stone-800 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-stone-700">{(order.user as any)?.name}</p>
                  <p className="text-xs text-stone-400">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status.replace('_', ' ')}</span>
                  <p className="text-sm font-bold text-stone-800 mt-1">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-stone-800 mb-4">New Customers</h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-700 truncate">{user.name}</p>
                  <p className="text-xs text-stone-400 truncate">{user.email}</p>
                </div>
                <p className="text-xs text-stone-400 whitespace-nowrap">{new Date(user.createdAt!).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [data, setData] = useState<{ orders: Order[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const load = () => {
    setLoading(true);
    adminService.getOrders({ search: search || undefined, status: statusFilter || undefined })
      .then(setData).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search, statusFilter]);

  const openOrder = async (id: string) => {
    const order = await adminService.getOrder(id);
    setSelectedOrder(order);
    setNewStatus(order.status);
    setInternalNotes(order.internalNotes || '');
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const updated = await adminService.updateOrder(selectedOrder.id, { status: newStatus as any, internalNotes, statusNote });
      setSelectedOrder(updated);
      toast.success('Order updated');
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="flex-1 min-w-48 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none">
          <option value="">All Statuses</option>
          {['PENDING','CONFIRMED','IN_PRODUCTION','SHIPPED','DELIVERED','CANCELLED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      {loading ? <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-stone-200 rounded-xl animate-pulse" />)}</div>
      : data?.orders.length === 0 ? <div className="text-center py-16 bg-white rounded-xl text-stone-500">No orders found</div>
      : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>{['Order ID','Customer','Items','Total','Status','Date','Action'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-stone-600 text-xs uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {data?.orders.map((order) => (
                <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3"><p className="font-medium text-stone-800">{(order.user as any)?.name}</p><p className="text-xs text-stone-400">{(order.user as any)?.email}</p></td>
                  <td className="px-4 py-3 text-stone-600">{order.items?.length ?? 0} item(s)</td>
                  <td className="px-4 py-3 font-bold text-stone-800">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>{order.status.replace('_',' ')}</span></td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><button onClick={() => openOrder(order.id)} className="bg-stone-900 text-white px-3 py-1 rounded-lg text-xs hover:bg-stone-700">Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-700 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div><p className="text-stone-400 text-xs">Customer</p><p className="font-semibold">{(selectedOrder.user as any)?.name}</p><p className="text-stone-500">{(selectedOrder.user as any)?.email}</p></div>
              <div><p className="text-stone-400 text-xs">Total</p><p className="font-bold text-lg">${selectedOrder.totalAmount.toFixed(2)}</p></div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-stone-400 mb-1">Items</p>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between py-1 border-b border-stone-100 text-sm">
                  <span>{item.product?.name ?? 'Product'} ×{item.quantity}</span>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {/* Status Logs */}
            {selectedOrder.statusLogs && selectedOrder.statusLogs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-stone-400 mb-2">Status History</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedOrder.statusLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-xs text-stone-600">
                      <span className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[log.status]}`}>{log.status.replace('_',' ')}</span>
                      {log.note && <span className="text-stone-400">— {log.note}</span>}
                      <span className="text-stone-300 ml-auto">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Admin Controls */}
            <div className="bg-stone-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Update Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {['PENDING','CONFIRMED','IN_PRODUCTION','SHIPPED','DELIVERED','CANCELLED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Status Note</label>
                  <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="e.g. Fabric sourced" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Internal Notes</label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none" rows={2} placeholder="Internal notes (not visible to customer)" />
              </div>
              <button onClick={handleUpdate} disabled={updating} className="w-full bg-stone-900 text-white py-2 rounded-xl font-semibold text-sm hover:bg-stone-700 disabled:opacity-60">
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [data, setData] = useState<{ users: any[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'CUSTOMER', isActive: true, newPassword: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.getUsers({ search: search || undefined }).then(setData).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search]);

  const openUser = async (id: string) => {
    const u = await adminService.getUser(id);
    setSelectedUser(u);
    setEditForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, isActive: u.isActive ?? true, newPassword: '' });
  };

  // In AdminPage.tsx, around line 321, update the handleSave function:

const handleSave = async () => {
  if (!selectedUser) return;
  setSaving(true);
  try {
    const { newPassword, ...rest } = editForm;
    await adminService.updateUser(selectedUser.id, { 
      ...rest, 
      role: rest.role as 'ADMIN' | 'CUSTOMER', // Add type assertion
      ...(newPassword ? { newPassword } : {}) 
    });
    toast.success('User updated');
    setSelectedUser(null);
    load();
  } catch { toast.error('Failed to update'); }
  finally { setSaving(false); }
};
  return (
    <div className="space-y-4">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users by name or email..." className="w-full max-w-md border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      {loading ? <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-stone-200 rounded-xl animate-pulse" />)}</div>
      : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>{['User','Role','Orders','Status','Joined','Action'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-stone-600 text-xs uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {data?.users.map((user) => (
                <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3"><p className="font-medium">{user.name}</p><p className="text-xs text-stone-400">{user.email}</p></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>{user.role}</span></td>
                  <td className="px-4 py-3 text-stone-600">{user._count?.orders ?? 0}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><button onClick={() => openUser(user.id)} className="bg-stone-900 text-white px-3 py-1 rounded-lg text-xs hover:bg-stone-700">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Edit User</h2>
              <button onClick={() => setSelectedUser(null)} className="text-stone-400 hover:text-stone-700 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">{label}</label>
                  <input type={type} value={(editForm as any)[key]} onChange={(e) => setEditForm({...editForm, [key]: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Role</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Status</label>
                  <select value={String(editForm.isActive)} onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">New Password <span className="font-normal text-stone-400">(leave blank to keep)</span></label>
                <input type="password" value={editForm.newPassword} onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})} placeholder="Min 6 characters" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              {/* User stats */}
              <div className="flex gap-3 bg-stone-50 rounded-lg p-3">
                {[['Orders', selectedUser._count?.orders], ['Measurements', selectedUser._count?.measurements], ['Design Reqs', selectedUser._count?.designRequests]].map(([l, v]) => (
                  <div key={l as string} className="flex-1 text-center">
                    <p className="font-bold text-stone-800">{v}</p>
                    <p className="text-xs text-stone-400">{l}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-stone-900 text-white py-2.5 rounded-xl font-semibold hover:bg-stone-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'SUITS', stock: '0', status: 'ACTIVE', images: '' });
  const [saving, setSaving] = useState(false);

  const CATS = ['SUITS','SHIRTS','TROUSERS','JACKETS','ACCESSORIES','CUSTOM'];
  const STATUS_BADGE: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-700', INACTIVE: 'bg-red-100 text-red-600', DRAFT: 'bg-stone-100 text-stone-600' };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/products?status=ACTIVE,INACTIVE,DRAFT');
      // Use all statuses — fetch via admin (no status filter)
      const { productsService } = await import('../services/products');
      const all = await productsService.getAll();
      setProducts(all);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (p: any) => { setEditProduct(p); setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, stock: String(p.stock), status: p.status, images: p.images?.join(', ') || '' }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { productsService } = await import('../services/products');
      const payload = { name: form.name, description: form.description, price: Number(form.price), category: form.category as any, stock: Number(form.stock), status: form.status as any, images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (editProduct) { await productsService.update(editProduct.id, payload); toast.success('Product updated'); }
      else { await productsService.create(payload); toast.success('Product created'); }
      setShowForm(false); setEditProduct(null); load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { const { productsService } = await import('../services/products'); await productsService.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-stone-600 text-sm">{products.length} products</p>
        <button onClick={() => { setEditProduct(null); setForm({ name:'',description:'',price:'',category:'SUITS',stock:'0',status:'ACTIVE',images:'' }); setShowForm(true); }} className="bg-stone-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-stone-700">+ New Product</button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-stone-200 rounded-xl animate-pulse" />)}</div>
      : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200"><tr>{['Product','Category','Price','Stock','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-stone-600 text-xs uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{p.name}</td>
                  <td className="px-4 py-3 text-stone-500">{p.category}</td>
                  <td className="px-4 py-3 font-bold">${p.price}</td>
                  <td className="px-4 py-3 text-stone-600">{p.stock}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-xs bg-stone-100 px-3 py-1 rounded-lg hover:bg-stone-200">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              {[{label:'Name',key:'name',type:'text'},{label:'Description',key:'description',type:'textarea'},{label:'Price (USD)',key:'price',type:'number'},{label:'Images (comma-separated URLs)',key:'images',type:'text'}].map(({label,key,type}) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">{label}</label>
                  {type === 'textarea' ? <textarea value={(form as any)[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none" rows={3} />
                  : <input type={type} value={(form as any)[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />}
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold text-stone-600 block mb-1">Category</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none">{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-stone-600 block mb-1">Stock</label><input type="number" value={form.stock} onChange={e => setForm({...form,stock:e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
                <div><label className="text-xs font-semibold text-stone-600 block mb-1">Status</label><select value={form.status} onChange={e => setForm({...form,status:e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none">{['ACTIVE','INACTIVE','DRAFT'].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-stone-900 text-white py-2.5 rounded-xl font-semibold hover:bg-stone-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Measurements Tab ──────────────────────────────────────────────────────────
function MeasurementsTab() {
  const [data, setData] = useState<{ measurements: any[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const load = () => {
    setLoading(true);
    adminService.getMeasurements({ productType: typeFilter || undefined }).then(setData).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [typeFilter]);

  return (
    <div className="space-y-4">
      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none">
        <option value="">All Types</option>
        {['SUIT','SHIRT','TROUSER','JACKET','CUSTOM'].map(t => <option key={t}>{t}</option>)}
      </select>
      {loading ? <div className="h-48 bg-stone-200 rounded-xl animate-pulse" />
      : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200"><tr>{['Customer','Label','Type','Unit','Default','Date'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-stone-600 text-xs uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {data?.measurements.map((m) => (
                <tr key={m.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3"><p className="font-medium">{m.user?.name}</p><p className="text-xs text-stone-400">{m.user?.email}</p></td>
                  <td className="px-4 py-3 text-stone-700">{m.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{m.productType}</span></td>
                  <td className="px-4 py-3 text-stone-500">{m.unit}</td>
                  <td className="px-4 py-3">{m.isDefault ? <span className="text-green-600 font-bold">✓</span> : <span className="text-stone-300">—</span>}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.total === 0 && <p className="text-center py-12 text-stone-400">No measurements found</p>}
        </div>
      )}
    </div>
  );
}

// ── Audit Tab ─────────────────────────────────────────────────────────────────
function AuditTab() {
  const [data, setData] = useState<{ logs: any[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLogs().then(setData).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const ACTION_COLORS: Record<string, string> = {
    UPDATE_USER: 'bg-blue-100 text-blue-700', DEACTIVATE_USER: 'bg-red-100 text-red-600',
    UPDATE_ORDER_STATUS: 'bg-purple-100 text-purple-700', UPDATE_PRODUCT: 'bg-amber-100 text-amber-600',
    DELETE_PRODUCT: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {loading ? <div className="h-48 animate-pulse bg-stone-100" />
      : (
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200"><tr>{['Admin','Action','Entity','Entity ID','Time'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-stone-600 text-xs uppercase">{h}</th>)}</tr></thead>
          <tbody>
            {data?.logs.map((log) => (
              <tr key={log.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-700">{log.user?.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-stone-100 text-stone-600'}`}>{log.action.replace(/_/g,' ')}</span></td>
                <td className="px-4 py-3 text-stone-500">{log.entity}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-400">{log.entityId?.slice(-8) || '—'}</td>
                <td className="px-4 py-3 text-stone-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
