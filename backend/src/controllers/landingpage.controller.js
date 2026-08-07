const landingPageService = require('../services/landingpage.service');

const landingPageController = {
  async getTestimonials(req, res, next) {
    try {
      const testimonials = await landingPageService.getTestimonials();
      return res.status(200).json({
        success: true,
        data: testimonials
      });
    } catch (error) {
      next(error); // Lempar ke Global Error Handler lu
    }
  }
};

module.exports = landingPageController;