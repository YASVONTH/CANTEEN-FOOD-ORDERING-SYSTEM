import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const ManageMenu = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Meals',
        image: '',
        isAvailable: true
    });

    const [editId, setEditId] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/menu`);
            const data = await res.json();
            setMenu(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditId(item._id);
            setFormData({
                name: item.name,
                price: item.price,
                category: item.category,
                image: item.image,
                isAvailable: item.isAvailable
            });
        } else {
            setEditId(null);
            setFormData({
                name: '',
                price: '',
                category: 'Meals',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                isAvailable: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editId
            ? `${API_BASE_URL}/menu/${editId}`
            : `${API_BASE_URL}/menu`;

        const method = editId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                fetchMenu();
            } else {
                alert('Failed to save Food Item');
            }
        } catch (err) {
            alert('Error saving data');
        }
    };

    const toggleAvailability = async (id, currentStatus) => {
        try {
            await fetch(`${API_BASE_URL}/menu/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ isAvailable: !currentStatus })
            });
            fetchMenu();
        } catch (err) {
            alert('Failed to update availability');
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await fetch(`${API_BASE_URL}/menu/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            fetchMenu();
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    return (
        <div>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="header-title" style={{ margin: 0 }}>Manage Menu</h1>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        + Add New Item
                    </button>
                </div>

                {loading ? (
                    <p>Loading menu items...</p>
                ) : (
                    <div className="food-grid">
                        {menu.map(item => (
                            <div className="card" key={item._id}>
                                <div className="food-img-container" style={{ height: '150px' }}>
                                    <img src={item.image} alt={item.name} className="food-img" style={{ objectFit: 'cover' }} />
                                    <div className={`food-badge ${item.isAvailable ? 'available' : ''}`}>
                                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                                    </div>
                                </div>

                                <div className="food-content">
                                    <div className="food-header">
                                        <h3 className="food-title" style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                                        <span className="food-price">₹{item.price}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexDirection: 'column' }}>
                                        <button
                                            className={`btn ${item.isAvailable ? 'btn-outline' : 'btn-secondary'}`}
                                            style={{ padding: '0.5rem' }}
                                            onClick={() => toggleAvailability(item._id, item.isAvailable)}
                                        >
                                            Mark {item.isAvailable ? 'Out of Stock' : 'Available'}
                                        </button>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleOpenModal(item)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-danger" style={{ flex: 1, padding: '0.5rem' }} onClick={() => deleteItem(item._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Food Item' : 'Add New Food Item'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Food Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Price (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
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

                            <div className="form-group">
                                <label className="form-label">Image URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="isNavailable"
                                    checked={formData.isAvailable}
                                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                />
                                <label htmlFor="isNavailable" style={{ margin: 0 }}>Available in menu</label>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                {editId ? 'Update Item' : 'Save Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;
