
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
        const period = hours >= 12 ? 'PM' : 'AM';

        let displayHour = hours % 12;
        if (displayHour === 0) displayHour = 12;

        const minutesStr = String(minutes).padStart(2, '0');
        return `${displayHour}:${minutesStr} ${period}`;
    } else {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
}

console.log('12:30 ->', formatTimeDisplay('12:30'));
console.log('15:00 ->', formatTimeDisplay('15:00'));
console.log('00:30 ->', formatTimeDisplay('00:30'));
