
// Import function logic directly to test
function validateAndFormatTime(timeInput) {
    if (!timeInput) return '12:00';
    const clean = timeInput.trim().toUpperCase();
    const pmRegex = /P\.?\.?\s*M\.?/;
    const amRegex = /A\.?\.?\s*M\.?/;
    const hasPM = pmRegex.test(clean);
    const hasAM = amRegex.test(clean);
    const cleanRaw = clean.replace(/(AM|PM|P\.M\.|A\.M\.)/gi, '').trim();
    const timeMatch = cleanRaw.match(/(\d{1,2}):(\d{1,2})/);

    if (!timeMatch) return '12:00';

    let hour = parseInt(timeMatch[1], 10);
    let minute = parseInt(timeMatch[2], 10);

    if (hasPM) {
        if (hour === 12) {
            // 12 PM = 12
        } else if (hour < 12) {
            hour += 12;
        }
    } else if (hasAM) {
        if (hour === 12) {
            hour = 0;
        }
    }
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const tests = [
    "12:30 PM",
    "12:30PM",
    "12:30 p. m.",
    "12:30 P.M.",
    "12:30",
    "00:30",
    "12:30 AM",
    "12:30AM",
    "12:30 a. m.",
    "12:00 PM",
    "12:00 AM"
];

tests.forEach(t => {
    console.log(`Input: "${t}" -> Output: "${validateAndFormatTime(t)}"`);
});
