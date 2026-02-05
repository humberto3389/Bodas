// Utilidades para manejo de tiempo civil y UTC (Default: America/Lima, UTC-5)
// El sistema garantiza que lo configurado en el admin sea lo que se vea en la invitación.

export const PERU_TIMEZONE = 'America/Lima';

/**
 * Convierte cualquier entrada de hora a formato estricto 24h (HH:mm).
 * Maneja AM/PM y formatos de 24h directos.
 */
export function validateAndFormatTime(timeInput: string): string {
    if (!timeInput) return '12:00';

    const clean = timeInput.trim().toUpperCase();
    const pmRegex = /P\.?M\.?/;
    const amRegex = /A\.?M\.?/;
    const hasPM = pmRegex.test(clean);
    const hasAM = amRegex.test(clean);

    const timeMatch = clean.match(/(\d{1,2}):(\d{1,2})/);
    if (!timeMatch) return '12:00';

    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    if (hasPM) {
        if (hour < 12) hour += 12;
    } else if (hasAM) {
        if (hour === 12) hour = 0;
    }

    const finalHour = Math.max(0, Math.min(23, hour));
    const finalMinute = Math.max(0, Math.min(59, minute));

    return `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;
}

/**
 * Formatea una hora 24h (HH:mm) a un formato legible para el invitado (h:mm AM/PM).
 */
export function formatTimeForDisplay(time24h: string | undefined | null): string {
    if (!time24h) return '';
    const clean = validateAndFormatTime(time24h);
    const [h, m] = clean.split(':').map(Number);

    const ampm = h >= 12 ? 'p. m.' : 'a. m.';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;

    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Combina una fecha civil (YYYY-MM-DD) y una hora civil (HH:mm) en un ISO String UTC.
 * Asume que la entrada es en hora de Lima (UTC-5).
 */
export function localToUTC(fechaLocal: string, horaLocal: string): string | null {
    if (!fechaLocal || !horaLocal) return null;

    const dateParts = fechaLocal.split('-').map(Number);
    const time24h = validateAndFormatTime(horaLocal);
    const [h, m] = time24h.split(':').map(Number);

    if (dateParts.length !== 3) return null;

    // Crear fecha asumiendo UTC y luego ajustar el offset de Lima (UTC-5 -> +5 horas para llegar a UTC)
    const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], h + 5, m, 0, 0));

    return date.toISOString();
}

/**
 * Extrae la hora en formato 24h a partir de un ISO String UTC, ajustado a Lima.
 */
export function UTCToLocal24h(utcTime: string | undefined | null): string {
    if (!utcTime) return '12:00';
    try {
        const date = new Date(utcTime);
        if (isNaN(date.getTime())) return '12:00';

        return new Intl.DateTimeFormat('en-GB', {
            timeZone: PERU_TIMEZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        return '12:00';
    }
}

// Utilidades para el Countdown: Calcula el timestamp UTC real para una fecha y hora de Lima.
export function getEventTimestampUTC(dateStr: string, timeStr: string): number {
    const iso = localToUTC(dateStr, timeStr);
    return iso ? new Date(iso).getTime() : 0;
}

/**
 * Convierte componentes 12h a string 24h (HH:mm).
 */
export function convert12hTo24h(hour: number, minute: number, ampm: 'AM' | 'PM'): string {
    let h = hour;
    if (h === 12) {
        h = (ampm === 'PM') ? 12 : 0;
    } else {
        if (ampm === 'PM') h += 12;
    }
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Convierte string 24h a componentes 12h.
 */
export function convert24hTo12h(time24h: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
    if (!time24h) return { hour: 12, minute: 0, ampm: 'PM' };
    const clean = time24h.replace(/(AM|PM|A\.M\.|P\.M\.)/gi, '').trim();
    const match = clean.match(/(\d{1,2}):(\d{1,2})/);

    if (!match) return { hour: 12, minute: 0, ampm: 'PM' };

    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);

    const ampm = (h >= 12 && h < 24) ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;

    return { hour: hour12, minute: m || 0, ampm };
}

// Retrocompatibilidad
export const formatTimeDisplay = (t: any) => formatTimeForDisplay(t);
export const UTCToLocal = (utc: any) => formatTimeForDisplay(UTCToLocal24h(utc));
