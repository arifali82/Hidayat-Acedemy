export const $ = (id) => document.getElementById(id);

export function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h << 5) + h + str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export function formatExamDate(iso) {
  if (!iso) return '—';
  const dt = new Date(iso + 'T00:00:00');
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatRelative(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return 'just now';
  if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
  if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
  return Math.floor(d / 86400000) + 'd ago';
}

const verhoeffD = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];
const verhoeffP = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
];

export function validateAadhaar(num) {
  const digits = num.replace(/\s/g, '');
  if (!/^\d{12}$/.test(digits)) return false;
  if (digits[0] === '0' || digits[0] === '1') return false;
  let c = 0;
  const reversed = digits.split('').reverse();
  for (let i = 0; i < reversed.length; i++)
    c = verhoeffD[c][verhoeffP[i % 8][parseInt(reversed[i])]];
  return c === 0;
}

export function generateRollNumber() {
  if (typeof window === 'undefined') return '';
  const counter = parseInt(localStorage.getItem('hidayat-roll-counter') || '0', 10) + 1;
  localStorage.setItem('hidayat-roll-counter', String(counter));
  return `H1448${String(counter).padStart(7, '0')}`;
}