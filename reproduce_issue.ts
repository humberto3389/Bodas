
import {
    validateAndFormatTime,
    localToUTC,
    UTCToLocal24h,
    convert12hTo24h,
    convert24hTo12h
} from './src/lib/timezone-utils';

function test() {
    console.log("=== Testing Timezone Logic ===");

    // Scenario: User selects 12:30 PM in TimePicker
    // TimePicker state: hour=12, minute=30, ampm='PM'
    const timePickerOutput = convert12hTo24h(12, 30, 'PM');
    console.log(`1. TimePicker Output (12:30 PM): '${timePickerOutput}' (Expected '12:30')`);

    // Scenario: useClientAdmin saves this time
    // editForm.weddingTime = timePickerOutput
    const validatedTime = validateAndFormatTime(timePickerOutput);
    console.log(`2. validateAndFormatTime('${timePickerOutput}'): '${validatedTime}' (Expected '12:30')`);

    // Scenario: localToUTC
    // Date: 2026-02-21
    const dateStr = "2026-02-21";
    const utcISO = localToUTC(dateStr, validatedTime);
    console.log(`3. localToUTC('${dateStr}', '${validatedTime}'): '${utcISO}'`);
    // Local: 12:30 PM. UTC should be 17:30.
    // Check if it contains T17:30
    const expectedUTCFragment = "T17:30";
    if (utcISO.includes(expectedUTCFragment)) {
        console.log("   [PASS] UTC Time is correct (17:30)");
    } else {
        console.error("   [FAIL] UTC Time is WRONG. Expected 17:30.");
    }

    // Scenario: Loading back from DB
    // Input: The UTC ISO string we just generated
    const local24h = UTCToLocal24h(utcISO);
    console.log(`4. UTCToLocal24h('${utcISO}'): '${local24h}' (Expected '12:30')`);

    // Scenario: TimePicker displaying it
    const pickerState = convert24hTo12h(local24h);
    console.log(`5. convert24hTo12h('${local24h}'):`, pickerState);
    if (pickerState.hour === 12 && pickerState.ampm === 'PM') {
        console.log("   [PASS] Display is 12:30 PM");
    } else {
        console.error("   [FAIL] Display is WRONG. Expected 12:30 PM.");
    }

    console.log("\n=== Testing Edge Case: 12:30 AM ===");
    const amOutput = convert12hTo24h(12, 30, 'AM');
    console.log(`AM 1. Output: '${amOutput}' (Expected '00:30')`);

    const amUtc = localToUTC(dateStr, amOutput);
    console.log(`AM 2. UTC: '${amUtc}' (Expected T05:30)`);

    const amLocal = UTCToLocal24h(amUtc);
    console.log(`AM 3. Local: '${amLocal}' (Expected '00:30')`);

    const amPicker = convert24hTo12h(amLocal);
    console.log(`AM 4. Picker:`, amPicker); // Expected 12:30 AM

}

test();
