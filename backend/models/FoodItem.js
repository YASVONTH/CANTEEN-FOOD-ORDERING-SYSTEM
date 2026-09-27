import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    category: {
        type: String,
        required: true,
        default: 'Meals',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
