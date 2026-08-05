const minigameService = require('../services/minigame.service');

const storeLog = async (req, res) => {
  try {
    const { user_id, duration_seconds, score, max_combo, perfect_hits, good_hits } = req.body;

    if (duration_seconds === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap. Pastikan durasi dan skor ada."
      });
    }

    const savedData = await minigameService.saveMinigameLog(user_id, req.body);

    return res.status(201).json({
      success: true,
      message: "Result saved successfully!",
      data: savedData
    });

  } catch (error) {
    console.error("[Minigame Controller] Error saving log:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

module.exports = {
  storeLog
};