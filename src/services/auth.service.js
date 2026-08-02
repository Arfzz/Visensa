const AppError = require('../utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/authenticate');

/**
 * AuthService — Business logic for authentication.
 *
 * All DB operations are stubbed with mock data.
 * Replace the STUB sections with Supabase calls when DB is ready.
 */

const authService = {
  /**
   * Register a new user.
   * @param {{ name, email, password, role }} data
   */
  async register(data) {
    // ---- STUB: Check if email already exists ----
    // TODO: Replace with Supabase query:
    // const { data: existing } = await supabase.from('users').select('id').eq('email', data.email).single();
    // if (existing) throw new AppError('Email is already registered.', 409);

    const mockExistingEmails = ['test@example.com'];
    if (mockExistingEmails.includes(data.email)) {
      throw new AppError('Email is already registered.', 409);
    }

    // ---- STUB: Hash password & create user ----
    // TODO: const hashedPassword = await bcrypt.hash(data.password, 12);
    // const { data: user } = await supabase.from('users').insert({ ...data, password: hashedPassword }).select().single();

    const newUser = {
      id: 'mock-uuid-' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date().toISOString(),
    };

    const accessToken = generateAccessToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
    const refreshToken = generateRefreshToken({ userId: newUser.id });

    return { user: newUser, accessToken, refreshToken };
  },

  /**
   * Login with email & password.
   * @param {{ email, password }} data
   */
  async login(data) {
    // ---- STUB: Find user by email ----
    // TODO: const { data: user } = await supabase.from('users').select('*').eq('email', data.email).single();
    // if (!user) throw new AppError('Invalid email or password.', 401);

    const mockUser = {
      id: 'mock-uuid-123',
      name: 'Mock User',
      email: data.email,
      role: data.email.includes('doctor') ? 'doctor' : 'patient',
    };

    // ---- STUB: Verify password ----
    // TODO: const isValid = await bcrypt.compare(data.password, user.password);
    // if (!isValid) throw new AppError('Invalid email or password.', 401);

    const accessToken = generateAccessToken({ userId: mockUser.id, email: mockUser.email, role: mockUser.role });
    const refreshToken = generateRefreshToken({ userId: mockUser.id });

    return { user: mockUser, accessToken, refreshToken };
  },

  /**
   * Refresh access token.
   * @param {string} refreshToken
   */
  async refresh(refreshToken) {
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    // TODO: Verify userId still exists in DB
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: 'mock@email.com', // replace with DB user
      role: 'patient',         // replace with DB user
    });

    return { accessToken: newAccessToken };
  },
};

module.exports = authService;
