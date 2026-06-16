// ── EVENTS FALLBACK DATA ──────────────────────────
// Datos usados cuando Firebase no está configurado.
// Una vez conectado Firebase, los eventos vienen de Firestore.
import { escapeHTML } from './utils.js';

export const EVENTS = [
  {
    id: 'ev1',
    name: 'TOKYO SEASON CLOSER',
    month: 'OCT',
    day: '26',
    year: '2026',
    timeStart: '1:00 PM',
    timeEnd: '6:00 PM',
    location: '@2gearheadz',
    description: 'The official close of the season, GearHeadz style. Cars, culture, merch drops, and the community that keeps this movement alive. Come through and send the year out right.',
    price: 120,
    status: 'open',
    img: '/images/supra.png',
    mapsEmbed: '',
    mapsLink: '',
    instagramUrl: 'https://www.instagram.com/p/DPjZybUEVqc/',
  },
  {
    id: 'ev2',
    name: 'UNA SOLA VIBRA',
    month: 'NOV',
    day: '02',
    year: '2026',
    timeStart: '11:00 AM',
    timeEnd: '5:00 PM',
    location: '@2gearheadz',
    description: "One vibe. One community. Una Sola Vibra brings together the entire GearHeadz family for a day of cars, culture, and good energy. Limited spots — don't sleep on it.",
    price: 85,
    status: 'limited',
    img: '/images/skyline.png',
    mapsEmbed: '',
    mapsLink: '',
    instagramUrl: 'https://www.instagram.com/p/DPrcOrEkX1r/',
  },
  {
    id: 'ev3',
    name: 'NEXT EVENT',
    month: 'TBA',
    day: '??',
    year: '',
    timeStart: '',
    timeEnd: '',
    location: 'Follow @2gearheadz',
    description: "More events on the way. Follow us on Instagram to be the first to know where we're pulling up next. The grid never stops.",
    price: null,
    status: 'soon',
    img: '/images/rx7.png',
    mapsEmbed: '',
    mapsLink: '',
  },
  {
    id: 'ev4',
    name: 'COMING SOON',
    month: 'TBA',
    day: '??',
    year: '',
    timeStart: '',
    timeEnd: '',
    location: 'Follow @2gearheadz',
    description: "Stay tuned. We're always cooking something up for the community. Sign up for the newsletter to get first access when tickets go live.",
    price: null,
    status: 'soon',
    img: '/images/race_grid.png',
    mapsEmbed: '',
    mapsLink: '',
  },
];

// ── EVENT CARD BUILDERS ───────────────────────────

const STATUS_LABEL = { open: 'OPEN', limited: 'FEW LEFT', soon: 'COMING SOON' };

export function buildEventPreviewCard(ev, index = 0) {
  const isSoon   = ev.status === 'soon';
  const delay    = index === 1 ? 'reveal-delay-1' : index === 2 ? 'reveal-delay-2' : '';
  const btn      = ev.instagramUrl
    ? `<a href="${escapeHTML(ev.instagramUrl)}" target="_blank" rel="noopener" class="btn-ticket learn-more">LEARN MORE ↗</a>`
    : '';
  const timeStr  = ev.timeStart ? `${escapeHTML(ev.timeStart)} – ${escapeHTML(ev.timeEnd)}` : 'Details dropping soon';

  return `
    <div class="ev-card reveal ${delay}">
      <div class="ev-card-img" style="background-image:url('${escapeHTML(ev.img)}');background-size:cover;background-position:center">
        <div class="ev-card-date-tag"${isSoon ? ' style="background:#222"' : ''}>
          <span class="ev-date-month">${escapeHTML(ev.month)}</span>
          <span class="ev-date-day"${isSoon ? ' style="font-size:1.3rem;line-height:1.3"' : ''}>${escapeHTML(ev.day)}</span>
        </div>
        <span class="ev-card-status ${ev.status}">${STATUS_LABEL[ev.status] || ''}</span>
      </div>
      <div class="ev-card-body">
        <div class="ev-card-name">${escapeHTML(ev.name)}</div>
        <div class="ev-card-loc">📍 ${escapeHTML(ev.location)}</div>
        <div class="ev-card-time">${timeStr}</div>
        ${btn}
      </div>
    </div>`;
}

export function buildEventFullCard(ev, index = 0) {
  const isSoon  = ev.status === 'soon';
  const delay   = index % 2 === 1 ? 'reveal-delay-1' : '';
  const btn     = ev.instagramUrl
    ? `<a href="${escapeHTML(ev.instagramUrl)}" target="_blank" rel="noopener" class="btn-ticket learn-more">LEARN MORE ↗</a>`
    : '';
  const timeStr = ev.timeStart
    ? `${escapeHTML(ev.month)} ${escapeHTML(ev.day)}${ev.year ? ', ' + escapeHTML(ev.year) : ''} · ${escapeHTML(ev.timeStart)} – ${escapeHTML(ev.timeEnd)}`
    : 'Date & location TBA';
  const locEl   = ev.mapsLink
    ? `<div class="ev-full-loc">📍 <a href="${escapeHTML(ev.mapsLink)}" target="_blank" rel="noopener">${escapeHTML(ev.location)}</a></div>`
    : `<div class="ev-full-loc">📍 ${escapeHTML(ev.location)}</div>`;
  const mapEl   = ev.mapsEmbed
    // We intentionally don't escape mapsEmbed because it's usually an iframe URL, but wait, it's just a URL inside src="", so we should escape it.
    ? `<div class="ev-full-map"><iframe src="${escapeHTML(ev.mapsEmbed)}" width="100%" height="220" style="border:0;border-radius:8px;margin-top:.75rem" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
    : '';
  const instagramEl = ev.instagramUrl
    ? `<div class="ev-full-instagram">
         <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${escapeHTML(ev.instagramUrl)}" data-instgrm-version="14" style="background: #FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; width: 100%;">
           <div style="padding:16px;">
             <a href="${escapeHTML(ev.instagramUrl)}" style="color:#c9c8cd; text-decoration:none;" target="_blank">Ver publicación en Instagram</a>
           </div>
         </blockquote>
       </div>`
    : '';

  let detailsBtn = '';
  let collapsibleContainer = '';
  if (instagramEl || mapEl) {
    detailsBtn = `<button class="btn-check-details" data-eid="${ev.id}"><span>CHECK DETAILS <span class="ev-details-arrow">▼</span></span></button>`;
    collapsibleContainer = `
      <div id="ev-details-${ev.id}" class="ev-full-details-collapse">
        ${instagramEl}
        ${mapEl}
        <button class="btn-close-details" data-eid="${ev.id}">
          <span>CLOSE DETAILS <span style="font-size:0.7rem;margin-left:0.25rem">▲</span></span>
        </button>
      </div>`;
  }

  return `
    <div class="ev-full-card reveal ${delay}">
      <div class="ev-full-img" style="background-image:url('${escapeHTML(ev.img)}');background-size:cover;background-position:center">
        <div class="ev-full-date-tag"${isSoon ? ' style="background:#222"' : ''}>
          <span class="ev-full-date-month">${escapeHTML(ev.month)}</span>
          <span class="ev-full-date-day"${isSoon ? ' style="font-size:1.5rem;line-height:1.3"' : ''}>${escapeHTML(ev.day)}</span>
        </div>
        <span class="ev-full-status ${ev.status}">${STATUS_LABEL[ev.status] || ''}</span>
      </div>
      <div class="ev-full-body">
        <div class="ev-full-name">${escapeHTML(ev.name)}</div>
        <div class="ev-full-time">${timeStr}</div>
        ${locEl}
        <p class="ev-full-desc">${escapeHTML(ev.description)}</p>
        ${detailsBtn}
        ${collapsibleContainer}
        ${btn}
      </div>
    </div>`;
}
