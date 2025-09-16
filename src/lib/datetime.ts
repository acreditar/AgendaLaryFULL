// Utilities for handling date/time in the Brazil (UTC-3) timezone with 24-hour format
// We avoid external deps by using Intl APIs and storing ISO-ish strings (YYYY-MM-DDTHH:mm)

export const BR_TZ = 'America/Sao_Paulo' as const;

type Parts = Record<string, string>;

function getNowPartsInTZ(): Parts {
    const dtf = new Intl.DateTimeFormat('pt-BR', {
        timeZone: BR_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const parts = dtf.formatToParts(new Date());
    const map: Parts = {};
    for (const p of parts) {
        if (p.type !== 'literal') map[p.type] = p.value;
    }
    // Ensure zero-padded
    const year = map.year;
    const month = map.month.padStart(2, '0');
    const day = map.day.padStart(2, '0');
    const hour = map.hour.padStart(2, '0');
    const minute = map.minute.padStart(2, '0');
    return { year, month, day, hour, minute };
}

// Returns YYYY-MM-DD for current date in BR timezone
export function todayDatePartBR(): string {
    const { year, month, day } = getNowPartsInTZ();
    return `${year}-${month}-${day}`;
}

// Returns YYYY-MM-DDTHH:mm for current date/time in BR timezone
export function nowDateTimeBR(): string {
    const { year, month, day, hour, minute } = getNowPartsInTZ();
    return `${year}-${month}-${day}T${hour}:${minute}`;
}

// Combine date and time inputs (YYYY-MM-DD and HH:mm) into ISO-ish string
export function joinDateTime(datePart: string, timePart: string): string {
    if (!datePart) return '';
    const t = timePart && timePart.length >= 4 ? timePart : '09:00';
    return `${datePart}T${t}`;
}

// Extracts parts from ISO-ish string (YYYY-MM-DDTHH:mm)
export function splitISOish(isoish?: string): { date: string; time: string } {
    if (!isoish) return { date: '', time: '' };
    const [d, t] = isoish.split('T');
    return { date: d || '', time: (t || '').slice(0, 5) };
}

// Formats ISO-ish (YYYY-MM-DDTHH:mm) to pt-BR 24h: dd/MM/yyyy HH:mm
export function isoishToBR(isoish: string): string {
    if (!isoish || !isoish.includes('T')) return '';
    const { date, time } = splitISOish(isoish);
    const [y, m, d] = date.split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y} ${time}`;
}

// Lexicographic compare for ISO-ish strings (safe because same format)
export function compareISOish(a: string, b: string): number {
    return a.localeCompare(b);
}
