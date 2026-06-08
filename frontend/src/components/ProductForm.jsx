import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    vendor: '',
    product_type: '',
    handle: '',
    status: 'active',
    tags_string: '',
    image: '',
    description: '',
    variants: [
      {
        title: 'Default Title',
        price: 0,
        compare_at_price: '',
        sku: '',
        cost: '',
        stock: 0
      }
    ]
  });

  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Load product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        vendor: product.vendor || '',
        product_type: product.product_type || '',
        handle: product.handle || '',
        status: product.status || 'active',
        tags_string: product.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : '',
        image: product.image || '',
        description: product.description || '',
        variants: product.variants && product.variants.length > 0 ? product.variants : [{
          title: 'Default Title',
          price: 0,
          compare_at_price: '',
          sku: '',
          cost: '',
          stock: 0
        }]
      });
      setImageUrl(product.image || '');
    }
  }, [product]);

  // Auto-generate handle from title
  const generateHandle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title: title,
      handle: generateHandle(title)
    });
    // Clear title error if exists
    if (errors.title) {
      setErrors({ ...errors, title: null });
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData({ ...formData, variants: updatedVariants });

    // Clear variant errors if exists
    if (errors[`variants.${index}.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`variants.${index}.${field}`];
      setErrors(newErrors);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          title: `Variant ${formData.variants.length + 1}`,
          price: 0,
          compare_at_price: '',
          sku: '',
          cost: '',
          stock: 0
        }
      ]
    });
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: updatedVariants });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, GIF, AVIF)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    // Show instant local preview while uploading
    const localPreview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image: localPreview }));

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const { data } = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Replace local blob URL with real server URL
      setFormData(prev => ({ ...prev, image: data.url }));
      setImageUrl(data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      // Revert preview on failure
      setFormData(prev => ({ ...prev, image: '' }));
      setImageUrl('');
      alert(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleImageUpload(fakeEvent);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }

    
    if (!formData.handle || formData.handle.trim() === '') {
      newErrors.handle = 'Handle is required';
    }

    formData.variants.forEach((variant, index) => {
      if (!variant.title || variant.title.trim() === '') {
        newErrors[`variants.${index}.title`] = 'Variant title is required';
      }
      if (variant.price < 0) {
        newErrors[`variants.${index}.price`] = 'Price cannot be negative';
      }
      if (variant.stock < 0) {
        newErrors[`variants.${index}.stock`] = 'Stock cannot be negative';
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert('HANDLE SUBMIT CALLED');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSaving(true);

    const submitData = {
      ...formData,
      tags_string: formData.tags_string,
      variants: formData.variants.map(v => ({
        ...v,
        price: parseFloat(v.price) || 0,
        compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        cost: v.cost ? parseFloat(v.cost) : null,
        stock: parseInt(v.stock) || 0
      }))
    };

    try {
      await onSave(submitData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h2>{product ? '✏️ Edit Product' : '➕ New Product'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>

          {/* Title */}
          <div className="form-field">
            <label className="field-label">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g., Premium black T-shirt"
              className={`form-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Vendor and Product Type Row */}
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g., Nike, Adidas"
                className="form-input"
              />
              <small className="field-hint">Brand or manufacturer name</small>
            </div>
            <div className="form-field">
              <label className="field-label">Product type</label>
              <input
                type="text"
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                placeholder="e.g., T-Shirt, Shoes"
                className="form-input"
              />
              <small className="field-hint">Category or product family</small>
            </div>
          </div>

          {/* Handle */}
          <div className="form-field">
            <label className="field-label">Handle (slug)</label>
            <input
              type="text"
              value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
              placeholder="premium-black-tshirt"
              className={`form-input ${errors.handle ? 'error' : ''}`}
            />
            <small className="field-hint">Unique URL-friendly identifier (auto-generated from title)</small>
            {errors.handle && <span className="error-message">{errors.handle}</span>}
          </div>

          {/* Status and Tags Row */}
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-field">
              <label className="field-label">Tags</label>
              <input
                type="text"
                value={formData.tags_string}
                onChange={(e) => setFormData({ ...formData, tags_string: e.target.value })}
                placeholder="summer, men, cotton"
                className="form-input"
              />
              <small className="field-hint">Comma-separated tags for better organization</small>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="form-section">
          <h3 className="section-title">Image</h3>

          <div
            className="image-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {formData.image ? (
              <div className="image-preview">
                <img src={formData.image} alt="Product preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setFormData({ ...formData, image: '' });
                    setImageUrl('');
                  }}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
                <div className="dropzone-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 4v16M4 12h16" stroke="currentColor" strokeLinecap="round" />
                  </svg>
                  <p>Drop an image here or click to upload</p>
                  <span className="file-types">PNG · JPG · WEBP · GIF · AVIF — up to 10 MB</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {uploading && (
              <div className="uploading">
                <div className="spinner-small"></div>
                <span>Uploading...</span>
              </div>
            )}

            <button
              type="button"
              className="url-toggle-btn"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              {showUrlInput ? '▲ Hide URL input' : '▼ Or paste an image URL'}
            </button>

            {showUrlInput && (
              <div className="url-input">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
                <button
                  type="button"
                  className="apply-url-btn"
                  onClick={() => {
                    if (imageUrl) {
                      setFormData({ ...formData, image: imageUrl });
                      setShowUrlInput(false);
                    }
                  }}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="form-section">
          <h3 className="section-title">Description</h3>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description"
            rows="4"
            className="form-textarea"
          />
          <small className="field-hint">Optional description - supports HTML formatting</small>
        </div>

        {/* Variants Section */}
        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">Variants</h3>
            <button type="button" className="add-variant-btn" onClick={addVariant}>
              + Add variant
            </button>
          </div>

          {formData.variants.map((variant, index) => (
            <div key={index} className="variant-card">
              <div className="variant-header">
                <h4 className="variant-title">{variant.title}</h4>
                {index > 0 && (
                  <button
                    type="button"
                    className="remove-variant-btn"
                    onClick={() => removeVariant(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="variant-grid">
                <div className="variant-field">
                  <label className="field-label">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={variant.title}
                    onChange={(e) => handleVariantChange(index, 'title', e.target.value)}
                    className={`form-input ${errors[`variants.${index}.title`] ? 'error' : ''}`}
                    placeholder="e.g., Small, Red, 32GB"
                  />
                  {errors[`variants.${index}.title`] && (
                    <span className="error-message">{errors[`variants.${index}.title`]}</span>
                  )}
                </div>

                <div className="variant-field">
                  <label className="field-label">
                    Price <span className="required">*</span>
                  </label>
                  <div className="currency-input">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      className={`form-input ${errors[`variants.${index}.price`] ? 'error' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors[`variants.${index}.price`] && (
                    <span className="error-message">{errors[`variants.${index}.price`]}</span>
                  )}
                </div>

                <div className="variant-field">
                  <label className="field-label">Compare at</label>
                  <div className="currency-input">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.compare_at_price}
                      onChange={(e) => handleVariantChange(index, 'compare_at_price', e.target.value)}
                      className="form-input"
                      placeholder="Original price"
                    />
                  </div>
                  <small className="field-hint">Original price (for sale display)</small>
                </div>

                <div className="variant-field">
                  <label className="field-label">SKU</label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                    className="form-input"
                    placeholder="SKU-001"
                  />
                  <small className="field-hint">Stock keeping unit</small>
                </div>

                <div className="variant-field">
                  <label className="field-label">Cost</label>
                  <div className="currency-input">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.cost}
                      onChange={(e) => handleVariantChange(index, 'cost', e.target.value)}
                      className="form-input"
                      placeholder="Cost per item"
                    />
                  </div>
                  <small className="field-hint">Your cost per item</small>
                </div>

                <div className="variant-field">
                  <label className="field-label">
                    Stock <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                    className={`form-input ${errors[`variants.${index}.stock`] ? 'error' : ''}`}
                    placeholder="0"
                  />
                  {errors[`variants.${index}.stock`] && (
                    <span className="error-message">{errors[`variants.${index}.stock`]}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <>
                <div className="spinner-small"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>{product ? 'Update product' : 'Create product'}</span>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .product-form-container {
          max-width: 900px;
          margin: 0 auto;
          background: var(--bg-card);
          border-radius: 12px;
          overflow: hidden;
        }

        .form-header {
          padding: 24px 28px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-app);
        }

        .form-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        form {
          padding: 28px;
        }

        .form-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 0;
        }

        .form-field {
          margin-bottom: 20px;
        }

        .form-field:last-child {
          margin-bottom: 0;
        }

        .field-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .required {
          color: var(--danger);
          margin-left: 4px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg-app);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-main);
          font-size: 14px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(105, 147, 255, 0.1);
        }

        .form-input.error {
          border-color: var(--danger);
        }

        .error-message {
          display: block;
          font-size: 12px;
          color: var(--danger);
          margin-top: 4px;
        }

        .field-hint {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .currency-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .currency-input .form-input {
          padding-left: 28px;
        }

        .image-upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          background: var(--bg-app);
          transition: all 0.2s;
        }

        .image-upload-area:hover {
          border-color: var(--primary);
          background: rgba(105, 147, 255, 0.02);
        }

        .dropzone {
          cursor: pointer;
          padding: 32px;
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .dropzone-content svg {
          color: var(--text-muted);
        }

        .dropzone-content p {
          font-size: 14px;
          color: var(--text-main);
          margin: 0;
        }

        .file-types {
          font-size: 12px;
          color: var(--text-muted);
        }

        .image-preview {
          position: relative;
          display: inline-block;
        }

        .image-preview img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s;
        }

        .remove-image-btn:hover {
          transform: scale(1.1);
        }

        .uploading {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 14px;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .url-toggle-btn {
          margin-top: 16px;
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          padding: 8px;
          transition: all 0.2s;
        }

        .url-toggle-btn:hover {
          color: var(--purple);
        }

        .url-input {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .url-input .form-input {
          flex: 1;
        }

        .apply-url-btn {
          padding: 10px 20px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .apply-url-btn:hover {
          background: var(--purple);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .add-variant-btn {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .add-variant-btn:hover {
          background: var(--primary);
          color: white;
        }

        .variant-card {
          background: var(--bg-app);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .variant-card:hover {
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .variant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .variant-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }

        .remove-variant-btn {
          padding: 4px 12px;
          background: var(--danger-light);
          color: var(--danger);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .remove-variant-btn:hover {
          background: var(--danger);
          color: white;
        }

        .variant-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .variant-field {
          margin-bottom: 0;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 24px;
          margin-top: 24px;
          border-top: 1px solid var(--border-color);
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--purple);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(105, 147, 255, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-main);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-app);
          border-color: var(--text-muted);
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          form {
            padding: 20px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .variant-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column-reverse;
          }
          
          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductForm;