import Order from '../models/Order.js';

const generateTokenNumber = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const count = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
    return count + 1;
};

export const addOrderItems = async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const tokenNumber = await generateTokenNumber();

        const order = new Order({
            orderItems,
            user: req.user._id,
            totalPrice,
            tokenNumber,
            status: 'Ordered'
        });

        const createdOrder = await order.save();

        // Notify owner via Socket.io
        const io = req.app.get('io');
        io.emit('new-order', createdOrder);

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name studentId');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const orders = await Order.find({ createdAt: { $gte: startOfDay } })
            .populate('user', 'name studentId')
            .sort({ createdAt: 1 }); // FIFO format

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();

            const userId = order.user.toString();

            // Notify specific user via Socket.io
            const io = req.app.get('io');
            io.emit(`order-status-${userId}`, updatedOrder);

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
