
function formatTimeDisplay(timeStr, use12Hour = true) {
    if (!timeStr || timeStr.trim() === '') return '';

    let cleanTime = timeStr.trim();
    cleanTime = cleanTime.replace(/\s*(AM|PM)\s*$/i, '');

    const parts = cleanTime.split(':');
    if (parts.length < 2) return cleanTime;

    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return cleanTime;

    if (hours > 23) hours = 23;
    if (hours < 0) hours = 0;

    if (use12Hour) {
        // Formato Civil 12h estricto según petición:
        // 00:00 – 11:59 → AM
        // 12:00 – 12:59 → PM
        // 13:00 – 23:59 → PM

        const isPM = hours >= 12;
        const period = isPM ? 'PM' : 'AM';

        let displayHour = hours;

        if (hours === 0) {
            displayHour = 12; // 00:00 -> 12:00 AM
        } else if (hours > 12) {
            displayHour = hours - 12; // 13:00 -> 1:00 PM
        }
        // Nota: si hours es 12, se queda como 12 y es PM. Perfecto.

        const minutesStr = String(minutes).padStart(2, '0');
        return `${displayHour}:${minutesStr} ${period}`;
    } else {
        // Formato Técnico 24h: HH:mm (para inputs)
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
}

console.log('12:30 ->', formatTimeDisplay('12:30'));
console.log('15:00 ->', formatTimeDisplay('15:00'));
console.log('00:30 ->', formatTimeDisplay('00:30'));
