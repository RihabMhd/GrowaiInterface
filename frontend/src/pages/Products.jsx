import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, LayoutGrid, SlidersHorizontal,
         CheckCircle, FileText, Boxes } from 'lucide-react';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';

const StatCard = ({ icon: Icon, iconColor, label, value }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <Icon size={16} color={iconColor} />
      <span className="stat-card-label">{label}</span>
    </div>
    <div className="stat-card-value">{value}</div>
  </div>
);

const Products = () => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct]     = useState(null);
  const [pagination, setPagination]     = useState({ current_page: 1, last_page: 1, total: 0 });
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode]         = useState('grid');
  const [error, setError]               = useState(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 15,
        ...(searchTerm    && { search: searchTerm }),
        ...(filterStatus  && { status: filterStatus }),
      };
      const { data } = await api.get('/products', { params });
      setProducts(data.data);
      setPagination({
        current_page: data.current_page,
        last_page:    data.last_page,
        total:        data.total,
      });
    } catch (err) {
      setError('Failed to load products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Save (create or update) ───────────────────────────────────────────────
  // No shop_id needed — backend resolves it from auth token
  const saveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      setEditingProduct(null);
      await fetchProducts();
      setShowProductModal(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join('\n')
        : err.response?.data?.message || 'Failed to save product';
      alert(message);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(1), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const activeCount    = products.filter(p => p.status === 'active').length;
  const draftCount     = products.filter(p => p.status === 'draft').length;
  const totalInventory = products.reduce((acc, p) => acc + (p.total_stock || 0), 0);

  const now = new Date();
  const syncTime = [
    String(now.getDate()).padStart(2,'0'),
    String(now.getMonth()+1).padStart(2,'0'),
    now.getFullYear()
  ].join('/') + ' ' + [
    String(now.getHours()).padStart(2,'0'),
    String(now.getMinutes()).padStart(2,'0'),
    String(now.getSeconds()).padStart(2,'0'),
  ].join(':');

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditingProduct(null); setShowProductModal(true); };
  const openEdit   = (product) => { setEditingProduct(product); setShowProductModal(true); };
  const closeModal = () => { setShowProductModal(false); setEditingProduct(null); };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="products-page">

      {/* Header */}
      <div className="products-header">
        <div>
          <div className="products-title-wrapper">
            <div className="products-title-icon"><Package size={18} /></div>
            <h1 className="products-title">Products</h1>
          </div>
          <p className="products-subtitle">
            Shopify product catalog
            <span className="products-sync-info">· Last sync {syncTime}</span>
          </p>
        </div>
        <div className="products-button-group">
          <button onClick={openCreate} className="btn-primary-action">
            <Plus size={14} /> New Product
          </button>
          <button className="btn-secondary-action">
            <span>$</span> Connect your Shop
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => fetchProducts()}>Retry</button>
        </div>
      )}

      {/* Stats */}
      {products.length > 0 && (
        <div className="stats-grid">
          <StatCard icon={Package}     iconColor="#60a5fa" label="Total Products"   value={pagination.total} />
          <StatCard icon={CheckCircle} iconColor="#4ade80" label="Active"           value={activeCount} />
          <StatCard icon={FileText}    iconColor="#fb923c" label="Draft"            value={draftCount} />
          <StatCard icon={Boxes}       iconColor="#a78bfa" label="Total Inventory"  value={totalInventory} />
        </div>
      )}

      {/* Search & Filter */}
      {products.length > 0 && (
        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button className={`filter-button ${viewMode === 'grid'  ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
            <LayoutGrid size={15} />
          </button>
          <button className={`filter-button ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
            <SlidersHorizontal size={15} />
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-container"><div className="spinner-dark" /></div>

      ) : products.length === 0 ? (
        <div className="empty-state-container">
          <div className="empty-state-icon"><Package size={32} /></div>
          <h3 className="empty-state-title">Your catalog is empty</h3>
          <p className="empty-state-text">
            Create products manually or connect Shopify to import yours.
          </p>
          <div className="empty-state-actions">
            <button onClick={openCreate} className="btn-primary-action">
              <Plus size={14} /> New Product
            </button>
            <button className="btn-secondary-action">
              <span>$</span> Connect your Shop
            </button>
          </div>
        </div>

      ) : viewMode === 'grid' ? (
        <GridView products={products} onEdit={openEdit} onDelete={deleteProduct} />
      ) : (
        <TableView products={products} onEdit={openEdit} onDelete={deleteProduct} pagination={pagination} />
      )}

      {/* Modal — no shopId prop needed anymore */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={closeModal} className="modal-close">×</button>
            <ProductForm
              product={editingProduct}
              onSave={saveProduct}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Grid View ──────────────────────────────────────────────────────────────
const GridView = ({ products, onEdit, onDelete }) => (
  <div>
    <div className="products-grid">
      {products.map(product => {
        const price  = product.min_price || product.variants?.[0]?.price || 0;
        const cost   = product.cost || (price * 0.5);
        const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
        const stock  = product.total_stock || 0;
        return (
          <div key={product.id} className="product-card">
            {product.image
              ? <img src={product.image} alt={product.title} className="product-card-image" />
              : <div className="product-card-image-placeholder"><Package size={28} /></div>
            }
            <div className="product-card-header">
              <span className="product-card-title">{product.title}</span>
              <span className={`status-badge status-${product.status || 'draft'}`}>
                {(product.status || 'draft').toUpperCase()}
              </span>
            </div>
            <div className="product-card-meta">{product.type || 'General'}</div>
            <div className="product-card-price">${Number(price).toFixed(2)}</div>
            {stock > 0 && <div className="product-card-stock">{stock} in stock</div>}
            <div className="product-card-cost">
              <span className="product-card-cost-label">Cost: </span>
              <span className="product-card-cost-value">${Number(cost).toFixed(2)}</span>
              <span style={{ marginLeft:'auto', color: margin >= 30 ? 'var(--success)' : 'var(--warning)', fontWeight:'600' }}>
                {margin}%
              </span>
            </div>
            <div className="product-card-actions">
              <button onClick={() => onEdit(product)}   className="btn-edit">Edit</button>
              <button onClick={() => onDelete(product.id)} className="btn-delete">Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Table View ─────────────────────────────────────────────────────────────
const TableView = ({ products, onEdit, onDelete, pagination }) => (
  <div className="card">
    <div style={{ overflowX: 'auto' }}>
      <table className="products-table">
        <thead>
          <tr>
            {['PRODUCT','SOURCE','STATUS','TYPE','VENDOR','PRICE','COST','MARGIN','ACTIONS']
              .map(col => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {products.map(product => {
            const price  = product.min_price || product.variants?.[0]?.price || 0;
            const cost   = product.cost || (price * 0.5);
            const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
            return (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    {product.image
                      ? <img src={product.image} alt={product.title} className="product-image" />
                      : <div className="product-image-placeholder"><Package size={18} /></div>
                    }
                    <span className="product-name">{product.title}</span>
                  </div>
                </td>
                <td><span className="cell-text">{product.source_type || 'Manual'}</span></td>
                <td>
                  <span className={`status-badge status-${product.status || 'draft'}`}>
                    {(product.status || 'draft').toUpperCase()}
                  </span>
                </td>
                <td className="cell-text">{product.product_type || '-'}</td>
                <td className="cell-text">{product.vendor || '-'}</td>
                <td className="cell-text-strong">${Number(price).toFixed(2)}</td>
                <td className="cell-text-warning">${Number(cost).toFixed(2)}</td>
                <td className={margin >= 30 ? 'cell-text-success' : 'cell-text-strong'}>{margin}%</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => onEdit(product)}      className="btn-edit">Edit</button>
                    <button onClick={() => onDelete(product.id)} className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div className="table-footer">
      Showing {products.length} of {pagination.total} products
    </div>
  </div>
);

export default Products;
