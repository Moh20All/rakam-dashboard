// Small formatting helpers shared by server and client components.

export const DOWNLOAD_URL = 'https://github.com/Moh20All/Warshati/releases/latest';
// A shop that has not checked its license for this long is shown as "quiet"
export const QUIET_DAYS = 14;

const DAY = 86400000;

export function relTime(date) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo} month${mo > 1 ? 's' : ''} ago`;
  return `${Math.round(mo / 12)} y ago`;
}

export function shortDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function dateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function money(n) {
  if (n == null || n === '') return '—';
  return `${Math.round(Number(n)).toLocaleString('fr-FR').replace(/ | /g, ' ')} DA`;
}

export function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

/** active | waiting (not bound to a PC yet) | revoked */
export function licenseState(lic) {
  if (!lic.is_active) return 'revoked';
  return lic.machine_id ? 'active' : 'waiting';
}

export function isQuiet(lic) {
  if (licenseState(lic) !== 'active' || !lic.last_seen_at) return false;
  return Date.now() - new Date(lic.last_seen_at).getTime() > QUIET_DAYS * DAY;
}

/** Algerian numbers: 0555 12 34 56 -> 213555123456 (for wa.me links) */
export function waNumber(phone) {
  if (!phone) return '';
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `213${d.slice(1)}`;
  return d;
}

export function licenseMessage(name, keys) {
  const list = keys.join('\n');
  const many = keys.length > 1;
  return [
    `Bonjour ${name}, merci d'avoir choisi Warshati !`,
    `${many ? 'Vos clés de licence' : 'Votre clé de licence'} :`,
    list,
    `Télécharger l'application : ${DOWNLOAD_URL}`,
    '',
    `مرحباً ${name}، شكراً لاختياركم ورشتي!`,
    `${many ? 'مفاتيح الترخيص الخاصة بكم' : 'مفتاح الترخيص الخاص بكم'}:`,
    list,
    `تحميل التطبيق: ${DOWNLOAD_URL}`,
  ].join('\n');
}

export function waLink(phone, text) {
  const n = waNumber(phone);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

/** First line of a crash error, with volatile bits (numbers, ids) removed, to group duplicates */
export function crashSignature(error) {
  return String(error || 'Unknown error').split('\n')[0].replace(/\d+/g, '#').slice(0, 200);
}
