import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   //  make sure your user model is exported as "User"
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',   // matches "Item" model
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, { timestamps: true });

export const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
