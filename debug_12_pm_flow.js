// Test exacto del flujo para hora 12:30 PM

console.log("==========================================");
console.log("FLUJO COMPLETO: Usuario selecciona 12:30 PM");
console.log("==========================================\n");

// Función: convert12hTo24h (TimePicker -> convertir a 24h)
function convert12hTo24h(hour, minute, ampm) {
    let h = hour;
    if (h === 12) {
        h = (ampm === 'AM') ? 0 : 12;
    } else if (ampm === 'PM') {
        h += 12;
    }
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Función: validateAndFormatTime (guardar a BD)
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

// Función: formatTimeForDisplay (mostrar a invitados)
function formatTimeForDisplay(time24h) {
    if (!time24h) return '';
    let timeStr = (time24h || '').trim();
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return '';
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) return '';
    const ampm = (h >= 12 && h <= 23) ? 'p. m.' : 'a. m.';
    let h12;
    if (h === 0) {
        h12 = 12;
    } else if (h <= 11) {
        h12 = h;
    } else if (h === 12) {
        h12 = 12;
    } else {
        h12 = h - 12;
    }
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// PASO 1: Usuario selecciona 12:30 PM en TimePicker
console.log("PASO 1: Usuario selecciona 12:30 PM");
const step1 = convert12hTo24h(12, 30, 'PM');
console.log(`  convert12hTo24h(12, 30, 'PM') = "${step1}"`);
console.log(`  editForm.weddingTime = "${step1}"`);

// PASO 2: Admin hace click "GUARDAR CAMBIOS"
console.log("\nPASO 2: Admin guarda cambios");
const step2 = validateAndFormatTime(step1);
console.log(`  validateAndFormatTime("${step1}") = "${step2}"`);
console.log(`  Se guarda en BD: wedding_time = "${step2}"`);

// PASO 3: Invitado visita la invitación (carga desde BD)
console.log("\nPASO 3: Invitado abre la invitación");
const fromDB = step2; // "12:30"
console.log(`  Cargando desde BD: wedding_time = "${fromDB}"`);

// PASO 4: Se muestra la hora en LocationSection
console.log("\nPASO 4: Se muestra la hora");
const step4 = formatTimeForDisplay(fromDB);
console.log(`  formatTimeForDisplay("${fromDB}") = "${step4}"`);
console.log(`  Se muestra al invitado: "${step4}"`);

// VALIDACIÓN
console.log("\n==========================================");
if (step4 === "12:30 p. m.") {
    console.log("✅ CORRECTO: Se muestra como 12:30 p. m.");
} else if (step4 === "12:30 a. m.") {
    console.log("❌ BUG: Se muestra como 12:30 a. m. (debería ser p. m.)");
} else {
    console.log(`❌ ERROR: Se muestra como "${step4}"`);
}
console.log("==========================================");

// Test adicional: Revisar qué pasa con 3:00 PM (para comparar)
console.log("\n\nCOMPARACIÓN: Usuario selecciona 3:00 PM");
const test3pm = convert12hTo24h(3, 0, 'PM');
console.log(`  convert12hTo24h(3, 0, 'PM') = "${test3pm}"`);
const saved3pm = validateAndFormatTime(test3pm);
console.log(`  Guardado en BD = "${saved3pm}"`);
const display3pm = formatTimeForDisplay(saved3pm);
console.log(`  Mostrado = "${display3pm}"`);
console.log(`  ${display3pm === "3:00 p. m." ? '✅ CORRECTO' : '❌ ERROR'}`);
