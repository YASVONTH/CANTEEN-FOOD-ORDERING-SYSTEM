import FoodItem from '../models/FoodItem.js';

export const getMenu = async (req, res) => {
    try {
        const items = await FoodItem.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createFoodItem = async (req, res) => {
    try {
        const { name, price, image, category, isAvailable } = req.body;

        const item = new FoodItem({
            name,
            price,
            image,
            category,
            isAvailable
        });

        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateFoodItem = async (req, res) => {
    try {
        const { name, price, image, category, isAvailable } = req.body;

        const item = await FoodItem.findById(req.params.id);

        if (item) {
            item.name = name || item.name;
            item.price = price || item.price;
            item.image = image || item.image;
            item.category = category || item.category;
            item.isAvailable = isAvailable !== undefined ? isAvailable : item.isAvailable;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Food item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteFoodItem = async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id);

        if (item) {
            await item.deleteOne();
            res.json({ message: 'Food item removed' });
        } else {
            res.status(404).json({ message: 'Food item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
