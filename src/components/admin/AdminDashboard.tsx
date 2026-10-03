import React, { useState, useEffect } from 'react';
import {
  adminGetDashboard,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminSaveProduct,
  adminDeleteProduct,
  adminUpdateStock,
  removeAdminToken,
} from '../../lib/api.ts';
import { Order, Product, Category, Brand, BikeBrand } from '../../types.ts';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Eye,
  Plus,
  Trash2,
  Edit,
  Search,
  MessageCircle,
  Truck,
  CheckCircle2,
  Clock,
  Banknote,
  Boxes,
  Loader2,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  categories: Category[];
  brands: Brand[];
  bikeBrands: BikeBrand[];
  onClose: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  brands,
  bikeBrands,
  onClose,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Products state
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Product Form state
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDiscountPrice, setPDiscountPrice] = useState('');
  const [pStock, setPStock] = useState('10');
  const [pCategoryId, setPCategoryId] = useState('');
  const [pBrandId, setPBrandId] = useState('');
  const [pBikeBrandId, setPBikeBrandId] = useState('');
  const [pBikeModelId, setPBikeModelId] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(false);
  const [pIsPopular, setPIsPopular] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, ordRes, prodRes] = await Promise.all([
        adminGetDashboard(),
        adminGetOrders(orderStatusFilter, orderSearch),
        fetch('/api/products?limit=100').then((r) => r.json()),
      ]);
      setStats(dash.stats);
      setRecentOrders(dash.recentOrders || []);
      setOrders(ordRes.orders || []);
      setProductsList(prodRes.products || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderStatusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrderForView && selectedOrderForView.id === orderId) {
        setSelectedOrderForView({ ...selectedOrderForView, status: newStatus });
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleStockUpdate = async (productId: number, currentStock: number) => {
    const val = prompt('Enter new stock quantity for this product:', String(currentStock));
    if (val === null) return;
    const num = parseInt(val);
    if (isNaN(num) || num < 0) return alert('Please enter a valid non-negative number');

    try {
      await adminUpdateStock(productId, num);
      setProductsList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: num } : p))
      );
      onRefreshData();
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      onRefreshData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPSku(`BM-${Math.floor(1000 + Math.random() * 9000)}`);
    setPPrice('');
    setPDiscountPrice('');
    setPStock('10');
    setPCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setPBrandId(brands[0]?.id ? String(brands[0].id) : '');
    setPBikeBrandId('');
    setPBikeModelId('');
    setPDescription('');
    setPImageUrl('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80');
    setPIsFeatured(false);
    setPIsPopular(false);
    setFormError('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSku(prod.sku);
    setPPrice(String(prod.price));
    setPDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setPStock(String(prod.stock));
    setPCategoryId(String(prod.categoryId));
    setPBrandId(String(prod.brandId));
    setPBikeBrandId(prod.bikeBrandId ? String(prod.bikeBrandId) : '');
    setPBikeModelId(prod.bikeModelId ? String(prod.bikeModelId) : '');
    setPDescription(prod.description);
    setPImageUrl(prod.images?.[0]?.url || '');
    setPIsFeatured(prod.isFeatured);
    setPIsPopular(prod.isPopular);
    setFormError('');
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!pName || !pSku || !pPrice || !pCategoryId || !pBrandId) {
      setFormError('Name, SKU, Price, Category, and Brand are required.');
      return;
    }

    try {
      setSavingProduct(true);
      const payload = {
        name: pName,
        sku: pSku,
        price: parseFloat(pPrice),
        discountPrice: pDiscountPrice ? parseFloat(pDiscountPrice) : null,
        stock: parseInt(pStock) || 0,
        categoryId: parseInt(pCategoryId),
        brandId: parseInt(pBrandId),
        bikeBrandId: pBikeBrandId ? parseInt(pBikeBrandId) : null,
        bikeModelId: pBikeModelId ? parseInt(pBikeModelId) : null,
        description: pDescription,
        isFeatured: pIsFeatured,
        isPopular: pIsPopular,
        images: [
          {
            url: pImageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
            isPrimary: true,
          },
        ],
      };

      await adminSaveProduct(payload, editingProduct?.id);
      setIsProductModalOpen(false);
      loadData();
      onRefreshData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    onClose();
  };

  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedBikeBrandObj = bikeBrands.find((b) => String(b.id) === pBikeBrandId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-zinc-950 text-white border-b border-zinc-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black border border-zinc-700/80 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider">
              Bismillah Motors Admin Console
            </h1>
            <span className="text-[10px] text-zinc-400">Experience the Quality • Jashore Sadar</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white"
          >
            <Eye className="w-3.5 h-3.5" /> View Storefront
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-red-500" /> Orders Management ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-500" /> Products Catalog ({productsList.length})
          </button>
          <button
            onClick={loadData}
            className="ml-auto p-2 bg-white text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Sales</span>
                <span className="text-lg font-black text-red-600 mt-1 block">
                  ৳{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
                </span>
                <span className="text-[10px] text-gray-500">Cash on Delivery</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Orders</span>
                <span className="text-lg font-black text-gray-900 mt-1 block">
                  {stats?.totalOrders || 0}
                </span>
                <span className="text-[10px] text-gray-500">All registered orders</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending Orders</span>
                <span className="text-lg font-black text-amber-700 mt-1 block">
                  {stats?.pendingOrders || 0}
                </span>
                <span className="text-[10px] text-amber-600">Requires dispatch</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Delivered Orders</span>
                <span className="text-lg font-black text-emerald-700 mt-1 block">
                  {stats?.deliveredOrders || 0}
                </span>
                <span className="text-[10px] text-emerald-600">Completed & paid</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Products</span>
                <span className="text-lg font-black text-gray-900 mt-1 block">
                  {stats?.totalProducts || 0}
                </span>
                <span className="text-[10px] text-gray-500">In database</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-red-200 bg-red-50/30 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-red-700 block">Low Stock Alert</span>
                <span className="text-lg font-black text-red-600 mt-1 block">
                  {stats?.lowStockCount || 0}
                </span>
                <span className="text-[10px] text-red-600">Stock ≤ 5 units</span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 uppercase">Recent Orders</h3>
                  <p className="text-xs text-gray-500">Latest customer orders for bike parts</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] border-y border-gray-200">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Total (COD)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                        <td className="p-3">
                          <span className="font-bold text-gray-900 block">{ord.customerName}</span>
                          <span className="text-gray-500 text-[11px] font-mono">{ord.customerPhone}</span>
                        </td>
                        <td className="p-3">{ord.customerDistrict}</td>
                        <td className="p-3 font-bold text-red-600">৳{ord.totalAmount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrderForView(ord)}
                            className="px-2.5 py-1 bg-zinc-900 text-white rounded text-[11px] font-semibold hover:bg-black cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            {/* Filter and search bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold shrink-0 cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-zinc-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  placeholder="Search order ID, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadData()}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] border-y border-gray-200">
                  <tr>
                    <th className="p-3">Order ID & Date</th>
                    <th className="p-3">Customer Information</th>
                    <th className="p-3">Items Ordered</th>
                    <th className="p-3">Total (COD)</th>
                    <th className="p-3">Status Update</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <span className="font-mono font-bold text-gray-900 block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-gray-900 block">{ord.customerName}</span>
                        <span className="text-gray-500 font-mono text-[11px] block">{ord.customerPhone}</span>
                        <span className="text-gray-400 text-[10px]">{ord.customerDistrict}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-gray-800">
                          {ord.items?.length || 0} product(s)
                        </span>
                        <div className="text-[10px] text-gray-500 truncate max-w-xs">
                          {ord.items?.map((i) => i.productName).join(', ')}
                        </div>
                      </td>
                      <td className="p-3 font-extrabold text-red-600">
                        ৳{ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-1 rounded border border-gray-300 bg-white cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForView(ord)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${ord.customerWhatsapp?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              ord.customerName
                            )},%20this%20is%20Bismillah%20Motors%20regarding%20your%20Order%20${ord.orderNumber}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleOpenAddProduct}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Add New Bike Part
                </button>
              </div>

              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  placeholder="Search products by SKU, name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] border-y border-gray-200">
                  <tr>
                    <th className="p-3">Product Name & SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3">Price / Discount</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=80&q=80'}
                            alt=""
                            className="w-9 h-9 rounded object-contain bg-white p-0.5 border border-gray-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block line-clamp-1">
                              {prod.name}
                            </span>
                            <span className="font-mono text-[10px] text-gray-400">SKU: {prod.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{prod.category?.name}</td>
                      <td className="p-3 font-semibold text-red-600">{prod.brand?.name}</td>
                      <td className="p-3">
                        <span className="font-black text-red-600">
                          ৳{(prod.discountPrice ?? prod.price).toLocaleString()}
                        </span>
                        {prod.discountPrice && (
                          <span className="text-[10px] text-gray-400 line-through ml-1.5">
                            ৳{prod.price.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleStockUpdate(prod.id, prod.stock)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                            prod.stock <= 0
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : prod.stock <= 5
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                          title="Click to quickly update stock level"
                        >
                          {prod.stock} Units ✎
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">
                {editingProduct ? 'Edit Motorcycle Part' : 'Add New Motorcycle Part'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProductSubmit} className="space-y-3 overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Part Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yamaha R15 V3 Cylinder Kit"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. YAM-CYL-R15V3"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value.toUpperCase())}
                    className="w-full p-2 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Regular Price (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="7500"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Discount Price (৳)</label>
                  <input
                    type="number"
                    placeholder="6200"
                    value={pDiscountPrice}
                    onChange={(e) => setPDiscountPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category *</label>
                  <select
                    value={pCategoryId}
                    onChange={(e) => setPCategoryId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Brand *</label>
                  <select
                    value={pBrandId}
                    onChange={(e) => setPBrandId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bike Compatibility Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Compatible Bike Brand</label>
                  <select
                    value={pBikeBrandId}
                    onChange={(e) => {
                      setPBikeBrandId(e.target.value);
                      setPBikeModelId('');
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">None / Universal</option>
                    {bikeBrands.map((bb) => (
                      <option key={bb.id} value={bb.id}>
                        {bb.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Compatible Bike Model</label>
                  <select
                    value={pBikeModelId}
                    onChange={(e) => setPBikeModelId(e.target.value)}
                    disabled={!pBikeBrandId}
                    className="w-full p-2 border border-gray-300 rounded disabled:opacity-50"
                  >
                    <option value="">None / All Models</option>
                    {selectedBikeBrandObj?.models.map((bm) => (
                      <option key={bm.id} value={bm.id}>
                        {bm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={pImageUrl}
                  onChange={(e) => setPImageUrl(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsFeatured}
                    onChange={(e) => setPIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="font-bold text-gray-800">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsPopular}
                    onChange={(e) => setPIsPopular(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="font-bold text-gray-800">Popular Product</span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold cursor-pointer"
                >
                  {savingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Order Details</span>
                <h3 className="font-mono font-black text-sm text-gray-900">
                  {selectedOrderForView.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-gray-900">{selectedOrderForView.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-mono text-gray-900">{selectedOrderForView.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">WhatsApp:</span>
                  <span className="font-mono text-gray-900">{selectedOrderForView.customerWhatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Address:</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">
                    {selectedOrderForView.customerAddress}, {selectedOrderForView.customerDistrict}
                  </span>
                </div>
                {selectedOrderForView.notes && (
                  <div className="flex justify-between text-amber-900">
                    <span className="text-gray-500">Notes:</span>
                    <span className="font-medium text-right max-w-xs">{selectedOrderForView.notes}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-2 bg-gray-100 text-[10px] uppercase font-bold text-gray-600 flex justify-between">
                  <span>Part / SKU</span>
                  <span>Qty x Price</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {selectedOrderForView.items?.map((item) => (
                    <div key={item.id} className="p-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-900 block">{item.productName}</span>
                        <span className="font-mono text-[10px] text-gray-400">SKU: {item.productSku}</span>
                      </div>
                      <div className="text-right">
                        <span>
                          {item.quantity} x ৳{item.price}
                        </span>
                        <strong className="block text-red-600 font-bold">
                          ৳{item.subtotal.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-gray-500 block">Total Cash on Delivery:</span>
                  <span className="text-base font-black text-red-600">
                    ৳{selectedOrderForView.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrderForView.status}
                    onChange={(e) => handleStatusChange(selectedOrderForView.id, e.target.value)}
                    className="text-xs font-bold p-2 rounded border border-gray-300 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* WhatsApp direct customer link */}
              <a
                href={`https://wa.me/${selectedOrderForView.customerWhatsapp?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                  selectedOrderForView.customerName
                )},%20this%20is%20Bismillah%20Motors%20regarding%20Order%20${selectedOrderForView.orderNumber}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Customer on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
