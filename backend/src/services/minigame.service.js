// Import client Supabase lu (sesuaikan path-nya)
const { supabase } = require('../config/supabase'); 

const saveMinigameLog = async (userId, logData) => {
    // Masukin data ke tabel minigame_logs
    const { data: patientData, error: patientError } = await supabase.from('patient').select('id').eq('user_id', userId).single();
    const { data: minigameData, error: minigameError } = await supabase.from('minigame').select('id').eq('title', 'Piano Tiles').single();

    if (patientError || !patientData) {
        throw new Error("Data pasien tidak ditemukan untuk user ini.");
    }

    const { data, error } = await supabase
    .from('minigame_logs')
    .insert([
      {
        patient_id: patientData.id,
        duration_seconds: logData.duration_seconds,
        score: logData.score,
        max_combo: logData.max_combo,
        perfect_hits: logData.perfect_hits,
        good_hits: logData.good_hits,
        minigame_id: minigameData.id
      }
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  saveMinigameLog
};