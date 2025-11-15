import asyncHandler from "express-async-handler";
import { CartItem } from "../models/cartModel.js";

// Get cart
export const getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id }).populate("item");
  
  console.log('getCart found items:', items.length);
  items.forEach((ci, idx) => {
    console.log(`Item ${idx}:`, { 
      _id: ci._id, 
      itemPopulated: !!ci.item, 
      itemId: ci.item?._id,
      itemName: ci.item?.name,
      quantity: ci.quantity 
    });
  });

  const formatted = items.map((ci) => ({
    _id: ci._id.toString(),
    item: ci.item,
    quantity: ci.quantity,
  }));

  res.json(formatted);
});

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { itemId, quantity } = req.body;
  console.log('addToCart received:', { itemId, quantity, type: typeof quantity, body: req.body });
  
  if (!itemId || (quantity === undefined || quantity === null)) {
    res.status(400);
    throw new Error("itemId and quantity are required");
  }
  
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    res.status(400);
    throw new Error("quantity must be a valid number >= 1");
  }

  let cartItem = await CartItem.findOne({ user: req.user._id, item: itemId });

  if (cartItem) {
    cartItem.quantity = Math.max(1, cartItem.quantity + qty);

    if (cartItem.quantity < 1) {
      await cartItem.remove();
      return res.json({
        _id: cartItem._id.toString(),
        item: cartItem.item,
        quantity: 0,
      });
    }

    await cartItem.save();
    await cartItem.populate("item");
    return res.status(200).json({
      _id: cartItem._id.toString(),
      item: cartItem.item,
      quantity: cartItem.quantity,
    });
  }

  cartItem = await CartItem.create({
    user: req.user._id,
    item: itemId,
    quantity: qty,
  });
  await cartItem.populate("item");

  console.log('Created cart item:', {
    _id: cartItem._id,
    itemPopulated: !!cartItem.item,
    itemName: cartItem.item?.name,
    itemPrice: cartItem.item?.price,
    quantity: cartItem.quantity
  });

  res.status(201).json({
    _id: cartItem._id.toString(),
    item: cartItem.item,
    quantity: cartItem.quantity,
  });
});

// Update cart item
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cartItem = await CartItem.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!cartItem) {
    res.status(404);
    throw new Error("cart item not found");
  }

  cartItem.quantity = Math.max(1, quantity);
  await cartItem.save();
  await cartItem.populate("item");

  res.json({
    id: cartItem._id.toString(),
    item: cartItem.item,
    quantity: cartItem.quantity,
  });
});

// Delete cart item
export const deleteCartItem = asyncHandler(async (req, res) => {
  const cartItem = await CartItem.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!cartItem) {
    res.status(404);
    throw new Error("cart item not found");
  }

  await cartItem.deleteOne();
  res.json({ _id: req.params.id });
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ user: req.user._id });
  res.json({ message: 'cart cleared' });
});
