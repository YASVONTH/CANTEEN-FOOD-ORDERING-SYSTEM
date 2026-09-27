import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import FoodItem from './models/FoodItem.js';
import Order from './models/Order.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const dummyFood = [
    {
        name: 'Masala Dosa',
        price: 60,
        category: 'Meals',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        name: 'Veg Noodles',
        price: 80,
        category: 'Meals',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        name: 'Chicken Biryani',
        price: 150,
        category: 'Meals',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        name: 'Cold Coffee',
        price: 50,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        name: 'Samosa (2 pcs)',
        price: 30,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
    },
    {
        name: 'Gulab Jamun',
        price: 40,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1596700813958-e4b7c1af8ff7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        isAvailable: false,
    }
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canteen');

        await Order.deleteMany();
        await FoodItem.deleteMany();
        await User.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash('admin123', salt);

        // Create Admin
        const adminUser = await User.create({
            name: 'Canteen Admin',
            studentId: 'admin',
            password: hashPassword, // manually hashing for insert raw
            role: 'admin'
        });

        // Wait for the presave hook to trigger, or bypass it if manually hashed. 
        // Since we use User.create, presave hook WILL trigger and hash it AGAIN if we pass plain text.
        // So let's pass plain text because of our pre-save hook in User model.

        await User.deleteMany(); // Reset
        await User.create({
            name: 'Canteen Admin',
            studentId: 'admin',
            username: 'admin',
            password: '2067', // Updated admin password
            role: 'admin'
        });

        await User.create({
            name: 'Demo Student',
            studentId: 'student',
            password: 'student',
            role: 'student'
        });

        await FoodItem.insertMany(dummyFood);

        console.log('Dummy Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
