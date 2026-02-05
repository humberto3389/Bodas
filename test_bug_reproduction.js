// Reproduccción del bug: 15:00 (3 PM) se muestra como 3:00 AM

function validateAndFormatTime(timeInput) {
    if (!timeInput) return '12:00';

    const clean = (timeInput || '').trim().toUpperCase();
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

function convert24hTo12h(time24h) {
    if (!time24h) return { hour: 12, minute: 0, ampm: 'PM' };

    // Primero normalizamos a formato estricto 24h (HH:mm)
    const normalized = validateAndFormatTime(time24h);
    const [hStr, mStr] = normalized.split(':');

    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    const ampm = (h >= 12) ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;

    return { hour: hour12, minute: m, ampm };
}

console.log("=== BUG REPRODUCTION ===\n");

// Caso 1: Valor de DB "15:00"
console.log("Caso 1: El usuario selecciona 3 PM en TimePicker");
console.log("- TimePicker output: 15:00 (después de convert12hTo24h(3, 0, 'PM'))");
console.log("- Se guarda a DB: 15:00");

const dbValue = "15:00";
console.log(`\nCaso 2: Se recarga del DB y se abre TimePicker de nuevo`);
console.log(`- Valor de DB: "${dbValue}"`);

const parsed = convert24hTo12h(dbValue);
console.log(`- convert24hTo12h("${dbValue}") retorna:`, parsed);

console.log(`\n🐛 BUG: Se muestra como ${parsed.hour}:00 ${parsed.ampm} cuando debería ser 3:00 PM`);

// Test adicional
console.log("\n=== ANÁLISIS DETALLADO ===");
console.log(`validateAndFormatTime("15:00") ->`, validateAndFormatTime("15:00"));
const step2 = convert24hTo12h("15:00");
console.log(`convert24hTo12h("15:00") ->`, step2);

console.log("\n=== OTROS CASOS ===");
["00:30", "12:00", "12:30", "13:00", "23:59", "03:00", "15:00"].forEach(time => {
    const result = convert24hTo12h(time);
    console.log(`${time} -> ${result.hour}:${String(result.minute).padStart(2, '0')} ${result.ampm}`);
});
