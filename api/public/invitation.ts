import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Tipos simplificados para el handler de Vercel
interface VercelRequest {
    method?: string;
    query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
    status: (code: number) => VercelResponse;
    json: (data: any) => void;
    setHeader: (name: string, value: string) => void;
    send: (body: string) => void;
}

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials missing');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
}

function formatDateSpanish(dateInput: any) {
    if (!dateInput) return '';
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    try {
        // Si ya es un objeto Date
        if (dateInput instanceof Date) {
            return `${dateInput.getDate()} de ${months[dateInput.getMonth()]} ${dateInput.getFullYear()}`;
        }

        const dateStr = String(dateInput);
        // Extraer solo la parte de la fecha (YYYY-MM-DD) si viene con tiempo
        const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
        const parts = cleanDate.split('-').map(Number);

        if (parts.length === 3 && !parts.some(isNaN)) {
            const [y, m, d] = parts;
            return `${d} de ${months[m - 1]} ${y}`;
        }

        // Fallback a parsing nativo si el formato es distinto
        // Sanear para Safari/Mobile incluso en el BFF (por consistencia)
        const sanitized = dateStr.replace(' ', 'T');
        const parsedDate = new Date(sanitized);
        if (!isNaN(parsedDate.getTime())) {
            return `${parsedDate.getUTCDate()} de ${months[parsedDate.getUTCMonth()]} ${parsedDate.getUTCFullYear()}`;
        }

        // Si falló el parsing y el resultado es una cadena inválida
        if (dateStr.toLowerCase().includes('nan')) return '';

        return dateStr;
    } catch (e) {
        const fallback = String(dateInput);
        return fallback.toLowerCase().includes('nan') ? '' : fallback;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const subdomain = req.query?.subdomain as string | undefined;

    if (!subdomain) {
        res.status(400);
        res.json({ error: 'Subdomain is required' });
        return;
    }

    try {
        const supabase = getSupabaseClient();
        const { data: client, error } = await supabase
            .from('clients')
            .select('*')
            .eq('subdomain', subdomain)
            .maybeSingle();

        // Template base (hardcoded como fallback seguro)
        // Eliminamos el script fijo para evitar errores de MIME type si el fallback se activa
        let html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="{{DESCRIPTION}}" />
    <title>{{TITLE}}</title>
    <meta property="og:title" content="{{TITLE}}" />
    <meta property="og:description" content="{{DESCRIPTION}}" />
  </head>
  <body>
    <div id="root"></div>
    <p style="text-align:center; padding: 2rem; font-family: sans-serif;">Cargando invitación...</p>
    <script>window.location.reload();</script>
  </body>
</html>`;

        // Intentar leer index.html real desde múltiples ubicaciones posibles en Vercel
        const possiblePaths = [
            path.join(process.cwd(), 'dist', 'index.html'),
            path.join(process.cwd(), 'index.html'),
            // En Vercel Serverless, a veces los archivos estáticos están en .next o similares
            // pero para Vite usualmente están en dist si se incluyeron.
        ];

        for (const templatePath of possiblePaths) {
            try {
                if (fs.existsSync(templatePath)) {
                    html = fs.readFileSync(templatePath, 'utf8');
                    console.log(`[BFF] Usando template desde: ${templatePath}`);
                    break;
                }
            } catch (e) {
                // Continuar buscando
            }
        }

        let title = 'Invitación de Boda';
        let description = 'Te invitamos a celebrar nuestra boda.';

        if (client) {
            const bride = client.bride_name || '';
            const groom = client.groom_name || '';
            const date = formatDateSpanish(client.wedding_date);

            if (bride && groom) {
                title = `Invitación de Boda · ${groom} & ${bride}`;
                description = `Te invitamos a celebrar nuestra boda. ${groom} & ${bride} - ${date}`;
            } else if (client.client_name) {
                title = `Invitación de Boda · ${client.client_name}`;
                description = `Te invitamos a celebrar nuestra boda. ${client.client_name} - ${date}`;
            }
        }

        // Reemplazo simple de meta tags y title
        // Buscamos patrones específicos o placeholders
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`);
        html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
        html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`);

        // Si el template usa placeholders {{TITLE}} y {{DESCRIPTION}}
        html = html.replace(/{{TITLE}}/g, title);
        html = html.replace(/{{DESCRIPTION}}/g, description);

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        res.status(200);
        res.send(html);

    } catch (error: any) {
        console.error('[BFF Error] Error sirviendo invitación:', error);
        res.status(500);
        res.send('Error interno del servidor');
    }
}
