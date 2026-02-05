// Test explícito de convert12hTo24h

function convert12hTo24h(hour, minute, ampm) {
    let h = hour;
    
    if (h === 12) {
        if (ampm === 'AM') {
            h = 0;
        } else {
            h = 12;
        }
    } else {
        if (ampm === 'PM') {
            h = hour + 12;
        } else {
            h = hour;
        }
    }
    
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

console.log("===========================================");
console.log("TEST: convert12hTo24h - CASO CRÍTICO");
console.log("===========================================\n");

const testCase = convert12hTo24h(12, 30, 'PM');
console.log(`convert12hTo24h(12, 30, 'PM') = "${testCase}"`);

if (testCase === "12:30") {
    console.log("✅ CORRECTO: Retorna '12:30'");
} else {
    console.log(`❌ ERROR: Retorna '${testCase}' en lugar de '12:30'`);
}

console.log("\n=== Todos los casos ===");
const cases = [
    [12, 0, 'AM', '00:00'],
    [12, 30, 'AM', '00:30'],
    [1, 0, 'AM', '01:00'],
    [11, 59, 'AM', '11:59'],
    [12, 0, 'PM', '12:00'],
    [12, 30, 'PM', '12:30'],
    [1, 0, 'PM', '13:00'],
    [3, 0, 'PM', '15:00'],
    [11, 59, 'PM', '23:59'],
];

let allPass = true;
cases.forEach(([h, m, ap, expected]) => {
    const result = convert12hTo24h(h, m, ap);
    const pass = result === expected;
    allPass = allPass && pass;
    console.log(`${pass ? '✅' : '❌'} ${h}:${String(m).padStart(2, '0')} ${ap} = "${result}" (esperado: "${expected}")`);
});

console.log("\n===========================================");
if (allPass) {
    console.log("✅ TODOS LOS TESTS PASARON");
} else {
    console.log("❌ ALGUNOS TESTS FALLARON");
}
console.log("===========================================");
