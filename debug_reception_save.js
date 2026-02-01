
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Configurar dotenv para leer .env en la raíz
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUpdate() {
    console.log("--- Inicio de Depuración de Guardado ---");

    // Datos del cliente Ana (Plan Basic)
    const email = 'ana@gmial.com';
    const token = 'boda-ana-jhon-1769782355294-5wyve0';
    const clientId = 'b3475e1d-1415-4997-9a34-f1e00614935f';

    console.log(`Intentando autenticar como: ${email}`);

    // 1. Login simula lo que hace auth-system
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: token
    });

    if (authError) {
        console.error("❌ Error de Autenticación:", authError.message);
        console.log("Intentando update anónimo (puede fallar por RLS)...");
    } else {
        console.log("✅ Autenticado correctamente.");
    }

    // 2. Intentar actualizar reception_location_name
    console.log("Intentando actualizar 'reception_location_name'...");

    const { data, error } = await supabase
        .from('clients')
        .update({
            reception_location_name: "UBICACIÓN DE PRUEBA (DEBUG)",
            reception_address: "Dirección de Prueba 123"
        })
        .eq('id', clientId)
        .select();

    if (error) {
        console.error("❌ Error al actualizar:", error.message);
        console.error("Detalles:", error);
    } else if (!data || data.length === 0) {
        console.error("❌ La actualización no retornó datos (¿RLS bloqueó silenciosamente o ID incorrecto?)");
    } else {
        console.log("✅ Actualización exitosa. Datos retornados:");
        console.log("Reception Location:", data[0].reception_location_name);

        // Verificar si persistió
        if (data[0].reception_location_name === "UBICACIÓN DE PRUEBA (DEBUG)") {
            console.log("CONCLUSIÓN: La base de datos PERMITE guardar. El problema está en el Frontend (useClientAdmin/ContentEditor).");
        } else {
            console.log("CONCLUSIÓN: La base de datos aceptó el comando pero NO guardó el valor (Trigger o RLS raro).");
        }
    }
}

debugUpdate();
