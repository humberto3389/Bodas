import React from 'react';

/**
 * SEO_Landing Component
 * Inject structured data (JSON-LD) for the Landing Page to improve business visibility in search results.
 */
export const SEO_Landing: React.FC = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Suspiro Nupcial",
        "image": "https://suspiro-nupcial.vercel.app/boda.webp",
        "description": "Servicio premium de invitaciones de boda digitales e interactivas con RSVP, música y galerías.",
        "url": "https://suspiro-nupcial.vercel.app/",
        "telephone": "+51960696131",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "PE"
        },
        "priceRange": "$$",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Planes de Invitación",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Plan Básico"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Plan Premium"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Plan Deluxe"
                    }
                }
            ]
        }
    };

    return (
        <script type="application/ld+json">
            {JSON.stringify(structuredData)}
        </script>
    );
};
