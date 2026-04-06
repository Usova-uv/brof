/**
 * Парсит страницы категорий деятельности (deti.html, vdovy.html, …),
 * создаёт страницы в events/ по шаблону event-template.html.
 * Карточки в категориях уже ссылки — исходные HTML не перезаписываются.
 * Запуск: node scripts/generate-events-from-projects.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const TRANSLIT = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function translitTitle(str) {
  let out = "";
  for (const ch of str.toLowerCase()) {
    if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (/[\s\-—–.,:;!?«»"'()\/]/.test(ch) || ch === "№") out += "-";
    else if (ch === "«" || ch === "»") out += "-";
    else out += "";
  }
  return out
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function dateToYmd(ddmmyyyy) {
  const m = ddmmyyyy.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return ddmmyyyy.replace(/\./g, "-");
  return `${m[3]}${m[2]}${m[1]}`;
}

function escHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseCardInner(block) {
  const dateM = block.match(/<div class="event-date">([^<]*)<\/div>/);
  const titleM = block.match(/<h3 class="event-title">([^<]*)<\/h3>/);
  const textM = block.match(/<p class="event-text">([^<]*)<\/p>/);
  if (!dateM || !titleM || !textM) return null;
  return {
    date: dateM[1].trim(),
    title: titleM[1].trim(),
    text: textM[1].trim(),
    inner: block,
  };
}

/** Карточки из <article> или из уже сгенерированных <a class="event-card"> */
function parseEventCards(html) {
  const cards = [];
  const useArticle = html.includes('<article class="event-card">');
  const re = useArticle
    ? /<article class="event-card">\s*([\s\S]*?)<\/article>/g
    : /<a href="events\/[^"]+" class="event-card">\s*([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const parsed = parseCardInner(m[1]);
    if (parsed) cards.push(parsed);
    else console.warn("Skip malformed card block");
  }
  return { cards, useArticle };
}

function relinkTemplateForEventsSubdir(template) {
  return template
    .replace(/href="(?!https?:|#|mailto:|tel:|\.\.\/)([^"]+)"/g, 'href="../$1"')
    .replace(/action="(?!https?:|\.\.\/)([^"]+)"/g, 'action="../$1"')
    .replace(/src="images\//g, 'src="../images/')
    .replace(/src="js\//g, 'src="../js/');
}

function buildPage(templateBase, { title, date, text }) {
  const pageTitle = escHtml(`${title} — БРОФ «Твардовского, 2»`);
  const h1 = escHtml(title);
  const bodyText = `<p><strong>Дата:</strong> ${escHtml(date)}</p><p>${escHtml(text)}</p>`;

  return templateBase
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${pageTitle}</title>`
    )
    .replace(/<h1>[^<]*<\/h1>/, `<h1>${h1}</h1>`)
    .replace(
      /<div class="event-text">[\s\S]*?<\/div>/,
      `<div class="event-text">\n      ${bodyText}\n    </div>`
    );
}

function assignFilenamesFixed(cards) {
  const seenBase = new Map(); // base -> number of times used
  const usedSlugs = new Set();
  return cards.map((c) => {
    const base = translitTitle(c.title) || "sobytie";
    const used = seenBase.get(base) || 0;
    seenBase.set(base, used + 1);
    const ymd = dateToYmd(c.date);
    let slug =
      used === 0 ? base : `${base}-${ymd}`;
    let full = `${slug}.html`;
    let dup = 2;
    while (usedSlugs.has(full)) {
      full = `${slug}-${dup++}.html`;
    }
    usedSlugs.add(full);
    return { ...c, slug: full };
  });
}

// --- main
const ACTIVITY_CATEGORY_FILES = [
  "deti.html",
  "vdovy.html",
  "veterany-vov.html",
  "veterany-boevyh.html",
  "sportivnye-sobytiya.html",
  "omon.html",
];
const templatePath = path.join(root, "event-template.html");
const eventsDir = path.join(root, "events");

const categoryHtml = ACTIVITY_CATEGORY_FILES.map((f) =>
  fs.readFileSync(path.join(root, f), "utf8")
).join("\n");
const templateRaw = fs.readFileSync(templatePath, "utf8");
const templateBase = relinkTemplateForEventsSubdir(templateRaw);

const { cards, useArticle } = parseEventCards(categoryHtml);
if (cards.length !== 75) {
  console.error(`Ожидалось 75 карточек, найдено: ${cards.length}`);
  process.exit(1);
}

const withSlugs = assignFilenamesFixed(cards);

if (!fs.existsSync(eventsDir)) {
  fs.mkdirSync(eventsDir, { recursive: true });
} else {
  for (const f of fs.readdirSync(eventsDir)) {
    if (f.endsWith(".html")) fs.unlinkSync(path.join(eventsDir, f));
  }
}

for (const ev of withSlugs) {
  const html = buildPage(templateBase, {
    title: ev.title,
    date: ev.date,
    text: ev.text,
  });
  fs.writeFileSync(path.join(eventsDir, ev.slug), html, "utf8");
}

if (useArticle) {
  console.warn(
    "Найдены <article class=\"event-card\"> — конвертация в ссылки не выполняется (ожидаются <a class=\"event-card\"> на страницах категорий)."
  );
}

console.log(`Создано ${withSlugs.length} файлов в events/`);
console.log(`Источник карточек: ${ACTIVITY_CATEGORY_FILES.join(", ")}`);
withSlugs.slice(0, 5).forEach((e) =>
  console.log(`  ${e.slug} ← ${e.title} (${e.date})`)
);
console.log(`  … и ещё ${withSlugs.length - 5}`);
