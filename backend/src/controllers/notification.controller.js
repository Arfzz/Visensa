const notificationService = require('../services/notification.service');

const notificationController = {
  /**
   * GET /api/v1/notifications — Doctor: Get clinical alerts & notifications
   */
  async getNotifications(req, res, next) {
    try {
      const data = await notificationService.getNotifications(req.user?.id);
      return res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/notifications/:id/read — Doctor: Mark notification as read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const data = await notificationService.markAsRead(id);
      return res.json({
        success: true,
        message: 'Notifikasi ditandai sebagai telah dibaca.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = notificationController;
