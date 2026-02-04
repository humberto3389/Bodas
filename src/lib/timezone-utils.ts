// Utilidades para manejo de zona horaria (Default: America/Lima, UTC-5)
// El sistema garantiza que Hora mostrada en web = Hora configurada en panel admin

export const DEFAULT_TIMEZONE = 'America/Lima';
export const PERU_TIMEZONE = 'America/Lima';

function parseCivilDate(dateStr: string): [number, number, number] | null {
    if (!dateStr) return null;
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanDate.split('-').map(Number);
    if (parts.length !== 3) return null;
    return [parts[0], parts[1], parts[2]];
}

export function localToUTC(fechaLocal: string, horaLocal: string, _timezone: string = DEFAULT_TIMEZONE): string {
    const parts = parseCivilDate(fechaLocal);
    if (!parts || !horaLocal) return '';

    const [year, month, day] = parts;
    const clean24h = validateAndFormatTime(horaLocal);
    let [hours, minutes] = clean24h.split(':').map(Number);

    const offset = 5;
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours + offset, minutes, 0, 0));

    return utcDate.toISOString();
}

export function UTCToLocal(utcTime: string | Date, _timezone: string = DEFAULT_TIMEZONE): string {
    if (!utcTime) return '';
    const date = typeof utcTime === 'string' ? new Date(utcTime) : utcTime;
    const limaDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    const h = limaDate.getUTCHours();
    const m = limaDate.getUTCMinutes();

    const ampm = h >= 12 ? 'p. m.' : 'a. m.';
    let displayH = h % 12;
    if (displayH === 0) displayH = 12;

    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function validateAndFormatTime(timeInput: string): string {
    if (!timeInput) return '12:00';

    let clean = timeInput.trim().toUpperCase();

    // FIX CRÍTICO: Si ya viene en formato 24h limpio "12:30", devolvemos directo
    // para evitar que lógica AM/PM lo rompa por falsos positivos.
    if (/^12:\d{2}$/.test(clean)) return clean;

    const isPM = clean.includes('PM') || clean.includes('P.M.') || clean.includes('P. M.');
    const isAM = clean.includes('AM') || clean.includes('A.M.') || clean.includes('A. M.');

    const timeMatch = clean.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return '12:00';

    let h = parseInt(timeMatch[1], 10);
    let m = parseInt(timeMatch[2], 10);

    if (isPM) {
        // 12 PM es 12:00. 1 PM es 13:00.
        if (h < 12) h += 12;
    } else if (isAM) {
        // 12 AM es 00:00.
        if (h === 12) h = 0;
    }
    // Si NO tiene AM/PM, asumimos 24h.
    // 12:xx sigue siendo 12:xx (Mediodía). 00:xx es Medianoche.

    h = Math.max(0, Math.min(23, h));
    m = Math.max(0, Math.min(59, m));

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTimeDisplay(timeStr: string | undefined | null, use12Hour: boolean = true): string {
    if (!timeStr) return '';
    const clean24h = validateAndFormatTime(timeStr);
    if (!use12Hour) return clean24h;
    return formatTimeForDisplay(clean24h);
}

export function getEventTimestampUTC(dateStr: string, timeStr: string, timezone: string = DEFAULT_TIMEZONE): number {
    const iso = localToUTC(dateStr, timeStr, timezone);
    return iso ? new Date(iso).getTime() : 0;
}

export function convert12hTo24h(hour: number, minute: number, ampm: 'AM' | 'PM'): string {
    let h = hour;

    // FIX CRÍTICO 12 PM:
    // Si es 12 y PM -> 12.
    // Si es 12 y AM -> 0.
    if (h === 12) {
        h = (ampm === 'PM') ? 12 : 0;
    } else {
        if (ampm === 'PM') h += 12;
    }

    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function convert24hTo12h(time24h: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
    if (!time24h) return { hour: 12, minute: 0, ampm: 'PM' };
    const clean = time24h.replace(/(AM|PM|A\.M\.|P\.M\.)/gi, '').trim();
    const match = clean.match(/(\d{1,2}):(\d{1,2})/);

    if (!match) return { hour: 12, minute: 0, ampm: 'PM' };

    let h = parseInt(match[1], 10);
    let m = parseInt(match[2], 10);

    const ampm = (h >= 12 && h < 24) ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;

    return { hour: hour12, minute: m || 0, ampm };
}

export function formatTimeForDisplay(time24h: string): string {
    if (!time24h) return '';
    const { hour, minute, ampm } = convert24hTo12h(time24h);
    const period = ampm === 'PM' ? 'p. m.' : 'a. m.';
    return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}
