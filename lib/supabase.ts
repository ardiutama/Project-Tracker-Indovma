import { createClient } from '@supabase/supabase-js';

// NOTE: Ganti dengan URL dan Anon Key dari proyek Supabase Anda.
// Anda bisa menemukannya di pengaturan API proyek Supabase Anda.
// Sangat disarankan untuk menggunakan environment variables untuk nilai-nilai ini.
// FIX: Explicitly type Supabase credentials as strings to resolve TypeScript's "no overlap" comparison error.
// This allows the placeholder check to function correctly without the compiler inferring un-comparable literal types.
const supabaseUrl: string = 'https://wvkqmocyvmdwgffxnvjo.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2a3Ftb2N5dm1kd2dmZnhudmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjc2NTYsImV4cCI6MjA3Nzc0MzY1Nn0.w5vVPsPTdqYwAytdSZvUkwjZUaTgwg9sPE43nA31g40';

// Menampilkan peringatan di konsol jika kredensial default tidak diubah.
// Ini membantu mengingatkan pengguna untuk mengkonfigurasi koneksi Supabase mereka.
if (supabaseUrl === 'https://your-project-url.supabase.co' || supabaseAnonKey === 'your-anon-key') {
    console.warn(`
      ***********************************************************************************************************************************
      *                                                                                                                                 *
      *  Peringatan: Kredensial Supabase Belum Dikonfigurasi.                                                                             *
      *  Buka file 'lib/supabase.ts' dan ganti placeholder 'supabaseUrl' dan 'supabaseAnonKey' dengan kredensial proyek Supabase Anda. *
      *  Tanpa konfigurasi ini, aplikasi tidak akan dapat menyimpan atau mengambil data.                                               *
      *                                                                                                                                 *
      ***********************************************************************************************************************************
    `);
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);