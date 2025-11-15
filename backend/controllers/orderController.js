import "dotenv/config";
import Stripe from "stripe";
import Order from "../models/orderModel.js";
import Notification from "../models/notificationModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create order
export const createOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      paymentMethod,
      subtotal,
      tax,
      total,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid or empty items array" });
    }

    const orderItems = items.map(
      ({ item, name, price, imageUrl, quantity }) => {
        const base = item || {};
        return {
          item: {
            name: base.name || name || "unknown",
            price: Number(base.price ?? price) || 0,
            imageUrl: base.imageUrl || imageUrl || "",
          },
          quantity: Number(quantity) || 0,
        };
      }
    );

    const shippingCost = 0;
    let newOrder;

    if (paymentMethod === "online") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: orderItems.map((o) => ({
          price_data: {
            currency: "inr",
            product_data: { name: o.item.name },
            unit_amount: Math.round(o.item.price * 100),
          },
          quantity: o.quantity,
        })),
        customer_email: email,
        success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
        metadata: { firstName, lastName, email, phone },
      });

      newOrder = new Order({
        user: req.user._id,
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        zipCode,
        paymentMethod,
        subtotal,
        tax,
        total,
        shipping: shippingCost,
        items: orderItems,
        paymentIntentId: session.payment_intent,
        sessionId: session.id,
        paymentStatus: "pending",
      });

      await newOrder.save();
      return res
        .status(201)
        .json({ order: newOrder, checkouturl: session.url });
    }

    // COD orders
    newOrder = new Order({
      user: req.user._id,
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      paymentMethod,
      subtotal,
      tax,
      total,
      shipping: shippingCost,
      items: orderItems,
      paymentStatus: "succeeded",
    });

    await newOrder.save();
    return res.status(201).json({ order: newOrder, checkouturl: null });
  } catch (error) {
    console.error("CreateOrder error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id)
      return res.status(400).json({ message: "session_id is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      const order = await Order.findOneAndUpdate(
        { sessionId: session_id },
        { paymentStatus: "succeeded" },
        { new: true }
      );

      if (!order) return res.status(404).json({ message: "order not found" });
      return res.json(order);
    }
    return res.status(400).json({ message: "payment not completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error", error: err.message });
  }
};

// Get orders for user (excluding customer-deleted orders)
export const getOrder = async (req, res) => {
  try {
    console.log('User requesting orders for:', req.user._id);
    const filter = { 
      user: req.user._id,
      deletedByCustomer: { $ne: true }
    };
    const rawOrders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    console.log(`Found ${rawOrders.length} orders for user (excluding customer-deleted)`);

    const formatted = rawOrders.map((o) => ({
      _id: o._id,
      user: o.user,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phone: o.phone,
      address: o.address,
      city: o.city,
      zipCode: o.zipCode,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status || 'pending',
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      total: o.total,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      expectedDelivery: o.expectedDelivery,
      deliveredAt: o.deliveredAt,
      deletedByAdmin: o.deletedByAdmin,
      deletedByCustomer: o.deletedByCustomer,
      items: o.items.map((i) => ({
        _id: i._id,
        item: i.item,
        quantity: i.quantity,
      })),
    }));

    res.json({
      success: true,
      orders: formatted,
      count: formatted.length
    });
  } catch (error) {
    console.error("getOrder error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Admin: get all orders with enhanced details (excluding admin-deleted orders)
export const getAllOrders = async (req, res) => {
  try {
    console.log('Admin requesting all orders...');
    const raw = await Order.find({ deletedByAdmin: { $ne: true } }).sort({ createdAt: -1 }).lean();
    console.log(`Found ${raw.length} orders (excluding admin-deleted)`);
    
    const formatted = raw.map((o) => ({
      _id: o._id,
      user: o.user,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phone: o.phone,
      address: o.address ?? o.shippingAddress?.address ?? "",
      city: o.city ?? o.shippingAddress?.city ?? "",
      zipCode: o.zipCode ?? o.shippingAddress?.zipCode ?? "",
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status || 'pending',
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      total: o.total,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      expectedDelivery: o.expectedDelivery,
      deliveredAt: o.deliveredAt,
      deletedByAdmin: o.deletedByAdmin,
      deletedByCustomer: o.deletedByCustomer,
      items: o.items.map((i) => ({
        _id: i._id,
        item: i.item,
        quantity: i.quantity,
      })),
    }));

    res.json({
      success: true,
      orders: formatted,
      count: formatted.length
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Update any order (Admin) with enhanced status handling
export const updateAnyOrder = async (req, res) => {
  try {
    const { status, expectedDelivery, deliveredAt } = req.body;
    
    // Prevent admin from setting status to 'delivered' directly
    // Only users can mark orders as delivered after receiving them
    if (status === 'delivered') {
      return res.status(400).json({ 
        success: false,
        message: "Admin cannot mark order as delivered. Only users can confirm delivery after receiving their order." 
      });
    }
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // If status is being updated to outForDelivery, set expected delivery to 30 minutes from now
    if (status === 'outForDelivery' && !expectedDelivery) {
      const deliveryDate = new Date();
      deliveryDate.setMinutes(deliveryDate.getMinutes() + 30); // 30 minutes from now
      updateData.expectedDelivery = deliveryDate;
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "order not found" });
    }
    
    // Create a notification for the user about status changes
    try {
      if (updated && (req.body.status || req.body.expectedDelivery || req.body.deliveredAt)) {
        const status = updated.status || 'pending';
        const statusLabelMap = {
          pending: 'Pending',
          processing: 'Processing',
          preparing: 'Preparing',
          outForDelivery: 'On the Way',
          delivered: 'Delivered',
          cancelled: 'Cancelled',
        };
        const title = `Order ${statusLabelMap[status] || status}`;
        let message = `Your order #${String(updated._id).slice(-8)} status is now ${statusLabelMap[status] || status}.`;
        if (status === 'outForDelivery' && updated.expectedDelivery) {
          message += ` Expected delivery: within half an hour.`;
          message += ` Please confirm delivery once you receive your order.`;
        }
        if (status === 'delivered' && updated.deliveredAt) {
          message += ` Delivered on ${new Date(updated.deliveredAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}.`;
        }
        await Notification.create({
          userId: updated.user,
          orderId: updated._id,
          type: 'status_update',
          title,
          message,
          priority: 'medium',
        });
      }
    } catch (notifyErr) {
      console.error('Failed to create order status notification:', notifyErr);
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      order: updated
    });
  } catch (error) {
    console.error("updateAnyOrder error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "order not found" });

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.query.email && order.email !== req.query.email) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(order);
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Update order by ID
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "order not found" });

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.body.email && order.email !== req.body.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    console.error("updateOrder error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Admin: Soft delete order (only completed/cancelled orders)
export const deleteOrderByAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Only allow deletion of completed or cancelled orders
    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: "Only completed or cancelled orders can be deleted" 
      });
    }

    // Check if already deleted by admin
    if (order.deletedByAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Order already deleted by admin" 
      });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        deletedByAdmin: true,
        adminDeletedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order deleted successfully from admin panel",
      order: updated
    });
  } catch (error) {
    console.error("deleteOrderByAdmin error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Customer: Mark order as delivered (only when status is outForDelivery)
export const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Check if user owns this order
    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    // Only allow marking as delivered if status is outForDelivery
    if (order.status !== 'outForDelivery') {
      return res.status(400).json({ 
        success: false,
        message: `Order cannot be marked as delivered. Current status: ${order.status}. Order must be 'On the Way' (outForDelivery) first.` 
      });
    }

    // Update order status to delivered and set deliveredAt timestamp
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'delivered',
        deliveredAt: new Date()
      },
      { new: true }
    );

    // Create notification for admin about delivery confirmation
    try {
      await Notification.create({
        userId: updated.user,
        orderId: updated._id,
        type: 'status_update',
        title: 'Order Delivered - Confirmed by Customer',
        message: `Order #${String(updated._id).slice(-8)} has been confirmed as delivered by the customer.`,
        priority: 'high',
      });
    } catch (notifyErr) {
      console.error('Failed to create delivery confirmation notification:', notifyErr);
    }

    res.json({
      success: true,
      message: "Order marked as delivered successfully",
      order: updated
    });
  } catch (error) {
    console.error("markOrderAsDelivered error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Customer: Soft delete their own order (only completed/cancelled orders)
export const deleteOrderByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Check if user owns this order
    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    // Only allow deletion of completed or cancelled orders
    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: "Only completed or cancelled orders can be deleted" 
      });
    }

    // Check if already deleted by customer
    if (order.deletedByCustomer) {
      return res.status(400).json({ 
        success: false,
        message: "Order already deleted from your history" 
      });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        deletedByCustomer: true,
        customerDeletedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order deleted successfully from your order history",
      order: updated
    });
  } catch (error) {
    console.error("deleteOrderByCustomer error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Get sales statistics (today, weekly, monthly, yearly)
export const getSalesStatistics = async (req, res) => {
  try {
    const now = new Date();
    
    // Today's date range (start of day to end of day)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // Weekly date range (last 7 days)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    // Monthly date range (current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Yearly date range (current year)
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    // Helper function to get statistics for a date range
    const getStatsForRange = async (startDate, endDate, label) => {
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        deletedByAdmin: { $ne: true }
      }).lean();
      
      // Calculate revenue (only from succeeded payments)
      const revenue = orders
        .filter(o => o.paymentStatus === 'succeeded')
        .reduce((sum, o) => sum + (o.total || 0), 0);
      
      // Calculate total revenue (including pending payments)
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      // Count orders by status
      const statusCounts = {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        outForDelivery: orders.filter(o => o.status === 'outForDelivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      };
      
      // Count orders by payment status
      const paymentStatusCounts = {
        pending: orders.filter(o => o.paymentStatus === 'pending').length,
        succeeded: orders.filter(o => o.paymentStatus === 'succeeded').length,
        failed: orders.filter(o => o.paymentStatus === 'failed').length,
      };
      
      // Count orders by payment method
      const paymentMethodCounts = {
        cod: orders.filter(o => o.paymentMethod === 'cod').length,
        online: orders.filter(o => o.paymentMethod === 'online').length,
      };
      
      // Calculate average order value
      const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;
      
      // Get top selling items
      const itemCounts = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          const itemName = item.item?.name || 'Unknown';
          if (!itemCounts[itemName]) {
            itemCounts[itemName] = {
              name: itemName,
              quantity: 0,
              revenue: 0,
              orders: 0
            };
          }
          itemCounts[itemName].quantity += item.quantity || 0;
          itemCounts[itemName].revenue += (item.item?.price || 0) * (item.quantity || 0);
          itemCounts[itemName].orders += 1;
        });
      });
      
      const topItems = Object.values(itemCounts)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
      
      // Get daily breakdown for the period (for trends)
      const dailyBreakdown = {};
      
      // Calculate the number of days in the period
      const startDateCopy = new Date(startDate);
      startDateCopy.setHours(0, 0, 0, 0);
      const endDateCopy = new Date(endDate);
      endDateCopy.setHours(23, 59, 59, 999);
      
      // Create entries for each day in the range
      const currentDate = new Date(startDateCopy);
      while (currentDate <= endDateCopy) {
        // Use local date string to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dayKey = `${year}-${month}-${day}`;
        
        dailyBreakdown[dayKey] = {
          date: dayKey,
          orders: 0,
          revenue: 0
        };
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Process orders and match them to days
      orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        // Use local date to match with dailyBreakdown keys
        const year = orderDate.getFullYear();
        const month = String(orderDate.getMonth() + 1).padStart(2, '0');
        const day = String(orderDate.getDate()).padStart(2, '0');
        const orderDayKey = `${year}-${month}-${day}`;
        
        if (dailyBreakdown[orderDayKey]) {
          dailyBreakdown[orderDayKey].orders += 1;
          if (order.paymentStatus === 'succeeded') {
            dailyBreakdown[orderDayKey].revenue += order.total || 0;
          }
        }
      });
      
      return {
        label,
        period: {
          start: startDate,
          end: endDate
        },
        summary: {
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          confirmedRevenue: revenue, // Only from succeeded payments
          avgOrderValue: avgOrderValue,
          totalItems: orders.reduce((sum, o) => 
            sum + o.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
          )
        },
        statusBreakdown: statusCounts,
        paymentStatusBreakdown: paymentStatusCounts,
        paymentMethodBreakdown: paymentMethodCounts,
        topItems: topItems,
        dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        )
      };
    };
    
    // Get statistics for all periods
    const todayStats = await getStatsForRange(todayStart, todayEnd, 'Today');
    const weeklyStats = await getStatsForRange(weekStart, now, 'Last 7 Days');
    const monthlyStats = await getStatsForRange(monthStart, monthEnd, 'This Month');
    const yearlyStats = await getStatsForRange(yearStart, yearEnd, 'This Year');
    
    res.json({
      success: true,
      statistics: {
        today: todayStats,
        weekly: weeklyStats,
        monthly: monthlyStats,
        yearly: yearlyStats
      }
    });
  } catch (error) {
    console.error("getSalesStatistics error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};
