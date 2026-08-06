const doctorService = require('../services/doctor.service');

const doctorController = {
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id; // Dapet dari middleware JWT lu
      const doctorProfile = await doctorService.getMyProfile(userId);

      return res.status(200).json({
        success: true,
        data: doctorProfile
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = doctorController;