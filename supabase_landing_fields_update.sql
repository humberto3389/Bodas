-- SQL Script para agregar los nuevos campos de rediseño a la tabla landing_page_content
-- Ejecutar este script desde el SQL Editor de Supabase.

ALTER TABLE landing_page_content
  ADD COLUMN IF NOT EXISTS hero_microcopy TEXT DEFAULT 'Desde S/39 • Lista en 24h • Fácil de personalizar',
  ADD COLUMN IF NOT EXISTS demo_section_title TEXT DEFAULT 'Mira cómo se verá tu invitación',
  ADD COLUMN IF NOT EXISTS demo_url TEXT DEFAULT 'https://suspiro-nupcial.vercel.app/invitacion/humberto-nelida',
  ADD COLUMN IF NOT EXISTS demo_media_url TEXT DEFAULT 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
  ADD COLUMN IF NOT EXISTS demo_cta_text TEXT DEFAULT '💍 Mira cómo se verá tu invitación',
  ADD COLUMN IF NOT EXISTS control_section_title TEXT DEFAULT 'Tú tienes el control',
  ADD COLUMN IF NOT EXISTS control_section_text TEXT DEFAULT 'Personaliza tu invitación desde tu propio panel: agrega fotos, música, ubicación y todos los detalles de tu boda sin complicaciones.',
  ADD COLUMN IF NOT EXISTS pricing_highlight_label TEXT DEFAULT '⭐ Más elegido',
  ADD COLUMN IF NOT EXISTS sticky_cta_text TEXT DEFAULT '👉 💬 Pedir mi invitación (Desde S/39)',
  ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'Hola, quiero mi página web de boda. Me gustaría más información sobre los planes 💍',
  ADD COLUMN IF NOT EXISTS testimonials_title TEXT DEFAULT 'Lo que dicen las parejas',
  ADD COLUMN IF NOT EXISTS testimonials_list JSONB DEFAULT '[{"name": "Mar & Alex", "date": "Mayo 2024", "text": "Excelente servicio, muy fácil de usar y a todos los invitados les encantó. La recomendamos 100%.", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80"}, {"name": "Sofía & Diego", "date": "Octubre 2023", "text": "Nos ahorró muchísimo estrés. El control de confirmación de asistencia es una maravilla.", "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80"}]'::jsonb;

-- Opcional: Actualizar el registro existente (asumiendo que hay 1 fila de configuracion general)
-- UPDATE landing_page_content SET hero_title_line1 = '💍 Crea la', hero_title_highlight = 'página web', hero_title_line2 = 'de tu boda', hero_title_line3 = '', hero_description = 'Comparte un solo enlace y sorprende a todos tus invitados con una experiencia única ✨', hero_button1_text = '💬 Pedir mi invitación';
