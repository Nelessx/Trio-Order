import itemModel from "../models/itemModel.js";

// Create Item
export const createItem = async (req, res, next) => {
  try {
    const { name, description, category, price, rating, hearts } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const total = Number(price) * 1;

    const newItem = new itemModel({
      name,
      description,
      category,
      price,
      rating,
      hearts,
      imageUrl,
      total,
    });

    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'item name already exists' });
    } else {
      next(err);
    }
  }
};

// Get all items
export const getItems = async (req, res, next) => {
  try {
    const items = await itemModel.find().sort({ createdAt: -1 });
    const host = `${req.protocol}://${req.get('host')}`;

    const withFullUrl = items.map(i => ({
      ...i.toObject(),
      imageUrl: i.imageUrl ? host + i.imageUrl : '',
    }));

    res.json(withFullUrl);
  } catch (err) {
    next(err);
  }
};

// Delete item
export const deleteItem = async (req, res, next) => {
  try {
    const removed = await itemModel.findByIdAndDelete(req.params.id);

    if (!removed) return res.status(404).json({ message: "item not found" });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
