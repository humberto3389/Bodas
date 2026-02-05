
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

async function checkClientTime() {
    const { data, error } = await supabase
        .from('clients')
        .select('id, client_name, subdomain, wedding_time, wedding_datetime_utc, reception_time')
        .eq('subdomain', 'humberto-nelida')
        .maybeSingle();

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!data) {
        console.log('Cliente no encontrado');
        return;
    }

    console.log('--- DIAGNÓSTICO DE TIEMPO PARA HUMBERTO & NELIDA ---');
    console.log('Subdomain:', data.subdomain);
    console.log('wedding_time (texto):', `"${data.wedding_time}"`);
    console.log('wedding_datetime_utc:', data.wedding_datetime_utc);
    console.log('reception_time (texto):', `"${data.reception_time}"`);

    // Analizar longitud por caracteres invisibles
    if (data.wedding_time) {
        console.log('Longitud wedding_time:', data.wedding_time.length);
    }
}

checkClientTime();
