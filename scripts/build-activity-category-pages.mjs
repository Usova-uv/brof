/**
 * Создаёт deti.html, vdovy.html, … из projects.html; патчит ссылки; удаляет projects.html.
 * Запуск из корня репозитория: node scripts/build-activity-category-pages.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const OLD_NAV = `      <li class="menu-item-has-children">
        <a href="projects.html">Деятельность фонда</a>
        <ul class="sub-menu">
          <li><a href="projects.html#deti">Поддержка детей</a></li>
          <li><a href="projects.html#vdovy">Вдовы и матери</a></li>
          <li><a href="projects.html#veterany-vov">Ветераны ВОВ</a></li>
          <li><a href="projects.html#veterany-boevyh">Ветераны боевых действий</a></li>
          <li><a href="projects.html#sportivnye">Спортивные события</a></li>
          <li><a href="projects.html#omon">Сотрудники ОМОН</a></li>
        </ul>
      </li>`;

const NEW_NAV = `      <li class="menu-item-has-children">
        <a href="deti.html">Деятельность фонда</a>
        <ul class="sub-menu">
          <li><a href="deti.html">Поддержка детей</a></li>
          <li><a href="vdovy.html">Вдовы и матери</a></li>
          <li><a href="veterany-vov.html">Ветераны ВОВ</a></li>
          <li><a href="veterany-boevyh.html">Ветераны боевых действий</a></li>
          <li><a href="sportivnye-sobytiya.html">Спортивные события</a></li>
          <li><a href="omon.html">Сотрудники ОМОН</a></li>
        </ul>
      </li>`;

const PAGES = [
  {
    file: "deti.html",
    sectionId: "deti",
    docTitle: "Поддержка детей",
    lead: "Мероприятия и программы поддержки детей из семей сотрудников ОМОН и подопечных фонда.",
  },
  {
    file: "vdovy.html",
    sectionId: "vdovy",
    docTitle: "Вдовы и матери",
    lead: "Поддержка вдов и матерей погибших сотрудников: торжественные встречи, концерты и адресная помощь.",
  },
  {
    file: "veterany-vov.html",
    sectionId: "veterany-vov",
    docTitle: "Ветераны ВОВ",
    lead: "Праздничные и памятные мероприятия для ветеранов Великой Отечественной войны.",
  },
  {
    file: "veterany-boevyh.html",
    sectionId: "veterany-boevyh",
    docTitle: "Ветераны боевых действий",
    lead: "Собрания, митинги и встречи с ветеранами боевых действий и воинами-интернационалистами.",
  },
  {
    file: "sportivnye-sobytiya.html",
    sectionId: "sportivnye",
    docTitle: "Спортивные события",
    lead: "Турниры по самбо, кубки и спортивные праздники при поддержке фонда.",
  },
  {
    file: "omon.html",
    sectionId: "omon",
    docTitle: "Сотрудники ОМОН",
    lead: "Торжественные мероприятия и профессиональный праздник сотрудников ОМОН.",
  },
];

function stripCategoryPageCss(html) {
  return html
    .replace(/\.veterans-intro\{[^}]+\}\r?\n/g, "")
    .replace(/\.veterans-intro h2\{[^}]+\}\r?\n/g, "")
    .replace(/\.veterans-intro p\{[^}]+\}\r?\n/g, "")
    .replace(/\.project-grid\{[^}]+\}\r?\n/g, "")
    .replace(/\.project-card\{[^}]+\}\r?\n/g, "")
    .replace(/\.project-card:hover\{[^}]+\}\r?\n/g, "")
    .replace(/\.project-card h3\{[^}]+\}\r?\n/g, "")
    .replace(/\.project-card p\{[^}]+\}\r?\n/g, "")
    .replace(
      /@media\(max-width:768px\)\{\.project-grid\{grid-template-columns:1fr\}\.nav-inner/g,
      "@media(max-width:768px){.nav-inner"
    );
}

function applyNavAndFooter(html) {
  let h = html;
  if (h.includes(OLD_NAV)) h = h.replace(OLD_NAV, NEW_NAV);
  else if (!h.includes('href="deti.html">Деятельность фонда</a>')) {
    console.warn("Nav block not matched; check projects.html / already patched");
  }
  h = h.replace(
    /<a href="projects\.html">Деятельность фонда<\/a>/g,
    '<a href="deti.html">Деятельность фонда</a>'
  );
  return h;
}

function extractSection(html, id) {
  const re = new RegExp(
    `    <section id="${id}">[\\s\\S]*?    </section>`,
    "m"
  );
  const m = html.match(re);
  return m ? m[0] : null;
}

function patchActivityLinks(html) {
  const reps = [
    ["href=\"../projects.html#sportivnye\"", 'href="../sportivnye-sobytiya.html"'],
    ["href=\"../projects.html#veterany-boevyh\"", 'href="../veterany-boevyh.html"'],
    ["href=\"../projects.html#veterany-vov\"", 'href="../veterany-vov.html"'],
    ["href=\"../projects.html#vdovy\"", 'href="../vdovy.html"'],
    ["href=\"../projects.html#deti\"", 'href="../deti.html"'],
    ["href=\"../projects.html#omon\"", 'href="../omon.html"'],
    ['href="projects.html#sportivnye"', 'href="sportivnye-sobytiya.html"'],
    ['href="projects.html#veterany-boevyh"', 'href="veterany-boevyh.html"'],
    ['href="projects.html#veterany-vov"', 'href="veterany-vov.html"'],
    ['href="projects.html#vdovy"', 'href="vdovy.html"'],
    ['href="projects.html#deti"', 'href="deti.html"'],
    ['href="projects.html#omon"', 'href="omon.html"'],
    ['href="../projects.html"', 'href="../deti.html"'],
    ['href="projects.html"', 'href="deti.html"'],
  ];
  let s = html;
  for (const [a, b] of reps) s = s.split(a).join(b);
  return s;
}

function walkHtmlFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walkHtmlFiles(p, acc);
    else if (name.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

// --- build 6 category pages from projects.html
const projectsPath = path.join(root, "projects.html");
if (!fs.existsSync(projectsPath)) {
  console.error("Нет projects.html — уже удалён? Восстановите из git и запустите снова.");
  process.exit(1);
}

const raw = fs.readFileSync(projectsPath, "utf8");

let base = stripCategoryPageCss(raw);
base = applyNavAndFooter(base);

const cw = base.indexOf('<div class="content-wrap">');
const ft = base.indexOf("<footer>");
if (cw === -1 || ft === -1) {
  console.error("Не найдена разметка content-wrap / footer");
  process.exit(1);
}

const prefix = base.slice(0, cw);
const suffix = base.slice(ft);

for (const p of PAGES) {
  const section = extractSection(raw, p.sectionId);
  if (!section) {
    console.error("Секция не найдена:", p.sectionId);
    process.exit(1);
  }
  const middle = `<div class="content-wrap">
  <div class="page-header">
    <h1>${p.docTitle}</h1>
    <p>${p.lead}</p>
  </div>

  <div class="activities-container">

${section}

  </div>
</div>
`;
  let doc = prefix + middle + "\n\n" + suffix;
  doc = doc.replace(
    /<title>[^<]*<\/title>/,
    `<title>${p.docTitle} — БРОФ «Твардовского, 2»</title>`
  );
  doc = patchActivityLinks(doc);
  fs.writeFileSync(path.join(root, p.file), doc, "utf8");
  console.log("Записан", p.file);
}

// --- patch all other HTML
const skip = new Set(
  PAGES.map((p) => path.join(root, p.file)).map((x) => path.normalize(x))
);

for (const file of walkHtmlFiles(root)) {
  const norm = path.normalize(file);
  if (norm === path.normalize(projectsPath)) continue;
  if (skip.has(norm)) continue;
  let h = fs.readFileSync(file, "utf8");
  if (!h.includes("projects.html")) continue;
  const next = patchActivityLinks(h);
  if (next !== h) {
    fs.writeFileSync(file, next, "utf8");
    console.log("Патч ссылок:", path.relative(root, file));
  }
}

// --- update event-template for future generate-events runs
const et = path.join(root, "event-template.html");
let etHtml = fs.readFileSync(et, "utf8");
if (etHtml.includes("projects.html")) {
  etHtml = patchActivityLinks(etHtml);
  fs.writeFileSync(et, etHtml, "utf8");
  console.log("Обновлён event-template.html");
}

fs.unlinkSync(projectsPath);
console.log("Удалён projects.html");
console.log("Готово.");
