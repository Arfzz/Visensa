const { supabase } = require('../config/supabase'); // Sesuaikan path config lu
const AppError = require('../utils/AppError');

const landingPageService = {
  async getTestimonials() {
    // Tembak berantai ngelewatin tabel patient_programs
    const { data, error } = await supabase
      .from('exercise_logs')
      .select(`
        notes,
        patient_programs:schedule_id (
          patient:patient_id (
            name,
            condition
          )
        )
      `)
      .not('notes', 'is', null)
      .neq('notes', '')
      .limit(1); 

    if (error) {
      console.log("🚨 Error dari Supabase:", error.message);
      throw new Error('Gagal mengambil testimoni: ' + error.message);
    }

    if (!data || data.length === 0) {
      return []; 
    }

    const log = data[0];
    
    // Kacamata skeptis: Karena datanya bersarang 2 tingkat, cara manggilnya harus digali lebih dalem
    const patientData = log.patient_programs?.patient;
    const fullName = patientData?.name || "Anonymous";
    
    return [{
      quote: `"${log.notes}"`,
      name: fullName,
      initial: fullName.charAt(0).toUpperCase(),
      desc: patientData?.condition || "Visensa Patient"
    }];
  }
};

module.exports = landingPageService;