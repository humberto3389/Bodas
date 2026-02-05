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

export function localToUTC(fechaLocal: string, horaLocal: string): string {
    const parts = parseCivilDate(fechaLocal);
    if (!parts || !horaLocal) return '';

    const [year, month, day] = parts;
    const clean24h = validateAndFormatTime(horaLocal);
    const [hours, minutes] = clean24h.split(':').map(Number);

    // Lima es UTC-5. Para obtener UTC sumamos 5 horas.
    const offset = 5;
    const date = new Date(Date.UTC(year, month - 1, day, hours + offset, minutes, 0, 0));

    return date.toISOString();
}

export function UTCToLocal(utcTime: string | Date | undefined | null): string {
    if (!utcTime) return '';
    try {
        const date = typeof utcTime === 'string'
            ? (utcTime.includes('T') ? new Date(utcTime) : new Date(utcTime.replace(' ', 'T') + (utcTime.includes('+') || utcTime.includes('Z') ? '' : 'Z')))
            : utcTime;

        if (isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat('es-PE', {
            timeZone: PERU_TIMEZONE,
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        }).format(date).toLowerCase().replace(/\s([ap])\.?\s?m\.?$/i, ' $1. m.');
    } catch (e) {
        return '';
    }
}

export function UTCToLocal24h(utcTime: string | Date | undefined | null): string {
    if (!utcTime) return '12:00';
    try {
        const date = typeof utcTime === 'string'
            ? (utcTime.includes('T') ? new Date(utcTime) : new Date(utcTime.replace(' ', 'T') + (utcTime.includes('+') || utcTime.includes('Z') ? '' : 'Z')))
            : utcTime;

        if (isNaN(date.getTime())) return '12:00';

        return new Intl.DateTimeFormat('en-GB', {
            timeZone: PERU_TIMEZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        console.error('Error in UTCToLocal24h:', e);
        return '12:00';
    }
}

/**
 * CORRECIÓN CRÍTICA - CONVERSIÓN 12h ↔ 24h
 * BUG ORIGINAL: "12:30 PM" se convertía a "00:30" (ERROR)
 * SOLUCIÓN: "12:30 PM" = "12:30" (mediodía), "12:30 AM" = "00:30" (medianoche)
 */
export function validateAndFormatTime(timeInput: string): string {
    if (!timeInput || timeInput.trim() === '') {
        console.warn('⚠️ validateAndFormatTime: Input vacío, retorna 12:00');
        return '12:00';
    }

    const originalInput = timeInput;
    const clean = timeInput.trim().toUpperCase();

    console.log('🔧 DEBUG validateAndFormatTime - Inicio:', {
        original: originalInput,
        clean: clean,
        length: clean.length
    });

    // ==================== DETECCIÓN ROBUSTA DE AM/PM ====================
    // Considerar múltiples formatos: "PM", "P.M.", "P. M.", "PM.", etc.
    const pmRegex = /P\.?\.?\s*M\.?/;
    const amRegex = /A\.?\.?\s*M\.?/;

    const hasPM = pmRegex.test(clean);
    const hasAM = amRegex.test(clean);

    console.log('🔧 DEBUG - Detección AM/PM:', {
        hasPM,
        hasAM,
        stringContainsPM: clean.includes('PM'),
        stringContainsAM: clean.includes('AM')
    });

    // ==================== EXTRAER HORA Y MINUTO ====================
    // Buscar patrón "HH:MM" o "H:MM"
    const timeMatch = clean.match(/(\d{1,2}):(\d{1,2})/);

    if (!timeMatch) {
        console.error('❌ validateAndFormatTime: Formato inválido, no encuentra HH:MM');
        return '12:00';
    }

    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    console.log('🔧 DEBUG - Extraído del texto:', {
        hourOriginal: hour,
        minuteOriginal: minute,
        match: timeMatch[0]
    });

    // ==================== CONVERSIÓN CORRECTA (FIX CRÍTICO) ====================
    let conversionType = '24h (sin cambios)';

    if (hasPM) {
        // CASO PM (TARDE):
        if (hour === 12) {
            // 12:XX PM = 12:XX (MEDIODÍA) - ¡NO CAMBIAR!
            conversionType = '12 PM → 12 (mediodía)';
        } else if (hour < 12) {
            // 1:XX PM a 11:XX PM = sumar 12
            hour += 12;
            conversionType = `${timeMatch[1]} PM → ${hour} (suma 12)`;
        } else {
            // Hora > 12 en formato PM es error, pero manejamos
            conversionType = `${hour} PM (ya es 24h?)`;
        }
    } else if (hasAM) {
        // CASO AM (MAÑANA):
        if (hour === 12) {
            // 12:XX AM = 00:XX (MEDIANOCHE)
            hour = 0;
            conversionType = '12 AM → 0 (medianoche)';
        } else {
            // 1:XX AM a 11:XX AM = igual
            conversionType = `${hour} AM (igual)`;
        }
    } else {
        // SIN AM/PM: Asumir formato 24h
        // 12:30 = mediodía, 00:30 = medianoche
        conversionType = '24h directo';
    }

    // ==================== VALIDAR RANGOS ====================
    const finalHour = Math.max(0, Math.min(23, hour));
    const finalMinute = Math.max(0, Math.min(59, minute));

    const result = `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;

    // ==================== LOG COMPLETO ====================
    console.log('✅ DEBUG validateAndFormatTime - Resultado:', {
        input: originalInput,
        limpiado: clean,
        tieneAM: hasAM,
        tienePM: hasPM,
        horaOriginal: timeMatch[1],
        minutoOriginal: minute,
        tipoConversion: conversionType,
        horaFinal: finalHour,
        minutoFinal: finalMinute,
        resultado24h: result,
        interpretacion: finalHour === 12 ? 'MEDIODÍA' :
            finalHour === 0 ? 'MEDIANOCHE' :
                finalHour > 12 ? `TARDE (${finalHour - 12} PM)` : `MAÑANA (${finalHour} AM)`
    });

    return result;
}

export function formatTimeDisplay(timeStr: string | undefined | null, use12Hour: boolean = true): string {
    if (!timeStr) return '';
    const clean24h = validateAndFormatTime(timeStr);
    if (!use12Hour) return clean24h;
    return formatTimeForDisplay(clean24h);
}

export function getEventTimestampUTC(dateStr: string, timeStr: string, timezone: string = DEFAULT_TIMEZONE): number {
    console.group('⏰ DEBUG getEventTimestampUTC');
    console.log('📥 Entrada:', { dateStr, timeStr, timezone });

    // Validar entradas
    if (!dateStr || !timeStr) {
        console.error('❌ Fecha o hora vacía');
        console.groupEnd();
        return 0;
    }

    // 1. Convertir hora a 24h (USA LA FUNCIÓN CORREGIDA)
    const time24h = validateAndFormatTime(timeStr);
    console.log('🔄 Hora convertida:', { original: timeStr, formato24h: time24h });

    // 2. Parsear fecha
    const parts = parseCivilDate(dateStr);
    if (!parts) {
        console.error('❌ Fecha inválida:', dateStr);
        console.groupEnd();
        return 0;
    }

    const [year, month, day] = parts;
    const [hours, minutes] = time24h.split(':').map(Number);

    console.log('📅 Componentes:', { year, month: month - 1, day, hours, minutes });

    // 3. Crear fecha en LIMA (UTC-5) y convertir a UTC
    // IMPORTANTE: new Date con UTC crea en UTC, pero queremos Lima primero
    const limaDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

    // 4. SUMAR 5 horas (Lima UTC-5) para obtener UTC real
    const limaOffset = 5 * 60 * 60 * 1000; // 5 horas en milisegundos
    const utcTimestamp = limaDate.getTime() + limaOffset;

    const fechaUTC = new Date(utcTimestamp);
    const fechaLima = new Date(utcTimestamp + limaOffset);

    console.log('📊 Resultados:', {
        fechaLimaISO: limaDate.toISOString(),
        fechaLimaLocal: fechaLima.toLocaleString('es-PE'),
        utcTimestamp,
        utcISO: fechaUTC.toISOString(),
        utcLocal: fechaUTC.toLocaleString('es-PE'),
        diferenciaHorasBD: (utcTimestamp - Date.now()) / (1000 * 60 * 60)
    });

    console.groupEnd();
    return utcTimestamp;
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

    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);

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
