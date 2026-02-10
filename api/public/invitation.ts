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

function formatDateSpanish(dateStr: string) {
    if (!dateStr) return '';
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        return `${d} de ${months[m - 1]} ${y}`;
    } catch (e) {
        return dateStr;
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
        let html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="{{DESCRIPTION}}" />
    <meta name="theme-color" content="#ffffff" />
    <title>{{TITLE}}</title>
    <meta property="og:title" content="{{TITLE}}" />
    <meta property="og:description" content="{{DESCRIPTION}}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Dancing+Script:wght@400;600&family=Alex+Brush&display=swap" />
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

        // Intentar leer index.html real si existe en el entorno
        try {
            const templatePath = path.join(process.cwd(), 'index.html');
            if (fs.existsSync(templatePath)) {
                html = fs.readFileSync(templatePath, 'utf8');
            }
        } catch (e) {
            console.warn('[BFF] No se pudo leer index.html, usando template fallback');
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
