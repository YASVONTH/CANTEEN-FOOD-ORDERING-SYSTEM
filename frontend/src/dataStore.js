// CanteenHub Real-Time Unified Data & Storage Engine

const MENU_KEY = 'canteenhub_live_menu_v2';
const USERS_KEY = 'canteenhub_live_users_v2';
const ORDERS_KEY = 'canteenhub_live_orders_v2';
const SETTINGS_KEY = 'canteenhub_live_settings_v2';

const initialMenu = [
    {
        _id: 'item-masala-dosa',
        name: 'Crispy Masala Dosa',
        price: 60,
        category: 'Meals',
        isVeg: true,
        prepTime: '8-10 mins',
        description: 'Golden crispy crepe filled with spiced potato masala, served with coconut chutney & sambar.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-veg-noodles',
        name: 'Hakka Veg Noodles',
        price: 80,
        category: 'Meals',
        isVeg: true,
        prepTime: '10-12 mins',
        description: 'Wok-tossed noodles with fresh julienne vegetables, soy sauce, and aromatic Asian herbs.',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-chicken-biryani',
        name: 'Special Chicken Dum Biryani',
        price: 150,
        category: 'Meals',
        isVeg: false,
        prepTime: '5 mins',
        description: 'Fragrant basmati rice slow-cooked with tender spiced chicken pieces, served with raita.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-paneer-butter-masala',
        name: 'Paneer Butter Masala Combo',
        price: 130,
        category: 'Meals',
        isVeg: true,
        prepTime: '10 mins',
        description: 'Rich cottage cheese in creamy tomato gravy served with 2 warm butter parottas.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-cold-coffee',
        name: 'Thick Cold Coffee with Ice Cream',
        price: 50,
        category: 'Beverages',
        isVeg: true,
        prepTime: '3 mins',
        description: 'Chilled blended brewed coffee with rich milk, cocoa drizzle, and vanilla scoop.',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-fresh-lime-soda',
        name: 'Fresh Mint Lime Soda',
        price: 35,
        category: 'Beverages',
        isVeg: true,
        prepTime: '2 mins',
        description: 'Zesty sparkling lime cooler with crushed mint and rock salt.',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-samosa-plate',
        name: 'Crispy Punjabi Samosa (2 Pcs)',
        price: 30,
        category: 'Snacks',
        isVeg: true,
        prepTime: '2 mins',
        description: 'Flaky pastry stuffed with spiced potatoes and green peas, with sweet tamarind and mint chutneys.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-veg-sandwich',
        name: 'Grilled Cheese Corn Sandwich',
        price: 65,
        category: 'Snacks',
        isVeg: true,
        prepTime: '7 mins',
        description: 'Toasted golden bread packed with mozzarella, sweet corn, bell peppers and herbs.',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-gulab-jamun',
        name: 'Hot Gulab Jamun (2 Pcs)',
        price: 40,
        category: 'Desserts',
        isVeg: true,
        prepTime: '1 min',
        description: 'Soft melt-in-mouth milk dumplings soaked in cardamom and saffron sugar syrup.',
        image: 'https://images.unsplash.com/photo-1596700813958-e4b7c1af8ff7?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'item-choco-brownie',
        name: 'Warm Sizzling Choco Brownie',
        price: 85,
        category: 'Desserts',
        isVeg: true,
        prepTime: '4 mins',
        description: 'Decadent dark chocolate fudge brownie with chocolate fudge sauce.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    }
];

const defaultUsers = [
    {
        _id: 'admin-master',
        name: 'Canteen Manager',
        studentId: 'admin',
        password: '2067',
        role: 'admin',
        userType: 'Staff',
        email: 'admin@canteenhub.edu'
    },
    {
        _id: 'student-sample',
        name: 'Yasvonth',
        studentId: '927621CS001',
        password: 'password123',
        role: 'student',
        regNo: '927621CS001',
        userType: 'Dayscholar',
        email: 'yasvonth@student.edu'
    }
];

// Helper functions for LocalStorage read/write
const read = (key, fallback) => {
    try {
        const stored = localStorage.getItem(key);
        return stored === null ? fallback : JSON.parse(stored);
    } catch {
        return fallback;
    }
};

const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for real-time reactive sync across components and browser tabs
    window.dispatchEvent(new Event('canteenhub-data-change'));
};

export const makeId = (prefix = 'id') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${timestamp}-${random}`;
};

// ---------------- MENU OPERATIONS ----------------
export const getMenu = () => {
    const menu = read(MENU_KEY, null);
    if (menu && menu.length > 0) return menu;
    write(MENU_KEY, initialMenu);
    return initialMenu;
};

export const addMenuItem = (item) => {
    const menu = getMenu();
    const created = {
        ...item,
        _id: makeId('item'),
        price: Number(item.price),
        isAvailable: item.isAvailable !== false,
        isVeg: item.isVeg !== undefined ? item.isVeg : true,
        prepTime: item.prepTime || '5-10 mins'
    };
    write(MENU_KEY, [created, ...menu]);
    return created;
};

export const updateMenuItem = (id, updates) => {
    const menu = getMenu();
    const updated = menu.map((item) =>
        item._id === id
            ? {
                ...item,
                ...updates,
                price: updates.price === undefined ? item.price : Number(updates.price)
            }
            : item
    );
    write(MENU_KEY, updated);
    return updated.find((item) => item._id === id);
};

export const deleteMenuItem = (id) => {
    const menu = getMenu().filter((item) => item._id !== id);
    write(MENU_KEY, menu);
};

// ---------------- USER AUTH OPERATIONS ----------------
export const getUsers = () => {
    const users = read(USERS_KEY, null);
    if (users && users.length > 0) return users;
    write(USERS_KEY, defaultUsers);
    return defaultUsers;
};

export const registerUser = (formData) => {
    const users = getUsers();
    const username = (formData.username || formData.studentId || '').trim();

    if (users.some((u) => u.studentId.toLowerCase() === username.toLowerCase())) {
        throw new Error('This Student ID / Username is already registered. Please login.');
    }

    const newUser = {
        _id: makeId('user'),
        name: formData.name.trim(),
        studentId: username,
        password: formData.password,
        role: formData.role || 'student',
        regNo: formData.regNo || username,
        userType: formData.userType || 'Dayscholar',
        email: formData.email ? formData.email.trim() : `${username}@student.edu`,
        createdAt: new Date().toISOString()
    };

    write(USERS_KEY, [...users, newUser]);
    return {
        _id: newUser._id,
        name: newUser.name,
        studentId: newUser.studentId,
        role: newUser.role,
        regNo: newUser.regNo,
        userType: newUser.userType,
        token: `auth_token_${Date.now()}`
    };
};

export const loginUser = (studentId, password, expectedRole) => {
    const users = getUsers();
    const cleanId = (studentId || '').trim().toLowerCase();

    const user = users.find((u) =>
        u.studentId.toLowerCase() === cleanId &&
        u.password === password &&
        (!expectedRole || u.role === expectedRole)
    );

    if (!user) return null;

    return {
        _id: user._id,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        regNo: user.regNo || user.studentId,
        userType: user.userType || 'Dayscholar',
        token: `auth_token_${Date.now()}`
    };
};

// ---------------- ORDER & PAYMENT OPERATIONS ----------------
export const getOrders = () => {
    return read(ORDERS_KEY, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getOrdersForUser = (userId) => {
    return getOrders().filter((o) => o.user?._id === userId || o.user?.studentId === userId);
};

export const createOrder = ({
    user,
    orderItems,
    totalPrice,
    paymentMethod = 'UPI',
    paymentId = '',
    paymentStatus = 'Paid',
    notes = ''
}) => {
    const orders = read(ORDERS_KEY, []);
    const now = new Date();
    const todayStr = now.toDateString();
    
    // Generate sequential daily token number (e.g., #101, #102...)
    const todayOrdersCount = orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr).length;
    const tokenNumber = 100 + todayOrdersCount + 1;

    const newOrder = {
        _id: makeId('ORD'),
        user: {
            _id: user._id || user.studentId,
            name: user.name,
            studentId: user.studentId,
            regNo: user.regNo || user.studentId
        },
        orderItems,
        totalPrice: Number(totalPrice),
        tokenNumber,
        status: 'Ordered', // 'Ordered' -> 'Preparing' -> 'Ready for Pickup' -> 'Completed' -> 'Cancelled'
        paymentMethod,
        paymentId: paymentId || `PAY_${Date.now().toString(36).toUpperCase()}`,
        paymentStatus,
        notes,
        estimatedTime: '10-15 mins',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
    };

    write(ORDERS_KEY, [newOrder, ...orders]);
    return newOrder;
};

export const updateOrderStatus = (orderId, newStatus) => {
    const orders = read(ORDERS_KEY, []);
    const updated = orders.map((order) =>
        order._id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
    );
    write(ORDERS_KEY, updated);
    return updated.find((o) => o._id === orderId);
};

export const cancelOrder = (orderId) => {
    return updateOrderStatus(orderId, 'Cancelled');
};

// ---------------- REACTIVE SUBSCRIPTION ----------------
export const subscribeToDataChanges = (callback) => {
    const handler = () => callback();
    window.addEventListener('canteenhub-data-change', handler);
    window.addEventListener('storage', handler);
    return () => {
        window.removeEventListener('canteenhub-data-change', handler);
        window.removeEventListener('storage', handler);
    };
};

// Backwards compatibility aliases for existing imports
export const getDemoMenu = getMenu;
export const addDemoMenuItem = addMenuItem;
export const updateDemoMenuItem = updateMenuItem;
export const deleteDemoMenuItem = deleteMenuItem;
export const registerDemoUser = registerUser;
export const loginDemoUser = loginUser;
export const getDemoOrders = getOrders;
export const getDemoOrdersForUser = getOrdersForUser;
export const createDemoOrder = createOrder;
export const updateDemoOrderStatus = updateOrderStatus;
export const subscribeToDemoChanges = subscribeToDataChanges;
