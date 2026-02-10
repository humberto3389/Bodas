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

// ✅ ELIMINADO: formatDateSpanish. No se usa en los meta tags.
// La descripción NO incluye fecha para evitar errores con parsing de fechas.

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
        // ✅ La descripción NO incluye la fecha del evento para evitar errores de parsing en móviles (NaN).
        // WhatsApp usa esta descripción para la vista previa del enlace compartido.
        let description = 'Te invitamos a celebrar nuestra boda.';

        if (client) {
            const bride = client.bride_name || '';
            const groom = client.groom_name || '';

            if (bride && groom) {
                title = `${groom} & ${bride}`;
                // IMPORTANTE: La descripción se mantiene sin fecha intencionalmente
                // No agregar: ${formattedDate} ni fecha en ningún formato
            } else if (client.client_name) {
                title = `${client.client_name}`;
                // description remains strict
            }
        }

        // Reemplazo ROBUSTO de meta tags y title
        // Esta regex maneja variaciones de atributos y comillas, asegurando que se sobrescriba el contenido

        // 1. Reemplazo de <title>
        html = html.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);

        // 2. Reemplazo de <meta name="description" ...>
        // Maneja: name antes o después de content, comillas simples o dobles
        html = html.replace(/<meta[^>]*name=["']description["'][^>]*content=["'].*?["'][^>]*\/?>/gi,
            `<meta name="description" content="${description}" />`);
        html = html.replace(/<meta[^>]*content=["'].*?["'][^>]*name=["']description["'][^>]*\/?>/gi,
            `<meta name="description" content="${description}" />`);

        // 3. Reemplazo de <meta property="og:title" ...>
        html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*content=["'].*?["'][^>]*\/?>/gi,
            `<meta property="og:title" content="${title}" />`);
        html = html.replace(/<meta[^>]*content=["'].*?["'][^>]*property=["']og:title["'][^>]*\/?>/gi,
            `<meta property="og:title" content="${title}" />`);

        // 4. Reemplazo de <meta property="og:description" ...>
        html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*content=["'].*?["'][^>]*\/?>/gi,
            `<meta property="og:description" content="${description}" />`);
        html = html.replace(/<meta[^>]*content=["'].*?["'][^>]*property=["']og:description["'][^>]*\/?>/gi,
            `<meta property="og:description" content="${description}" />`);

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
