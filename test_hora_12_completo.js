// Test completo de conversiones de hora 12

// Lógica de validateAndFormatTime
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

// Nueva lógica de convert24hTo12h
function convert24hTo12h(time24h) {
    if (!time24h) return { hour: 12, minute: 0, ampm: 'PM' };

    const normalized = validateAndFormatTime(time24h);
    const [hStr, mStr] = normalized.split(':');

    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    const ampm = (h >= 12 && h <= 23) ? 'PM' : 'AM';
    
    let hour12;
    if (h === 0) {
        hour12 = 12;
    } else if (h <= 11) {
        hour12 = h;
    } else if (h === 12) {
        hour12 = 12;
    } else {
        hour12 = h - 12;
    }

    return { hour: hour12, minute: m, ampm };
}

// Nueva lógica de convert12hTo24h
function convert12hTo24h(hour, minute, ampm) {
    let h = hour;
    
    if (h === 12) {
        h = (ampm === 'AM') ? 0 : 12;
    } else if (ampm === 'PM') {
        h += 12;
    }
    
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Nueva lógica de formatTimeForDisplay
function formatTimeForDisplay(time24h) {
    if (!time24h) return '';
    const clean = validateAndFormatTime(time24h);
    const [h, m] = clean.split(':').map(Number);

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

console.log("========================================");
console.log("     TEST COMPLETO - CONVERSIÓN HORA 12");
console.log("========================================\n");

// Test 1: Usuario selecciona 12:00 PM
console.log("TEST 1: Usuario selecciona 12:00 PM en TimePicker");
const pm12Output = convert12hTo24h(12, 0, 'PM');
console.log(`  convert12hTo24h(12, 0, 'PM') -> "${pm12Output}"`);
console.log(`  Esperado: "12:00" ✓` + (pm12Output === '12:00' ? ' PASS' : ' FAIL'));

const pm12Display = formatTimeForDisplay(pm12Output);
console.log(`  formatTimeForDisplay("${pm12Output}") -> "${pm12Display}"`);
console.log(`  Esperado: "12:00 p. m." ✓` + (pm12Display === '12:00 p. m.' ? ' PASS' : ' FAIL'));

const pm12Reload = convert24hTo12h(pm12Output);
console.log(`  convert24hTo12h("${pm12Output}") -> ${JSON.stringify(pm12Reload)}`);
console.log(`  Esperado: {hour:12, minute:0, ampm:'PM'} ✓` + (pm12Reload.hour === 12 && pm12Reload.ampm === 'PM' ? ' PASS' : ' FAIL'));

// Test 2: Usuario selecciona 12:00 AM
console.log("\nTEST 2: Usuario selecciona 12:00 AM en TimePicker");
const am12Output = convert12hTo24h(12, 0, 'AM');
console.log(`  convert12hTo24h(12, 0, 'AM') -> "${am12Output}"`);
console.log(`  Esperado: "00:00" ✓` + (am12Output === '00:00' ? ' PASS' : ' FAIL'));

const am12Display = formatTimeForDisplay(am12Output);
console.log(`  formatTimeForDisplay("${am12Output}") -> "${am12Display}"`);
console.log(`  Esperado: "12:00 a. m." ✓` + (am12Display === '12:00 a. m.' ? ' PASS' : ' FAIL'));

const am12Reload = convert24hTo12h(am12Output);
console.log(`  convert24hTo12h("${am12Output}") -> ${JSON.stringify(am12Reload)}`);
console.log(`  Esperado: {hour:12, minute:0, ampm:'AM'} ✓` + (am12Reload.hour === 12 && am12Reload.ampm === 'AM' ? ' PASS' : ' FAIL'));

// Test 3: Valor de BD "15:00" (ejemplo del usuario)
console.log("\nTEST 3: Cargar valor de BD 15:00 (3 PM)");
const db15 = convert24hTo12h("15:00");
console.log(`  convert24hTo12h("15:00") -> ${JSON.stringify(db15)}`);
console.log(`  Esperado: {hour:3, minute:0, ampm:'PM'} ✓` + (db15.hour === 3 && db15.ampm === 'PM' ? ' PASS' : ' FAIL'));

const display15 = formatTimeForDisplay("15:00");
console.log(`  formatTimeForDisplay("15:00") -> "${display15}"`);
console.log(`  Esperado: "3:00 p. m." ✓` + (display15 === '3:00 p. m.' ? ' PASS' : ' FAIL'));

// Test 4: Todos los casos especiales
console.log("\nTEST 4: Casos especiales (24h -> 12h)");
const testCases = [
    ["00:00", 12, 0, "AM"],
    ["00:30", 12, 30, "AM"],
    ["01:00", 1, 0, "AM"],
    ["11:59", 11, 59, "AM"],
    ["12:00", 12, 0, "PM"],
    ["12:30", 12, 30, "PM"],
    ["13:00", 1, 0, "PM"],
    ["23:59", 11, 59, "PM"],
];

let allPass = true;
testCases.forEach(([input24h, expHour, expMin, expAmpm]) => {
    const result = convert24hTo12h(input24h);
    const pass = result.hour === expHour && result.minute === expMin && result.ampm === expAmpm;
    allPass = allPass && pass;
    console.log(`  ${input24h} -> ${result.hour}:${String(result.minute).padStart(2, '0')} ${result.ampm} ${pass ? '✓' : '✗ FAIL'}`);
});

console.log("\n" + (allPass ? "✅ TODOS LOS TESTS PASARON" : "❌ ALGUNOS TESTS FALLARON"));
console.log("========================================");
