/**
 * Починка пунктов главного меню (О фонде, Навечно в строю, Подопечные).
 * Префикс ../ для файлов в events/ и news/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function walkHtml(dir, acc = []) {
  for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, n.name);
    if (n.isDirectory()) walkHtml(p, acc);
    else if (n.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function relPrefix(filePath) {
  const rel = path.relative(root, path.dirname(filePath));
  if (!rel || rel === ".") return "";
  const depth = rel.split(path.sep).filter(Boolean).length;
  return "../".repeat(depth);
}

function patch(html, pfx) {
  const sub = (name, file) =>
    `          <li><a href="${pfx}${file}">${name}</a></li>`;
  const top = (name, file) => `      <li><a href="${pfx}${file}">${name}</a></li>`;

  const pairs = [
    ["          <li><a href=\"#\">История фонда</a></li>", sub("История фонда", "history.html")],
    ["          <li><a href=\"#\">Руководство</a></li>", sub("Руководство", "management.html")],
    ["          <li><a href=\"#\">Документы</a></li>", sub("Документы", "documents.html")],
    ["          <li><a href=\"#\">Отчёты</a></li>", sub("Отчёты", "reports.html")],
    ["      <li><a href=\"#\">Навечно в строю</a></li>", top("Навечно в строю", "memory.html")],
    ["      <li><a href=\"#\">Подопечные фонда</a></li>", top("Подопечные фонда", "wards.html")],
  ];

  let s = html;
  for (const [from, to] of pairs) {
    s = s.split(from).join(to);
  }
  return s;
}

const modified = [];
for (const file of walkHtml(root)) {
  const pfx = relPrefix(file);
  let html = fs.readFileSync(file, "utf8");
  const next = patch(html, pfx);
  if (next !== html) {
    fs.writeFileSync(file, next, "utf8");
    modified.push(path.relative(root, file).replace(/\\/g, "/"));
  }
}

console.log(JSON.stringify({ count: modified.length, files: modified.sort() }, null, 0));
