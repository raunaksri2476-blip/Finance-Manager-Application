const Notification = require('../models/Notification');
const { checkAndGenerateNotifications } = require('../services/notificationService');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    // Run notification check to make sure metrics are updated
    await checkAndGenerateNotifications(req.user._id);

    const notifications = await Notification.find({ userID: req.user._id }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userID: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userID: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: notification._id });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
