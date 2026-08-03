const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase'); // Pastiin path import ini bener

const authService = {
  /**
   * Register a new user.
   * @param {{ name, email, password, condition, role }} data
   */
  async register(data) {
    // 1. Daftarin ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    // Kalau email udah ada atau password kurang kuat, Supabase bakal ngeluarin error
    if (authError) throw new AppError(authError.message, 400);

    const userId = authData.user.id;

    // 2. Masukin data profil ke tabel yang sesuai berdasarkan role
    if (data.role === 'doctor') {
      const { error: dbError } = await supabase
        .from('doctor')
        .insert([{ name: data.name }]);
        
      if (dbError) throw new AppError('Gagal menyimpan profil dokter: ' + dbError.message, 500);
    } else {
      const { error: dbError } = await supabase
        .from('patient')
        .insert([{ name: data.name, condition: data.condition }]);
        
      if (dbError) throw new AppError('Gagal menyimpan profil pasien: ' + dbError.message, 500);
    }

    // 3. Ambil token bawaan Supabase
    const session = authData.session;
    
    return { 
      user: { id: userId, name: data.name, email: data.email, role: data.role }, 
      accessToken: session ? session.access_token : null, 
      refreshToken: session ? session.refresh_token : null 
    };
  },

  /**
   * Login with email & password.
   * @param {{ email, password }} data
   */
  async login(data) {
    // Supabase yang ngurusin validasi hash password di belakang layar
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new AppError('Email atau password salah.', 401);

    const userId = authData.user.id;
    let actualRole = 'patient';
    let name = '';

    // Cari tau ini dokter atau pasien buat balikan data
    const { data: doctorData } = await supabase.from('doctor').select('name').eq('user_id', userId).single();
    if (doctorData) {
      actualRole = 'doctor';
      name = doctorData.name;
    } else {
      const { data: patientData } = await supabase.from('patient').select('name').eq('user_id', userId).single();
      if (patientData) name = patientData.name;
    }

    if (actualRole !== data.expectedRole) {
      // Supabase udah kebacut ngasih session, jadi kita hancurin (sign out) di sisi server
      await supabase.auth.signOut();
      
      throw new AppError(
        `Akses ditolak! Akun ini tidak terdaftar sebagai ${data.expectedRole}. Silakan login dengan email terdaftar atau di portal yang sesuai.`, 
        403
      );
    }

    return { 
      user: { id: userId, name, email: data.email, role: actualRole }, 
      accessToken: authData.session.access_token, 
      refreshToken: authData.session.refresh_token 
    };
  },

  /**
   * Refresh access token.
   * @param {string} refreshToken
   */
  async refresh(refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) throw new AppError('Invalid or expired refresh token.', 401);

    return { 
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    };
  },
};

module.exports = authService;