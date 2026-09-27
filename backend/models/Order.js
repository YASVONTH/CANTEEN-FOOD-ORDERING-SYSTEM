import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            foodItem: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'FoodItem',
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    status: {
        type: String,
        required: true,
        enum: ['Ordered', 'Preparing', 'Ready for Pickup', 'Completed'],
        default: 'Ordered',
    },
    tokenNumber: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
