
import { validateAndFormatTime, formatTimeForDisplay, convert24hTo12h, convert12hTo24h } from './src/lib/timezone-utils';

console.log("--- TEST: 12:50 PM ---");

// 1. Simulate TimePicker output
// 12, 50, PM
const timePickerOutput = convert12hTo24h(12, 50, 'PM');
console.log(`TimePicker (12, 50, PM) -> ${timePickerOutput}`);

// 2. Simulate Saving to DB (validateAndFormatTime)
const dbValue = validateAndFormatTime(timePickerOutput);
console.log(`DB Value (validated) -> ${dbValue}`);

// 3. Simulate Reading from DB and Displaying
const displayValue = formatTimeForDisplay(dbValue);
console.log(`Display Value -> ${displayValue}`);

console.log("\n--- TEST: 12:50 AM ---");
const timePickerOutputAM = convert12hTo24h(12, 50, 'AM');
console.log(`TimePicker (12, 50, AM) -> ${timePickerOutputAM}`);
const dbValueAM = validateAndFormatTime(timePickerOutputAM);
console.log(`DB Value (validated) -> ${dbValueAM}`);
const displayValueAM = formatTimeForDisplay(dbValueAM);
console.log(`Display Value -> ${displayValueAM}`);

console.log("\n--- TEST: 12:50 Input String (Legacy?) ---");
const legacyInput = "12:50 PM";
const dbValueLegacy = validateAndFormatTime(legacyInput);
console.log(`DB Value (from "${legacyInput}") -> ${dbValueLegacy}`);
const displayValueLegacy = formatTimeForDisplay(dbValueLegacy);
console.log(`Display Value -> ${displayValueLegacy}`);

