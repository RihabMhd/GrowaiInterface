import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 15,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
      };

      const response = await api.get('/products', { params });
      setProducts(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
        alert('Product updated successfully');
      } else {
        await api.post('/products', productData);
        alert('Product created successfully');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(1), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">Manage your product catalog</div>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductModal(true);
          }}
          className="btn btn-primary"
        >
          + New product
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p>No products found. Create your first product!</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Vendor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      {product.image && (
                        <img src={product.image} alt={product.title} className="product-thumb" />
                      )}
                      <div>
                        <div className="product-title">{product.title}</div>
                        <div className="product-handle">{product.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>${product.min_price || product.variants?.[0]?.price || 0}</td>
                  <td>{product.total_stock || 0} units</td>
                  <td>{product.vendor || '-'}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductModal(true);
                      }}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowProductModal(false)}>
              ×
            </button>
            <ProductForm
              product={editingProduct}
              onSave={saveProduct}
              onCancel={() => {
                setShowProductModal(false);
                setEditingProduct(null);
              }}
              shopId={1}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th {
          text-align: left;
          padding: 16px 20px;
          background: var(--bg-app);
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .products-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
        }

        .product-title {
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .product-handle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-active {
          background: var(--success-light);
          color: var(--success);
        }

        .status-draft {
          background: var(--warning-light);
          color: var(--warning);
        }

        .status-archived {
          background: var(--danger-light);
          color: var(--danger);
        }

        .action-btn {
          padding: 6px 12px;
          margin: 0 4px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .edit-btn {
          background: var(--primary-light);
          color: var(--primary);
        }

        .delete-btn {
          background: var(--danger-light);
          color: var(--danger);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          overflow-y: auto;
        }

        .modal-content {
          position: relative;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--bg-card);
          border-radius: 12px;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: var(--bg-app);
          border: none;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default Products;