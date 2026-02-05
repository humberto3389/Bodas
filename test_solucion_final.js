// ============================================
// TEST FINAL: Verificar solución del bug
// ============================================

// Función corregida: formatTimeForDisplay
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

console.log("========================================");
console.log("✅ VERIFICACIÓN: BUG SOLUCIONADO");
console.log("========================================\n");

const testCases = [
    { input: "00:00", expected: "12:00 a. m.", desc: "Medianoche" },
    { input: "00:30", expected: "12:30 a. m.", desc: "12:30 AM" },
    { input: "01:00", expected: "1:00 a. m.", desc: "1:00 AM" },
    { input: "11:59", expected: "11:59 a. m.", desc: "11:59 AM" },
    { input: "12:00", expected: "12:00 p. m.", desc: "Mediodía (12:00 PM)" },
    { input: "12:30", expected: "12:30 p. m.", desc: "12:30 PM ← CASO CRÍTICO" },
    { input: "13:00", expected: "1:00 p. m.", desc: "1:00 PM" },
    { input: "15:00", expected: "3:00 p. m.", desc: "3:00 PM" },
    { input: "23:59", expected: "11:59 p. m.", desc: "11:59 PM" },
];

let allPass = true;
testCases.forEach(({ input, expected, desc }) => {
    const result = formatTimeForDisplay(input);
    const pass = result === expected;
    allPass = allPass && pass;
    
    const status = pass ? '✅' : '❌';
    console.log(`${status} ${input} -> "${result}"`);
    if (!pass) {
        console.log(`   Esperado: "${expected}"`);
        console.log(`   ${desc}`);
    }
});

console.log("\n========================================");
if (allPass) {
    console.log("✅ TODOS LOS TESTS PASARON");
    console.log("\nEl bug ha sido SOLUCIONADO:");
    console.log("• Hora 12:30 PM ahora se muestra como '12:30 p. m.'");
    console.log("• Los invitados verán la hora correcta");
    console.log("• Ambos campos (ceremonia y recepción) funcionan bien");
} else {
    console.log("❌ ALGUNOS TESTS FALLARON");
}
console.log("========================================");
