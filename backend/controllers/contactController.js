import ContactQuery from '../models/contactQueryModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// Submit a contact query
export const submitContactQuery = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, address, dishName, query } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !email || !address || !query) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Get user ID from authenticated user (if logged in)
    let userId = null;
    if (req.user && req.user._id) {
      userId = req.user._id;
    }

    // Create new contact query
    const contactQuery = new ContactQuery({
      fullName,
      phoneNumber,
      email,
      address,
      dishName: dishName || '',
      query,
      status: 'pending',
      priority: 'medium'
    });

    await contactQuery.save();

    // Create notification for logged-in user
    if (userId) {
      const notification = new Notification({
        userId,
        contactQueryId: contactQuery._id,
        type: 'status_update',
        title: 'Query Submitted',
        message: 'Your query has been submitted successfully. We will review it soon.',
        priority: 'medium'
      });
      await notification.save();
    }

    res.status(201).json({
      success: true,
      message: 'Your query has been submitted successfully. We will get back to you soon!',
      data: {
        id: contactQuery._id,
        status: contactQuery.status
      }
    });

  } catch (error) {
    console.error('Error submitting contact query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit query. Please try again later.'
    });
  }
};

// Get all contact queries (for admin)
export const getAllContactQueries = async (req, res) => {
  try {
    const queries = await ContactQuery.find()
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const stats = {
      total: queries.length,
      pending: queries.filter(q => q.status === 'pending').length,
      inProgress: queries.filter(q => q.status === 'in_progress').length,
      resolved: queries.filter(q => q.status === 'resolved').length,
      closed: queries.filter(q => q.status === 'closed').length,
      urgent: queries.filter(q => q.priority === 'urgent').length,
      high: queries.filter(q => q.priority === 'high').length
    };

    res.json({
      success: true,
      data: queries,
      stats
    });

  } catch (error) {
    console.error('Error fetching contact queries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact queries'
    });
  }
};

// Update contact query status (for admin)
export const updateContactQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, priority } = req.body;

    const updateData = { updatedAt: new Date() };
    
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;

    // If status is resolved or closed, set resolvedAt
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    const query = await ContactQuery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Contact query not found'
      });
    }

    // Find user by email and create notification
    const user = await User.findOne({ email: query.email });
    
    if (user && status) {
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = 'status_update';

      switch (status) {
        case 'in_progress':
          notificationTitle = 'Query In Progress';
          notificationMessage = 'We are now working on your query. Thank you for your patience.';
          break;
        case 'resolved':
          notificationTitle = 'Query Resolved';
          notificationMessage = 'Your query has been resolved. Thank you for contacting us!';
          notificationType = 'query_resolved';
          break;
        case 'closed':
          notificationTitle = 'Query Closed';
          notificationMessage = 'Your query has been closed. If you have any further concerns, please contact us again.';
          notificationType = 'query_resolved';
          break;
        default:
          notificationTitle = 'Query Status Updated';
          notificationMessage = `Your query status has been updated to ${status.replace('_', ' ')}.`;
      }

      const notification = new Notification({
        userId: user._id,
        contactQueryId: query._id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        priority: priority || 'medium'
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Contact query updated successfully',
      data: query
    });

  } catch (error) {
    console.error('Error updating contact query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact query'
    });
  }
};

// Delete contact query (for admin)
export const deleteContactQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await ContactQuery.findByIdAndDelete(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Contact query not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact query deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact query'
    });
  }
};
