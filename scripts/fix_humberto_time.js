
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan credenciales de Supabase');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixClientTime() {
    const subdomain = 'humberto-nelida';
    // 12:30 PM Lima = 17:30 UTC
    const correctTimeText = "12:30 PM";
    const correctUTC = "2026-02-21T17:30:00+00:00";

    console.log(`Fijando hora para ${subdomain}...`);

    const { data, error } = await supabase
        .from('clients')
        .update({
            wedding_time: correctTimeText,
            wedding_datetime_utc: correctUTC
        })
        .eq('subdomain', subdomain)
        .select();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('✅ Éxito:', data);
    }
}

fixClientTime();
