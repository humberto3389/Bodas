import React from 'react';

interface SEOInvitationProps {
    clientData: {
        brideName?: string;
        groomName?: string;
        weddingDate?: string | Date;
        weddingTime?: string;
        ceremonyLocationName?: string;
        ceremonyAddress?: string;
    };
}

/**
 * SEO_Invitation Component
 * Inject structured data (JSON-LD) for a specific wedding invitation to improve visibility and Rich Results.
 */
export const SEO_Invitation: React.FC<SEOInvitationProps> = ({ clientData }) => {
    const coupleNames = `${clientData.brideName || 'Boda'} & ${clientData.groomName || 'Boda'}`;
    const weddingDateValue = clientData.weddingDate;
    let weddingDateStr = '';

    if (weddingDateValue instanceof Date) {
        weddingDateStr = weddingDateValue.toISOString().split('T')[0];
    } else {
        weddingDateStr = weddingDateValue || '';
    }

    const weddingTime = clientData.weddingTime || '12:00';

    // Formato ISO8601 para Schema.org (YYYY-MM-DDTHH:mm)
    let isoStartDate = '';
    if (weddingDateStr) {
        try {
            isoStartDate = `${weddingDateStr}T${weddingTime}`;
        } catch (e) {
            isoStartDate = weddingDateStr;
        }
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": `Boda de ${coupleNames}`,
        "startDate": isoStartDate,
        "location": {
            "@type": "Place",
            "name": clientData.ceremonyLocationName || 'Ubicación de la Ceremonia',
            "address": {
                "@type": "PostalAddress",
                "streetAddress": clientData.ceremonyAddress || '',
                "addressCountry": "PE"
            }
        },
        "image": [
            "https://suspiro-nupcial.vercel.app/boda.webp"
        ],
        "description": `Te invitamos a celebrar nuestra unión matrimonial. Acompáñanos en este día tan especial.`,
        "performer": {
            "@type": "Person",
            "name": coupleNames
        }
    };

    return (
        <script type="application/ld+json">
            {JSON.stringify(structuredData)}
        </script>
    );
};
