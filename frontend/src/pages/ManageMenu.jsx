import { useState, useEffect } from 'react';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, subscribeToDataChanges } from '../dataStore';
import { Link } from 'react-router-dom';

const ManageMenu = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterCat, setFilterCat] = useState('All');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Meals',
        isVeg: true,
        prepTime: '5-10 mins',
        description: '',
        image: '',
        isAvailable: true
    });

    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchMenu();
        return subscribeToDataChanges(fetchMenu);
    }, []);

    const fetchMenu = () => {
        setMenu(getMenu());
        setLoading(false);
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditId(item._id);
            setFormData({
                name: item.name,
                price: item.price,
                category: item.category || 'Meals',
                isVeg: item.isVeg !== undefined ? item.isVeg : true,
                prepTime: item.prepTime || '5-10 mins',
                description: item.description || '',
                image: item.image || '',
                isAvailable: item.isAvailable !== false
            });
        } else {
            setEditId(null);
            setFormData({
                name: '',
                price: '',
                category: 'Meals',
                isVeg: true,
                prepTime: '5-10 mins',
                description: '',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
                isAvailable: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) {
            updateMenuItem(editId, formData);
        } else {
            addMenuItem(formData);
        }
        setShowModal(false);
        fetchMenu();
    };

    const toggleAvailability = async (id, currentStatus) => {
        updateMenuItem(id, { isAvailable: !currentStatus });
        fetchMenu();
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this menu item?')) return;
        deleteMenuItem(id);
        fetchMenu();
    };

    const filteredMenu = filterCat === 'All' ? menu : menu.filter(m => m.category === filterCat);

    return (
        <div className="manage-menu-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="header-title" style={{ margin: 0 }}>Canteen Menu Manager</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                        Add new dishes, update pricing, manage live stock availability
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/owner-dashboard" className="btn btn-outline">
                        ← Back to Order Queue
                    </Link>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        + Add New Dish
                    </button>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                {['All', 'Meals', 'Snacks', 'Beverages', 'Desserts'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCat(cat)}
                        style={{
                            padding: '0.45rem 1rem',
                            borderRadius: '2rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: filterCat === cat ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: filterCat === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: filterCat === cat ? '#fff' : 'var(--color-text)',
                            cursor: 'pointer'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem auto' }}></div>
                    <p style={{ color: 'var(--color-text-muted)' }}>Loading menu catalogue...</p>
                </div>
            ) : filteredMenu.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p>No food items found in this category.</p>
                </div>
            ) : (
                <div className="food-grid">
                    {filteredMenu.map((item) => (
                        <div className="card" key={item._id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div className="food-img-container" style={{ height: '160px', position: 'relative' }}>
                                <img src={item.image} alt={item.name} className="food-img" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                
                                {/* Veg/NonVeg dot */}
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    background: 'white',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: item.isVeg === false ? '#e23744' : '#28a745'
                                    }}></div>
                                </div>

                                <div className={`food-badge ${item.isAvailable ? 'available' : ''}`}>
                                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                                </div>
                            </div>

                            <div className="food-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1.25rem' }}>
                                <div className="food-header" style={{ marginBottom: '0.4rem' }}>
                                    <h3 className="food-title" style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                                    <span className="food-price" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>₹{item.price}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.8rem' }}>
                                    <span>Category: <strong>{item.category}</strong></span>
                                    <span>Prep: <strong>{item.prepTime || '5-10m'}</strong></span>
                                </div>

                                {item.description && (
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', flex: 1, lineHeight: 1.4 }}>
                                        {item.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexDirection: 'column' }}>
                                    <button
                                        className={`btn ${item.isAvailable ? 'btn-outline' : 'btn-secondary'}`}
                                        style={{
                                            padding: '0.5rem',
                                            fontSize: '0.85rem',
                                            borderColor: item.isAvailable ? '#e23744' : '#28a745',
                                            color: item.isAvailable ? '#e23744' : '#28a745'
                                        }}
                                        onClick={() => toggleAvailability(item._id, item.isAvailable)}
                                    >
                                        {item.isAvailable ? '🚫 Mark Out of Stock' : '✓ Mark In Stock'}
                                    </button>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleOpenModal(item)}>
                                            ✏️ Edit
                                        </button>
                                        <button className="btn btn-danger" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => deleteItem(item._id)}>
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Add / Edit */}
            {showModal && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(6px)', zIndex: 9999 }}>
                    <div className="modal-content" style={{ maxWidth: '500px', borderRadius: '1.25rem' }}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.3rem' }}>{editId ? 'Edit Dish Details' : 'Add New Food Item'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Dish Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Masala Dosa, Paneer Roll..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="60"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Meals">Meals</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Desserts">Desserts</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Dietary Type</label>
                                    <select
                                        className="form-input"
                                        value={formData.isVeg ? 'veg' : 'nonveg'}
                                        onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                                    >
                                        <option value="veg">🌱 Pure Vegetarian</option>
                                        <option value="nonveg">🍗 Non-Vegetarian</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Estimated Prep Time</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 5-8 mins"
                                        value={formData.prepTime}
                                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Description / Ingredients</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    placeholder="Short description of the food item..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Food Image URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://images.unsplash.com/..."
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="isAvailCheck"
                                    checked={formData.isAvailable}
                                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                />
                                <label htmlFor="isAvailCheck" style={{ margin: 0, fontWeight: 600, cursor: 'pointer' }}>
                                    Available for immediate ordering
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}>
                                {editId ? 'Save Changes' : 'Add Item to Menu'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;
