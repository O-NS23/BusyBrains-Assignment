import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── Helpers ───────────────────────────────────────── */
const CATEGORIES = ['All', 'Electronics', 'Footwear', 'Clothing', 'Home & Kitchen', 'Books'];

function formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN');
}

function StarRating({ rating = 0 }) {
    return (
        <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? '#f59e0b' : '#374151'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>({rating})</span>
        </div>
    );
}

/* ── Product Form Modal ─────────────────────────────── */
function ProductModal({ product, onClose, onSave }) {
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        imageUrl: product?.imageUrl || '',
        category: product?.category || 'Electronics',
        stock: product?.stock ?? 0,
        rating: product?.rating ?? 0,
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{product ? '✏️ Edit Product' : '➕ New Product'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Product Name *</label>
                            <input name="name" className="form-input" value={form.name} onChange={handleChange} required placeholder="e.g. Apple iPhone 15" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-input" value={form.description} onChange={handleChange} rows={3} placeholder="Product description..." style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Price (₹) *</label>
                                <input name="price" type="number" step="0.01" min="0.01" className="form-input" value={form.price} onChange={handleChange} required placeholder="999" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock</label>
                                <input name="stock" type="number" min="0" className="form-input" value={form.stock} onChange={handleChange} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rating (0-5)</label>
                                <input name="rating" type="number" step="0.1" min="0" max="5" className="form-input" value={form.rating} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Image URL</label>
                            <input name="imageUrl" className="form-input" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Confirm Modal ───────────────────────────── */
function DeleteModal({ product, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false);
    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">🗑️ Delete Product</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{product.name}</strong>? This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Product Card ───────────────────────────────────── */
function ProductCard({ product, isAdmin, onEdit, onDelete }) {
    return (
        <div className="product-card">
            <div className="product-image-wrap">
                <img
                    src={product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=6366f1&color=fff&size=200`}
                    alt={product.name}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=6366f1&color=fff&size=200`; }}
                />
                {product.category && <span className="product-category-tag">{product.category}</span>}
            </div>
            <div className="product-body">
                <div className="product-name">{product.name}</div>
                <div className="product-desc">{product.description || 'No description available.'}</div>
                <div className="product-meta">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <StarRating rating={product.rating} />
                </div>
                <div className="product-stock">
                    {product.stock > 0 ? `✅ In stock (${product.stock})` : '❌ Out of stock'}
                </div>
            </div>
            {isAdmin && (
                <div className="product-actions">
                    <button
                        className="btn btn-secondary btn-sm w-full"
                        onClick={() => onEdit(product)}
                        style={{ justifyContent: 'center' }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm w-full"
                        onClick={() => onDelete(product)}
                        style={{ justifyContent: 'center' }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Dashboard Page ─────────────────────────────────── */
export default function DashboardPage({ externalSearch = '' }) {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [editModal, setEditModal] = useState(null);  // null | 'new' | product
    const [deleteModal, setDeleteModal] = useState(null);

    // Sync external search from navbar
    useEffect(() => {
        if (externalSearch !== undefined) setSearch(externalSearch);
    }, [externalSearch]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            else if (activeCategory !== 'All') params.category = activeCategory;
            const { data } = await productsAPI.getAll(params);
            setProducts(data);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [activeCategory, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleCreate = async (form) => {
        await productsAPI.create(form);
        toast.success('Product created! 🎉');
        fetchProducts();
    };

    const handleUpdate = async (form) => {
        await productsAPI.update(editModal.id, form);
        toast.success('Product updated!');
        fetchProducts();
    };

    const handleDelete = async () => {
        await productsAPI.delete(deleteModal.id);
        toast.success('Product deleted');
        setDeleteModal(null);
        fetchProducts();
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1 className="page-title">
                        {isAdmin() ? '🛠️ Manage Products' : '🛍️ Product Catalog'}
                    </h1>
                    <p className="page-subtitle">
                        {isAdmin()
                            ? 'Create, edit, and delete products as Admin'
                            : `Showing ${products.length} products — browse and discover`}
                    </p>
                </div>
                {isAdmin() && (
                    <button
                        id="add-product-btn"
                        className="btn btn-success"
                        onClick={() => setEditModal('new')}
                    >
                        ➕ Add Product
                    </button>
                )}
            </div>

            {/* Stats (Admin) */}
            {isAdmin() && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{products.length}</div>
                        <div className="stat-label">Total Products</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--success)' }}>
                            {products.filter(p => p.stock > 0).length}
                        </div>
                        <div className="stat-label">In Stock</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                            {[...new Set(products.map(p => p.category).filter(Boolean))].length}
                        </div>
                        <div className="stat-label">Categories</div>
                    </div>
                </div>
            )}

            {/* Search bar */}
            <div style={{ position: 'relative', maxWidth: '420px', marginBottom: '20px' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
                <input
                    id="product-search"
                    type="text"
                    className="form-input"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setActiveCategory('All'); }}
                    style={{ paddingLeft: '40px' }}
                />
            </div>

            {/* Category Pills */}
            {!search && (
                <div className="category-pills">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Products */}
            {loading ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div className="spinner" />
                    <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No products found</h3>
                    <p>{search ? `No results for "${search}"` : 'Try selecting a different category'}</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isAdmin={isAdmin()}
                            onEdit={(p) => setEditModal(p)}
                            onDelete={(p) => setDeleteModal(p)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {editModal && (
                <ProductModal
                    product={editModal === 'new' ? null : editModal}
                    onClose={() => setEditModal(null)}
                    onSave={editModal === 'new' ? handleCreate : handleUpdate}
                />
            )}
            {deleteModal && (
                <DeleteModal
                    product={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}
