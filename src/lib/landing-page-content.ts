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
  heroMicrocopy: string;
  heroButton1Text: string;
  heroButton2Text: string;

  // Demo Section
  demoSectionTitle: string;
  demoMediaUrl: string;
  demoUrl: string;
  demoCtaText: string;

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

  // Testimonials Section
  testimonialsTitle: string;
  testimonialsList: Array<{
    id?: string;
    type?: 'real' | 'fake';
    name: string;
    date: string;
    text: string;
    avatarUrl: string;
    rating?: number;
  }>;

  // Control Section
  controlSectionTitle: string;
  controlSectionText: string;

  // Plans Section
  plansBadge: string;
  plansTitleLine1: string;
  plansTitleHighlight: string;
  plansDescription: string;
  plansPopularBadge: string;
  pricingHighlightLabel: string;
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

  // WhatsApp & Sticky CTA
  stickyCtaText: string;
  whatsappMessage: string;

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
  heroTitleLine1: '💍 Crea la',
  heroTitleHighlight: 'página web',
  heroTitleLine2: 'de tu boda',
  heroTitleLine3: '',
  heroDescription: 'Comparte un solo enlace y sorprende a todos tus invitados con una experiencia única ✨',
  heroMicrocopy: 'Desde S/39 • Lista en 24h • Fácil de personalizar',
  heroButton1Text: '💬 Pedir mi invitación',
  heroButton2Text: 'Consultar Disponibilidad',

  demoSectionTitle: 'Mira cómo se verá tu invitación',
  demoMediaUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
  demoUrl: 'https://suspiro-nupcial.vercel.app/invitacion/humberto-nelida',
  demoCtaText: '💍 Mira cómo se verá tu invitación',

  featuresBadge: 'CARACTERÍSTICAS EXCLUSIVAS',
  featuresTitleLine1: 'Diseñado para el',
  featuresTitleHighlight: 'amor eterno',
  featuresDescription: 'Cada detalle cuidadosamente creado para hacer de tu sitio web el reflejo perfecto de tu historia de amor',
  featuresList: [
    { icon: '💖', title: 'Todo en un solo enlace', description: 'Reúne toda la información de tu boda en un único lugar.' },
    { icon: '📱', title: 'Se ve perfecto en celular', description: 'Diseño responsivo optimizado para cualquier dispositivo.' },
    { icon: '⚡', title: 'Lista en menos de 24 horas', description: 'Tu página web estará lista para compartir rápidamente.' },
    { icon: '🌿', title: 'Sin impresiones', description: 'Olvídate del papel y sé amigable con el medio ambiente.' }
  ],

  testimonialsTitle: 'Lo que dicen las parejas',
  testimonialsList: [
    { 
      type: 'fake',
      name: 'Mar & Alex', 
      date: 'Mayo 2024', 
      text: 'Excelente servicio, muy fácil de usar y a todos los invitados les encantó. La recomendamos 100%.', 
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
      rating: 5
    },
    { 
      type: 'fake',
      name: 'Sofía & Diego', 
      date: 'Octubre 2023', 
      text: 'Nos ahorró muchísimo estrés. El control de confirmación de asistencia es una maravilla.', 
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80',
      rating: 5
    }
  ],

  controlSectionTitle: 'Tú tienes el control',
  controlSectionText: 'Personaliza tu invitación desde tu propio panel: agrega fotos, música, ubicación y todos los detalles de tu boda sin complicaciones.',

  plansBadge: 'PLANES Y PRECIOS',
  plansTitleLine1: 'El plan perfecto para',
  plansTitleHighlight: 'tu día especial',
  plansDescription: 'Desde lo esencial hasta una experiencia completa y personalizada para hacer tu boda inolvidable',
  plansPopularBadge: 'Más Popular',
  pricingHighlightLabel: '⭐ Más elegido',
  plansData: {
    basic: {
      name: 'ESENCIAL',
      duration: 30,
      maxGuests: 50,
      price: 39,
      features: ['Página web personalizada', 'Datos principales', 'Cuenta regresiva', 'Link único', 'Ideal para una invitación simple y elegante']
    },
    premium: {
      name: 'PREMIUM',
      duration: 60,
      maxGuests: 200,
      price: 59,
      features: ['Todo lo de Esencial', 'Galería de fotos', 'Música de fondo', 'Ubicación con mapa', 'Detalles del evento', 'La opción favorita para sorprender a tus invitados']
    },
    deluxe: {
      name: 'DELUXE',
      duration: 90,
      maxGuests: 999999,
      price: 89,
      features: ['Todo lo de Premium', 'Animaciones avanzadas', 'Mayor impacto visual', 'Una experiencia única que tus invitados recordarán', 'Padrinos']
    }
  },

  stickyCtaText: '👉 💬 Pedir mi invitación (Desde S/39)',
  whatsappMessage: 'Hola, quiero mi página web de boda. Me gustaría más información sobre los planes 💍',

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
      .maybeSingle();

    if (error) {
      return defaultContent;
    }

    if (!data) {
      return defaultContent;
    }

    return {
      id: data.id,
      heroBadgeText: data.hero_badge_text || defaultContent.heroBadgeText,
      heroTitleLine1: data.hero_title_line1 || defaultContent.heroTitleLine1,
      heroTitleHighlight: data.hero_title_highlight || defaultContent.heroTitleHighlight,
      heroTitleLine2: data.hero_title_line2 !== undefined && data.hero_title_line2 !== null ? data.hero_title_line2 : defaultContent.heroTitleLine2,
      heroTitleLine3: data.hero_title_line3 !== undefined && data.hero_title_line3 !== null ? data.hero_title_line3 : defaultContent.heroTitleLine3,
      heroDescription: data.hero_description || defaultContent.heroDescription,
      heroMicrocopy: data.hero_microcopy || defaultContent.heroMicrocopy,
      heroButton1Text: data.hero_button1_text || defaultContent.heroButton1Text,
      heroButton2Text: data.hero_button2_text || defaultContent.heroButton2Text,

      demoSectionTitle: data.demo_section_title || defaultContent.demoSectionTitle,
      demoMediaUrl: data.demo_media_url || defaultContent.demoMediaUrl,
      demoUrl: data.demo_url || defaultContent.demoUrl,
      demoCtaText: data.demo_cta_text || defaultContent.demoCtaText,

      featuresBadge: data.features_badge || defaultContent.featuresBadge,
      featuresTitleLine1: data.features_title_line1 || defaultContent.featuresTitleLine1,
      featuresTitleHighlight: data.features_title_highlight || defaultContent.featuresTitleHighlight,
      featuresDescription: data.features_description || defaultContent.featuresDescription,
      featuresList: Array.isArray(data.features_list) ? data.features_list : defaultContent.featuresList,

      testimonialsTitle: data.testimonials_title || defaultContent.testimonialsTitle,
      testimonialsList: Array.isArray(data.testimonials_list) ? data.testimonials_list : defaultContent.testimonialsList,

      controlSectionTitle: data.control_section_title || defaultContent.controlSectionTitle,
      controlSectionText: data.control_section_text || defaultContent.controlSectionText,

      plansBadge: data.plans_badge || defaultContent.plansBadge,
      plansTitleLine1: data.plans_title_line1 || defaultContent.plansTitleLine1,
      plansTitleHighlight: data.plans_title_highlight || defaultContent.plansTitleHighlight,
      plansDescription: data.plans_description || defaultContent.plansDescription,
      plansPopularBadge: data.plans_popular_badge || defaultContent.plansPopularBadge,
      pricingHighlightLabel: data.pricing_highlight_label || defaultContent.pricingHighlightLabel,
      plansData: data.plans_data && typeof data.plans_data === 'object'
        ? data.plans_data as LandingPageContent['plansData']
        : defaultContent.plansData,

      stickyCtaText: data.sticky_cta_text || defaultContent.stickyCtaText,
      whatsappMessage: data.whatsapp_message || defaultContent.whatsappMessage,

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
      hero_microcopy: content.heroMicrocopy,
      hero_button1_text: content.heroButton1Text,
      hero_button2_text: content.heroButton2Text,

      demo_section_title: content.demoSectionTitle,
      demo_media_url: content.demoMediaUrl,
      demo_url: content.demoUrl,
      demo_cta_text: content.demoCtaText,

      features_badge: content.featuresBadge,
      features_title_line1: content.featuresTitleLine1,
      features_title_highlight: content.featuresTitleHighlight,
      features_description: content.featuresDescription,
      features_list: content.featuresList,

      testimonials_title: content.testimonialsTitle,
      testimonials_list: content.testimonialsList,

      control_section_title: content.controlSectionTitle,
      control_section_text: content.controlSectionText,

      plans_badge: content.plansBadge,
      plans_title_line1: content.plansTitleLine1,
      plans_title_highlight: content.plansTitleHighlight,
      plans_description: content.plansDescription,
      plans_popular_badge: content.plansPopularBadge,
      pricing_highlight_label: content.pricingHighlightLabel,
      plans_data: content.plansData,
      
      sticky_cta_text: content.stickyCtaText,
      whatsapp_message: content.whatsappMessage,

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

    if (content.id) {
      const { error } = await supabase
        .from('landing_page_content')
        .update(payload)
        .eq('id', content.id);
      if (error) throw error;
      return true;
    }

    const { data: existing, error: checkError } = await supabase
      .from('landing_page_content')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from('landing_page_content')
        .update(payload)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('landing_page_content')
        .insert([payload]);
      if (error) throw error;
    }
    return true;
  } catch (error: any) {
    console.error('[saveLandingPageContent] Error crítico:', error);
    return false;
  }
}


