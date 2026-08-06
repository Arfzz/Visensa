const { supabase } = require('../config/supabase'); // Sesuaikan path config lu
const AppError = require('../utils/AppError');

const doctorService = {
  async getMyProfile(userId) {
    console.log("=== DEBUG DOCTOR PROFILE ===")
    // Kacamata skeptis: Pastiin nama tabel lu beneran 'doctor' dan ada kolom 'specialization'
    const { data, error } = await supabase
      .from('doctor')
      .select('id, name')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new AppError('Gagal mengambil profil dokter: ' + error.message, 404);
    }
    
    return data;
  }
};

module.exports = doctorService;