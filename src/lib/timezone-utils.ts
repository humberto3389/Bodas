// Utilidades para manejo de zona horaria (Default: America/Lima, UTC-5)
// El sistema garantiza que Hora mostrada en web = Hora configurada en panel admin

export const DEFAULT_TIMEZONE = 'America/Lima';
export const PERU_TIMEZONE = 'America/Lima';

/**
 * Parsea un string YYYY-MM-DD y devuelve [year, month, day] como números.
 * Esto evita el uso de new Date("YYYY-MM-DD") que asume UTC y puede restar un día.
 */
function parseCivilDate(dateStr: string): [number, number, number] | null {
    if (!dateStr) return null;
    // Soporta YYYY-MM-DDT... o solo YYYY-MM-DD
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanDate.split('-').map(Number);
    if (parts.length !== 3) return null;
    return [parts[0], parts[1], parts[2]]; // [Year, Month (1-12), Day]
}

/**
 * TAREA 2: Backend - Al guardar desde panel admin
 * Convierte fecha y hora local a un string ISO en UTC.
 * Input: fecha: "2026-06-20", hora: "15:00", timezone: "America/Lima"
 * Output: "2026-06-20T20:00:00.000Z" (Suponiendo UTC-5)
 */
export function localToUTC(fechaLocal: string, horaLocal: string, _timezone: string = DEFAULT_TIMEZONE): string {
    const parts = parseCivilDate(fechaLocal);
    if (!parts || !horaLocal) return '';

    const [year, month, day] = parts;

    // Usar nuestra función robusta de validación para asegurar formato HH:mm
    const clean24h = validateAndFormatTime(horaLocal);
    let [hours, minutes] = clean24h.split(':').map(Number);

    // Para Perú (UTC-5), el desfase es constante (+5 horas para llegar a UTC)
    // Date.UTC(year, monthIndex, day, hours, minutes) crea un timestamp UTC puro.
    // Nosotros queremos decir: "En Perú son las 15:00", así que en UTC son las 20:00.
    const offset = 5;
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours + offset, minutes, 0, 0));

    return utcDate.toISOString();
}

/**
 * TAREA 2: Frontend - Al mostrar en web de invitados
 * Convierte wedding_datetime_utc a hora local formateada.
 */
export function UTCToLocal(utcTime: string | Date, _timezone: string = DEFAULT_TIMEZONE): string {
    if (!utcTime) return '';
    const date = typeof utcTime === 'string' ? new Date(utcTime) : utcTime;

    // Cálculo manual robusto del offset para evitar inconsistencias de Intl con las 12 PM
    // Para Perú es UTC-5. 
    const limaDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    const h = limaDate.getUTCHours();
    const m = limaDate.getUTCMinutes();

    const ampm = h >= 12 ? 'p. m.' : 'a. m.';
    let displayH = h % 12;
    if (displayH === 0) displayH = 12;

    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * TAREA 2: Validación en panel admin
 * Asegura que el input de hora sea HH:mm (24h) y maneja correcciones básicas.
 */
export function validateAndFormatTime(timeInput: string): string {
    if (!timeInput) return '12:00';

    let clean = timeInput.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');

    // Extraer solo números para evitar fallos con strings sucios
    const timeMatch = clean.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return '12:00';

    let h = parseInt(timeMatch[1], 10);
    let m = parseInt(timeMatch[2], 10);

    // Lógica EXPLÍCITA para 12-hour clock
    if (isPM) {
        if (h < 12) h += 12; // 1 PM -> 13
        // 12 PM stays 12 (Noon)
    } else if (isAM) {
        if (h === 12) h = 0; // 12 AM -> 0 (Midnight)
    } else {
        // Si no tiene AM/PM, asumimos que ya viene en 24h
        // Pero si alguien escribe "12:30", por defecto es Noon (12:30)
    }

    // Normalizar a rangos válidos
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

/**
 * Construye un timestamp UTC para un evento en Perú, ignorando la zona horaria del navegador.
 * Input: dateStr="2026-06-21", timeStr="12:30"
 * Output: timestamp numérico que representa ese momento exacto en el tiempo universal.
 */
export function getEventTimestampUTC(dateStr: string, timeStr: string, timezone: string = DEFAULT_TIMEZONE): number {
    // Reutilizar localToUTC para consistencia
    const iso = localToUTC(dateStr, timeStr, timezone);
    return iso ? new Date(iso).getTime() : 0;
}

export function convert12hTo24h(hour: number, minute: number, ampm: 'AM' | 'PM'): string {
    let h = hour;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function convert24hTo12h(time24h: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
    if (!time24h) return { hour: 12, minute: 0, ampm: 'PM' };

    // Limpieza robusta: detectar AM/PM si vienen en el string (datos sucios de antes)
    const isActuallyPM = /PM/i.test(time24h);
    const isActuallyAM = /AM/i.test(time24h);

    // Extraer números
    const match = time24h.match(/(\d{1,2}):(\d{1,2})/);
    if (!match) return { hour: 12, minute: 0, ampm: 'PM' };

    let h = parseInt(match[1], 10);
    let m = parseInt(match[2], 10);

    // Si detectamos que era un formato 12h guardado como string, lo normalizamos a 24h interno primero
    if (isActuallyPM && h < 12) h += 12;
    if (isActuallyAM && h === 12) h = 0;

    // Ahora h es 0-23. Decidimos AM/PM de forma ABSOLUTA
    // 12:00 a 23:59 -> PM
    // 00:00 a 11:59 -> AM
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
