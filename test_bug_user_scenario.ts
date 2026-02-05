// Test específico para el bug reportado por el usuario
// "cuando pongo la hora 12 siempre se pone am, en los dos tanto en ceremnia y recepcion"

import {
    validateAndFormatTime,
    convert12hTo24h,
    convert24hTo12h,
    formatTimeForDisplay
} from './src/lib/timezone-utils';

console.log("================================================");
console.log("TEST: Bug Reportado - Hora 12 siempre es AM");
console.log("================================================\n");

// Simulación exacta del flujo del usuario

// ESCENARIO 1: Usuario abre el panel, los horarios están vacíos
console.log("ESCENARIO 1: Panel abierto, horarios inicialmente vacíos");
const emptyValue = "";
const initialState = convert24hTo12h(emptyValue);
console.log(`  convert24hTo12h("") -> ${JSON.stringify(initialState)}`);
console.log(`  ✓ Debería mostrar 12:00 PM por defecto`);
console.log(`  ${initialState.hour}:${String(initialState.minute).padStart(2, '0')} ${initialState.ampm}\n`);

// ESCENARIO 2: Usuario selecciona hora 12 (en la ceremonia)
console.log("ESCENARIO 2: Usuario selecciona 12:00 PM en Hora de Ceremonia");
const ceremonyUserSelection = convert12hTo24h(12, 0, 'PM');
console.log(`  Usuario selecciona: 12:00 PM`);
console.log(`  convert12hTo24h(12, 0, 'PM') -> "${ceremonyUserSelection}"`);
console.log(`  Se guarda en editForm.weddingTime: "${ceremonyUserSelection}"`);

// ESCENARIO 3: Usuario guarda (click GUARDAR CAMBIOS)
console.log(`\nESCENARIO 3: Usuario hace click en "GUARDAR CAMBIOS"`);
const ceremonyToDb = validateAndFormatTime(ceremonyUserSelection);
console.log(`  validateAndFormatTime("${ceremonyUserSelection}") -> "${ceremonyToDb}"`);
console.log(`  Se guarda en BD: "wedding_time": "${ceremonyToDb}"`);

// ESCENARIO 4: Página se recarga (F5) y se carga desde BD
console.log(`\nESCENARIO 4: Página se recarga y se carga desde BD`);
const ceremonyFromDb = "12:00"; // Viene de la BD
console.log(`  Carga de BD: wedding_time = "${ceremonyFromDb}"`);
console.log(`  Se asigna a editForm.weddingTime: "${ceremonyFromDb}"`);
console.log(`  TimePicker recibe value="${ceremonyFromDb}"`);

const ceremonyReloaded = convert24hTo12h(ceremonyFromDb);
console.log(`  convert24hTo12h("${ceremonyFromDb}") -> ${JSON.stringify(ceremonyReloaded)}`);
console.log(`  Se debe mostrar: 12:00 PM ← AQUÍ ESTABA EL BUG`);
console.log(`  Mostrando: ${ceremonyReloaded.hour}:${String(ceremonyReloaded.minute).padStart(2, '0')} ${ceremonyReloaded.ampm}`);

const ceremonyDisplay = formatTimeForDisplay(ceremonyFromDb);
console.log(`  Display: "${ceremonyDisplay}"`);

const ceremonyBug = ceremonyReloaded.ampm === 'AM' && ceremonyReloaded.hour === 12;
console.log(`  ${ceremonyBug ? '✗ BUG DETECTADO' : '✓ CORRECTO'}\n`);

// ESCENARIO 5: Repetimos para la recepción
console.log("ESCENARIO 5: Usuario selecciona 12:30 PM en Hora de Recepción");
const receptionUserSelection = convert12hTo24h(12, 30, 'PM');
console.log(`  Usuario selecciona: 12:30 PM`);
console.log(`  convert12hTo24h(12, 30, 'PM') -> "${receptionUserSelection}"`);
console.log(`  Se guarda en editForm.receptionTime: "${receptionUserSelection}"`);

console.log(`\nSe guarda en BD: "reception_time": "${validateAndFormatTime(receptionUserSelection)}"`);

const receptionFromDb = "12:30";
const receptionReloaded = convert24hTo12h(receptionFromDb);
console.log(`\nEn la recarga:`);
console.log(`  convert24hTo12h("${receptionFromDb}") -> ${JSON.stringify(receptionReloaded)}`);
console.log(`  Mostrando: ${receptionReloaded.hour}:${String(receptionReloaded.minute).padStart(2, '0')} ${receptionReloaded.ampm}`);

const receptionDisplay = formatTimeForDisplay(receptionFromDb);
console.log(`  Display: "${receptionDisplay}"`);

const receptionBug = receptionReloaded.ampm === 'AM' && receptionReloaded.hour === 12;
console.log(`  ${receptionBug ? '✗ BUG DETECTADO' : '✓ CORRECTO'}\n`);

// CONCLUSIÓN
console.log("================================================");
if (!ceremonyBug && !receptionBug) {
    console.log("✅ BUG SOLUCIONADO");
    console.log("Hora 12 PM ahora se mantiene correctamente como PM");
    console.log("en ambos selectores (ceremonia y recepción)");
} else {
    console.log("❌ BUG AÚNEXISTE");
    console.log("Hora 12 sigue siendo interpretada como AM");
}
console.log("================================================");
