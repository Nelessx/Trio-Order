import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  contactQueryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactQuery',
  },
  // 'status_update' kept for backward compatibility; also used for order updates
  type: {
    type: String,
    enum: ['status_update', 'admin_response', 'query_resolved', 'order_status'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  }
});

// Update readAt when status changes to read
notificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
