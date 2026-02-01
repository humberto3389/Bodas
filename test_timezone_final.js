
/**
 * TAREA 2: Mock de las funciones implementadas para verificación
 */

function localToUTC(fechaLocal, horaLocal, timezone = 'America/Lima') {
    if (!fechaLocal || !horaLocal) return '';
    const [year, month, day] = fechaLocal.split('-').map(Number);
    const cleanTime = horaLocal.replace(/\s*(AM|PM)\s*/i, '').trim();
    let [hours, minutes] = cleanTime.split(':').map(Number);
    if (/PM/i.test(horaLocal) && hours < 12) hours += 12;
    if (/AM/i.test(horaLocal) && hours === 12) hours = 0;

    const offset = timezone === 'America/Lima' ? 5 : 5;
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours + offset, minutes, 0, 0));
    return utcDate.toISOString();
}

function UTCToLocal(utcTime, timezone = 'America/Lima') {
    if (!utcTime) return '';
    const date = new Date(utcTime);
    // Usamos Intl si está disponible (en Nodejs suele estarlo)
    try {
        return new Intl.DateTimeFormat('es-PE', {
            timeZone: timezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch (e) {
        return "Error Intl";
    }
}

function validateAndFormatTime(timeInput) {
    if (!timeInput) return '';
    let clean = timeInput.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    clean = clean.replace(/\s*(AM|PM)\s*/, '');
    let [hStr, mStr] = clean.split(':');
    let h = parseInt(hStr, 10) || 0;
    let m = parseInt(mStr, 10) || 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    h = Math.max(0, Math.min(23, h));
    m = Math.max(0, Math.min(59, m));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// CASOS DE PRUEBA
console.log("--- TEST: localToUTC ---");
console.log("Andres y Yolanda (12:00 PM):", localToUTC("2026-06-20", "12:00")); // Esperado: ...17:00:00.000Z
console.log("Juan y Melania (3:00 PM):", localToUTC("2026-02-01", "15:00"));   // Esperado: ...20:00:00.000Z
console.log("Medianoche (00:00):", localToUTC("2026-06-20", "00:00"));         // Esperado: ...05:00:00.000Z
console.log("Tarde Noche (20:00):", localToUTC("2026-06-20", "20:00"));        // Esperado: ...01:00:00.000Z (del día siguiente)

console.log("\n--- TEST: UTCToLocal ---");
console.log("UTC 17:00 ->", UTCToLocal("2026-06-20T17:00:00.000Z")); // Esperado: 12:00 p. m.
console.log("UTC 20:00 ->", UTCToLocal("2026-02-01T20:00:00.000Z")); // Esperado: 3:00 p. m.
console.log("UTC 05:00 ->", UTCToLocal("2026-06-20T05:00:00.000Z")); // Esperado: 12:00 a. m.

console.log("\n--- TEST: validateAndFormatTime ---");
console.log("'3:00 PM' ->", validateAndFormatTime("3:00 PM"));
console.log("'12:00' ->", validateAndFormatTime("12:00"));
console.log("'15:00' ->", validateAndFormatTime("15:00"));
console.log("'12:30 AM' ->", validateAndFormatTime("12:30 AM"));
