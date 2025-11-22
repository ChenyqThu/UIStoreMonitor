import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Support both VITE_ prefixed (for shared .env) and non-prefixed variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_KEY/VITE_SUPABASE_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
