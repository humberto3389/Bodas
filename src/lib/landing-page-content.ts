import { supabase } from './supabase';

export interface LandingPageContent {
  id?: string;
  // Hero Section
  heroBadgeText: string;
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroTitleLine2: string;
  heroTitleLine3: string;
  heroDescription: string;
  heroButton1Text: string;
  heroButton2Text: string;

  // Features Section
  featuresBadge: string;
  featuresTitleLine1: string;
  featuresTitleHighlight: string;
  featuresDescription: string;
  featuresList: Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  // Plans Section
  plansBadge: string;
  plansTitleLine1: string;
  plansTitleHighlight: string;
  plansDescription: string;
  plansPopularBadge: string;
  plansData: {
    basic: {
      name: string;
      duration: number;
      maxGuests: number;
      price: number;
      features: string[];
    };
    premium: {
      name: string;
      duration: number;
      maxGuests: number;
      price: number;
      features: string[];
    };
    deluxe: {
      name: string;
      duration: number;
      maxGuests: number;
      price: number;
      features: string[];
    };
  };

  // Contact Section
  contactBadge: string;
  contactTitleLine1: string;
  contactTitleHighlight: string;
  contactDescription: string;

  // Footer
  footerBrandName: string;
  footerDescription: string;
  footerLinks: string[];
  footerSocialLinks: string[];
  footerCopyright: string;
  footerCopyrightText: string;
  footerEmail: string;
  footerPhone: string;
}

const defaultContent: LandingPageContent = {
  heroBadgeText: 'Tu historia de amor, compartida elegantemente',
  heroTitleLine1: 'Donde cada',
  heroTitleHighlight: 'suspiro',
  heroTitleLine2: 'se convierte',
  heroTitleLine3: 'en eternidad',
  heroDescription: 'Crea un sitio web excepcional para tu boda. Comparte tu amor con elegancia y haz que cada momento sea memorable para tus invitados con nuestra plataforma de última generación.',
  heroButton1Text: 'Descubrir Planes',
  heroButton2Text: 'Consultar Disponibilidad',

  featuresBadge: 'CARACTERÍSTICAS EXCLUSIVAS',
  featuresTitleLine1: 'Diseñado para el',
  featuresTitleHighlight: 'amor eterno',
  featuresDescription: 'Cada detalle cuidadosamente creado para hacer de tu sitio web el reflejo perfecto de tu historia de amor',
  featuresList: [
    { icon: '💒', title: 'Diseño Exclusivo', description: 'Plantillas únicas adaptadas a tu estilo y personalidad con tecnología de vanguardia' },
    { icon: '📸', title: 'Galería Elegante', description: 'Muestra tus mejores momentos con una galería sofisticada y de alta resolución' },
    { icon: '✉️', title: 'RSVP Inteligente', description: 'Gestión automática de confirmaciones con recordatorios inteligentes' },
    { icon: '💌', title: 'Mensajes Especiales', description: 'Libro de visitas digital para recuerdos eternos de tus seres queridos' },
    { icon: '⏰', title: 'Cuenta Regresiva', description: 'Mantén la emoción con un contador elegante y personalizable' },
    { icon: '🎵', title: 'Ambiente Musical', description: 'Tu canción especial ambientando cada visita al sitio' }
  ],

  plansBadge: 'PLANES Y PRECIOS',
  plansTitleLine1: 'El plan perfecto para',
  plansTitleHighlight: 'tu día especial',
  plansDescription: 'Desde lo esencial hasta una experiencia completa y personalizada para hacer tu boda inolvidable',
  plansPopularBadge: 'Más Popular',
  plansData: {
    basic: {
      name: 'Básico',
      duration: 30,
      maxGuests: 50,
      price: 100,
      features: ['Sitio web personalizado', 'Galería de fotos (30)', '1 Video (2 min)', 'RSVP (50)', 'Mensajes (50)', 'Padrinos']
    },
    premium: {
      name: 'Premium',
      duration: 60,
      maxGuests: 200,
      price: 200,
      features: ['Sitio web personalizado', 'Galería de fotos (80)', '3 Videos (5 min)', 'RSVP (200)', 'Mensajes (200)', 'Countdown', 'Música de fondo', 'Padrinos']
    },
    deluxe: {
      name: 'Deluxe',
      duration: 90,
      maxGuests: 999999,
      price: 300,
      features: ['Invitados ILIMITADOS', 'Fotos ilimitadas', 'Videos ilimitadas (10 min c/u)', 'RSVP Ilimitado', 'Mensajes Ilimitados', 'Animaciones avanzadas', 'Video de fondo', 'Padrinos']
    }
  },

  contactBadge: 'CONTACTO',
  contactTitleLine1: 'Comienza tu',
  contactTitleHighlight: 'historia de amor',
  contactDescription: 'Estamos aquí para hacer realidad el sitio web perfecto para tu boda. Cuéntanos sobre tu proyecto y creemos magia juntos.',

  footerBrandName: 'SuspiroNupcial',
  footerDescription: 'Creamos sitios web excepcionales para bodas, donde cada detalle cuenta la historia única de tu amor. Elegante, moderno y memorable.',
  footerLinks: ['Servicios', 'Planes', 'Contacto', 'Login'],
  footerSocialLinks: ['Instagram', 'Facebook', 'Pinterest'],
  footerCopyright: '© 2024 SuspiroNupcial. Todos los derechos reservados.',
  footerCopyrightText: 'Hecho con 💕 para tu día especial',
  footerEmail: 'hola@suspironupcial.com',
  footerPhone: '+58 412 123 4567'
};

/**
 * Carga el contenido del Landing Page desde Supabase
 */
export async function loadLandingPageContent(): Promise<LandingPageContent> {
  try {
    const { data, error } = await supabase
      .from('landing_page_content')
      .select('*')
      .limit(1)
      .limit(1)
      .maybeSingle();

    if (error) {
      return defaultContent;
    }

    if (!data) {
      // Si no hay contenido, crear uno con valores por defecto
      return defaultContent;
    }

    // Mapear los datos de Supabase al formato de la interfaz
    return {
      id: data.id,
      heroBadgeText: data.hero_badge_text || defaultContent.heroBadgeText,
      heroTitleLine1: data.hero_title_line1 || defaultContent.heroTitleLine1,
      heroTitleHighlight: data.hero_title_highlight || defaultContent.heroTitleHighlight,
      heroTitleLine2: data.hero_title_line2 || defaultContent.heroTitleLine2,
      heroTitleLine3: data.hero_title_line3 || defaultContent.heroTitleLine3,
      heroDescription: data.hero_description || defaultContent.heroDescription,
      heroButton1Text: data.hero_button1_text || defaultContent.heroButton1Text,
      heroButton2Text: data.hero_button2_text || defaultContent.heroButton2Text,

      featuresBadge: data.features_badge || defaultContent.featuresBadge,
      featuresTitleLine1: data.features_title_line1 || defaultContent.featuresTitleLine1,
      featuresTitleHighlight: data.features_title_highlight || defaultContent.featuresTitleHighlight,
      featuresDescription: data.features_description || defaultContent.featuresDescription,
      featuresList: Array.isArray(data.features_list) ? data.features_list : defaultContent.featuresList,

      plansBadge: data.plans_badge || defaultContent.plansBadge,
      plansTitleLine1: data.plans_title_line1 || defaultContent.plansTitleLine1,
      plansTitleHighlight: data.plans_title_highlight || defaultContent.plansTitleHighlight,
      plansDescription: data.plans_description || defaultContent.plansDescription,
      plansPopularBadge: data.plans_popular_badge || defaultContent.plansPopularBadge,
      plansData: data.plans_data && typeof data.plans_data === 'object'
        ? data.plans_data as LandingPageContent['plansData']
        : defaultContent.plansData,

      contactBadge: data.contact_badge || defaultContent.contactBadge,
      contactTitleLine1: data.contact_title_line1 || defaultContent.contactTitleLine1,
      contactTitleHighlight: data.contact_title_highlight || defaultContent.contactTitleHighlight,
      contactDescription: data.contact_description || defaultContent.contactDescription,

      footerBrandName: data.footer_brand_name || defaultContent.footerBrandName,
      footerDescription: data.footer_description || defaultContent.footerDescription,
      footerLinks: Array.isArray(data.footer_links) ? data.footer_links : defaultContent.footerLinks,
      footerSocialLinks: Array.isArray(data.footer_social_links) ? data.footer_social_links : defaultContent.footerSocialLinks,
      footerCopyright: data.footer_copyright || defaultContent.footerCopyright,
      footerCopyrightText: data.footer_copyright_text || defaultContent.footerCopyrightText,
      footerEmail: data.footer_email || defaultContent.footerEmail,
      footerPhone: data.footer_phone || defaultContent.footerPhone
    };
  } catch (error) {
    return defaultContent;
  }
}

/**
 * Guarda el contenido del Landing Page en Supabase
 */
export async function saveLandingPageContent(content: LandingPageContent): Promise<boolean> {
  try {
    const payload = {
      hero_badge_text: content.heroBadgeText,
      hero_title_line1: content.heroTitleLine1,
      hero_title_highlight: content.heroTitleHighlight,
      hero_title_line2: content.heroTitleLine2,
      hero_title_line3: content.heroTitleLine3,
      hero_description: content.heroDescription,
      hero_button1_text: content.heroButton1Text,
      hero_button2_text: content.heroButton2Text,

      features_badge: content.featuresBadge,
      features_title_line1: content.featuresTitleLine1,
      features_title_highlight: content.featuresTitleHighlight,
      features_description: content.featuresDescription,
      features_list: content.featuresList,

      plans_badge: content.plansBadge,
      plans_title_line1: content.plansTitleLine1,
      plans_title_highlight: content.plansTitleHighlight,
      plans_description: content.plansDescription,
      plans_popular_badge: content.plansPopularBadge,
      plans_data: content.plansData,

      contact_badge: content.contactBadge,
      contact_title_line1: content.contactTitleLine1,
      contact_title_highlight: content.contactTitleHighlight,
      contact_description: content.contactDescription,

      footer_brand_name: content.footerBrandName,
      footer_description: content.footerDescription,
      footer_links: content.footerLinks,
      footer_social_links: content.footerSocialLinks,
      footer_copyright: content.footerCopyright,
      footer_copyright_text: content.footerCopyrightText,
      footer_email: content.footerEmail,
      footer_phone: content.footerPhone
    };

    // Intentar actualizar primero
    if (content.id) {
      const { error } = await supabase
        .from('landing_page_content')
        .update(payload)
        .eq('id', content.id);

      if (error) {
        console.error('[saveLandingPageContent] Error en UPDATE:', error);
        throw error;
      }
      return true;
    }

    // Si no hay ID, verificar si existe un registro y actualizarlo, o insertar uno nuevo
    const { data: existing, error: checkError } = await supabase
      .from('landing_page_content')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('[saveLandingPageContent] Error verificando existencia:', checkError);
    }

    if (existing?.id) {
      // Actualizar el registro existente
      const { error } = await supabase
        .from('landing_page_content')
        .update(payload)
        .eq('id', existing.id);

      if (error) {
        console.error('[saveLandingPageContent] Error en UPDATE (existente):', error);
        throw error;
      }
    } else {
      // Insertar nuevo registro
      const { error } = await supabase
        .from('landing_page_content')
        .insert([payload]); // Pasamos como array para ser más explícitos

      if (error) {
        console.error('[saveLandingPageContent] Error en INSERT:', error);
        throw error;
      }
    }
    return true;
  } catch (error: any) {
    console.error('[saveLandingPageContent] Error crítico:', error);
    if (error.code) console.error('[saveLandingPageContent] Código de error:', error.code);
    if (error.details) console.error('[saveLandingPageContent] Detalles:', error.details);
    if (error.hint) console.error('[saveLandingPageContent] Sugerencia:', error.hint);
    return false;
  }
}

