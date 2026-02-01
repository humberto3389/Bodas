
function convert24hTo12h(time24h) {
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

function formatTimeForDisplay(time24h) {
    if (!time24h) return '';
    const { hour, minute, ampm } = convert24hTo12h(time24h);
    const period = ampm === 'PM' ? 'p. m.' : 'a. m.';
    return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

function validateAndFormatTime(timeInput) {
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
        // No hay ambigüedad aquí en formato 24h.
    }

    // Normalizar a rangos válidos
    h = Math.max(0, Math.min(23, h));
    m = Math.max(0, Math.min(59, m));

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function convert12hTo24h(hour, minute, ampm) {
    let h = hour;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// TEST CASES
console.log("--- TEST SUITE ---");

// 1. TimePicker Selection: 12:50 PM
console.log("User selects 12:50 PM in TimePicker:");
const pickerOutput = convert12hTo24h(12, 50, 'PM');
console.log(`Picker output (24h): '${pickerOutput}'`); // Expected: '12:50'

// 2. Save to DB
console.log("Saving to DB:");
const dbSave = validateAndFormatTime(pickerOutput);
console.log(`Saved to DB: '${dbSave}'`); // Expected: '12:50'

// 3. Display in Frontend
console.log("Displaying in Frontend:");
const display = formatTimeForDisplay(dbSave);
console.log(`Displayed: '${display}'`); // Expected: '12:50 p. m.'

// 4. Edge Case: 12:50 AM
console.log("\nUser selects 12:50 AM in TimePicker:");
const pickerOutputAM = convert12hTo24h(12, 50, 'AM');
console.log(`Picker output (24h): '${pickerOutputAM}'`); // Expected: '00:50'
const displayAM = formatTimeForDisplay(pickerOutputAM);
console.log(`Displayed: '${displayAM}'`); // Expected: '12:50 a. m.'

// 5. Dirty Data check
console.log("\nDirty Data '12:50 PM':");
const dirtyDisplay = formatTimeForDisplay("12:50 PM");
console.log(`Displayed: '${dirtyDisplay}'`); // Expected: '12:50 p. m.'

console.log("\nDirty Data '12:50 AM':");
const dirtyDisplayAM = formatTimeForDisplay("12:50 AM");
console.log(`Displayed: '${dirtyDisplayAM}'`); // Expected: '12:50 a. m.'
