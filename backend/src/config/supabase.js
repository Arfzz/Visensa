const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Cek URL:", supabaseUrl);
console.log("Cek Key:", supabaseKey ? "Key Terbaca" : "Key Kosong!");

// Admin singleton (Service Role) - Bypasses RLS
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket }
});

// Factory for auth operations (Anon) - Prevents session pollution on singleton
const createAuthClient = () => createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket }
});

module.exports = { supabase, createAuthClient };