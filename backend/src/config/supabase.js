const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Cek URL:", supabaseUrl);
console.log("Cek Key:", supabaseKey ? "Key Terbaca" : "Key Kosong!");

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Tetep wajib false
    autoRefreshToken: false
  },
  // INI KUNCI UTAMANYA: Tembak langsung ke opsi transport realtime
  realtime: {
    transport: WebSocket
  }
});

module.exports = { supabase };