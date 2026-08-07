// Import client Supabase lu (sesuaikan path-nya)
const { supabase } = require('../config/supabase'); 

const saveMinigameLog = async (userId, logData) => {
    let patientId = null;

    if (userId) {
        const { data: byUser } = await supabase.from('patient').select('id').eq('user_id', userId).maybeSingle();
        if (byUser) {
            patientId = byUser.id;
        } else {
            const { data: byId } = await supabase.from('patient').select('id').eq('id', userId).maybeSingle();
            if (byId) patientId = byId.id;
        }
    }

    if (!patientId) {
        const { data: firstPatient } = await supabase.from('patient').select('id').limit(1).maybeSingle();
        if (firstPatient) patientId = firstPatient.id;
    }

    if (!patientId) {
        throw new Error("Data pasien tidak ditemukan untuk user ini.");
    }

    const { data: minigameData } = await supabase.from('minigame').select('id').eq('title', 'Piano Tiles').maybeSingle();
    const minigameId = minigameData?.id || null;

    const { data, error } = await supabase
    .from('minigame_logs')
    .insert([
      {
        patient_id: patientId,
        duration_seconds: logData.duration_seconds || 0,
        score: logData.score || 0,
        max_combo: logData.max_combo || 0,
        perfect_hits: logData.perfect_hits || 0,
        good_hits: logData.good_hits || 0,
        minigame_id: minigameId
      }
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getMinigameLogs = async (userId) => {
  let patientId = null;

  if (userId) {
    const { data: byUser } = await supabase.from('patient').select('id').eq('user_id', userId).maybeSingle();
    if (byUser) {
      patientId = byUser.id;
    } else {
      const { data: byId } = await supabase.from('patient').select('id').eq('id', userId).maybeSingle();
      if (byId) patientId = byId.id;
    }
  }

  if (!patientId) {
    return [];
  }

  const { data, error } = await supabase
    .from('minigame_logs')
    .select(`
      *,
      minigame (
        title
      )
    `)
    .eq('patient_id', patientId)
    .order('played_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

module.exports = {
  saveMinigameLog,
  getMinigameLogs
};