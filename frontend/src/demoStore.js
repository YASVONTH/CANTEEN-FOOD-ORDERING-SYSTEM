const MENU_KEY = 'canteenhub-demo-menu';
const USERS_KEY = 'canteenhub-demo-users';
const ORDERS_KEY = 'canteenhub-demo-orders';

const initialMenu = [
    {
        _id: 'food-masala-dosa',
        name: 'Masala Dosa',
        price: 60,
        category: 'Meals',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'food-veg-noodles',
        name: 'Veg Noodles',
        price: 80,
        category: 'Meals',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'food-chicken-biryani',
        name: 'Chicken Biryani',
        price: 150,
        category: 'Meals',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'food-cold-coffee',
        name: 'Cold Coffee',
        price: 50,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'food-samosa',
        name: 'Samosa (2 pcs)',
        price: 30,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        _id: 'food-gulab-jamun',
        name: 'Gulab Jamun',
        price: 40,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1596700813958-e4b7c1af8ff7?auto=format&fit=crop&w=800&q=80',
        isAvailable: false,
    },
];

const defaultAdmin = {
    _id: 'demo-admin',
    name: 'Canteen Admin',
    studentId: 'admin',
    password: '2067',
    role: 'admin',
};

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
    window.dispatchEvent(new Event('canteenhub-demo-change'));
};

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getUsers = () => {
    const users = read(USERS_KEY, null);
    if (users) return users;
    write(USERS_KEY, [defaultAdmin]);
    return [defaultAdmin];
};

export const getDemoMenu = () => {
    const menu = read(MENU_KEY, null);
    if (menu) return menu;
    write(MENU_KEY, initialMenu);
    return initialMenu;
};

export const addDemoMenuItem = (item) => {
    const menu = getDemoMenu();
    const created = { ...item, _id: makeId(), price: Number(item.price) };
    write(MENU_KEY, [...menu, created]);
    return created;
};

export const updateDemoMenuItem = (id, updates) => {
    const menu = getDemoMenu();
    const updated = menu.map((item) => item._id === id
        ? { ...item, ...updates, price: updates.price === undefined ? item.price : Number(updates.price) }
        : item);
    write(MENU_KEY, updated);
    return updated.find((item) => item._id === id);
};

export const deleteDemoMenuItem = (id) => {
    write(MENU_KEY, getDemoMenu().filter((item) => item._id !== id));
};

export const registerDemoUser = (formData) => {
    const users = getUsers();
    const studentId = formData.username.trim();
    if (users.some((user) => user.studentId.toLowerCase() === studentId.toLowerCase())) {
        throw new Error('That username is already registered in this browser.');
    }

    const user = {
        _id: makeId(),
        name: formData.name.trim(),
        studentId,
        password: formData.password,
        role: 'student',
        regNo: formData.regNo,
        userType: formData.userType,
        email: formData.email,
    };
    write(USERS_KEY, [...users, user]);
    return user;
};

export const loginDemoUser = (studentId, password, role) => {
    const user = getUsers().find((entry) => (
        entry.studentId.toLowerCase() === studentId.trim().toLowerCase()
        && entry.password === password
        && (!role || entry.role === role)
    ));
    if (!user) return null;

    return {
        _id: user._id,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        token: 'browser-demo-session',
    };
};

export const getDemoOrders = () => read(ORDERS_KEY, [])
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));

export const getDemoOrdersForUser = (userId) => getDemoOrders()
    .filter((order) => order.user?._id === userId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

export const createDemoOrder = ({ user, orderItems, totalPrice }) => {
    const orders = read(ORDERS_KEY, []);
    const now = new Date();
    const todayCount = orders.filter((order) => new Date(order.createdAt).toDateString() === now.toDateString()).length;
    const order = {
        _id: makeId(),
        user: { _id: user._id, name: user.name, studentId: user.studentId },
        orderItems,
        totalPrice: Number(totalPrice),
        tokenNumber: todayCount + 1,
        status: 'Ordered',
        createdAt: now.toISOString(),
    };
    write(ORDERS_KEY, [order, ...orders]);
    return order;
};

export const updateDemoOrderStatus = (id, status) => {
    const orders = read(ORDERS_KEY, []);
    const updated = orders.map((order) => order._id === id ? { ...order, status } : order);
    write(ORDERS_KEY, updated);
    return updated.find((order) => order._id === id);
};

export const subscribeToDemoChanges = (callback) => {
    window.addEventListener('canteenhub-demo-change', callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener('canteenhub-demo-change', callback);
        window.removeEventListener('storage', callback);
    };
};