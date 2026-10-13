/** Read-only content audit. Run: bun tools/audit-content.mjs [output.json] [course] */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { unified } from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import math from 'remark-math';
import wiki from '@flowershow/remark-wiki-link';
import katex from 'katex';
import { fileURLToPath } from 'node:url';
import { targetRenderer } from '../node_modules/@twango/twiki/site/tooling/check-targets.ts';
import { writeReport } from './content-audit-report.mjs';

const root = path.resolve(import.meta.dir, '..');
const content = path.join(root, 'content');
const output = path.resolve(process.argv[2] ?? path.join(root, 'private/content-quality/audit.json'));
const selected = process.argv[3];
const ignored = new Set(['.git', 'node_modules', '.venv', '.idea', '.obsidian', 'build', 'dist', '__pycache__']);
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (ignored.has(e.name) || e.name.startsWith('.') || e.isSymbolicLink()) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : e.isFile() ? [p] : [];
  });
}
const allFiles = files(content);
const fileSet = new Set(allFiles);
const allNotes = allFiles.filter(p => /\.(md|rmd)$/i.test(p));
const parser = unified().use(parse).use(gfm).use(math).use(wiki);
const renderTargets = targetRenderer(content, allFiles);
const records = new Map();
const reviewFile = path.join(root, 'private/content-quality/reviewed.json');
const reviews = fs.existsSync(reviewFile) ? JSON.parse(fs.readFileSync(reviewFile, 'utf8')).documents : {};
const nameIndex = new Map();
for (const p of allFiles) {
  const parts = path.relative(content, p).split(path.sep);
  const course = parts.length === 1 ? '_vault' : parts[0];
  const relative = (parts.length === 1 ? parts : parts.slice(1)).join('/');
  for (const variant of new Set([relative, relative.replace(/\.(md|rmd)$/i, '')])) {
    const segments = variant.split('/');
    for (let i = 0; i < segments.length; i++) {
      const key = course + '/' + segments.slice(i).join('/');
      nameIndex.set(key, [...new Set([...(nameIndex.get(key) ?? []), p])]);
    }
  }
}
function category(relative) {
  if (relative === 'README.md') return 'course-map';
  if (/^lectures\/lecture[^/]*\.md$/i.test(relative)) return 'lecture';
  if (/^textbook\/(?!index)/.test(relative)) return 'textbook';
  if (/^exams\//.test(relative)) return 'exam';
  if (/^discussions\//.test(relative)) return 'discussion';
  if (/^homework\//.test(relative)) return 'homework';
  if (/^(p\d+|a\d+|assignments|project|demos|hw\d+)\//.test(relative)) return 'course-code-document';
  return 'note-or-hub';
}
function plain(node) { return node.value ?? node.children?.map(plain).join('') ?? ''; }
function slug(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '-'); }
function blank(s) { return s.replace(/[^\r\n]/g, ' '); }
function resolve(source, raw) {
  if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(raw)) return { external: true };
  let target;
  try { target = decodeURIComponent(raw); } catch { return { missing: true, invalidEncoding: true }; }
  // Flowershow retains the backslash before an escaped table alias separator.
  target = target.replace(/\\\|/g, '|').replace(/\\$/, '').trim();
  const [fileWithQuery, anchor] = target.split('#');
  const file = fileWithQuery.split('?')[0];
  if (!file) return { target: source, anchor };
  const parts = path.relative(content, source).split(path.sep);
  const course = parts.length === 1 ? content : path.join(content, parts[0]);
  const relative = file.replace(/^\//, '');
  for (const base of [path.dirname(source), course, content]) {
    const candidate = path.resolve(base, relative);
    if (!(candidate === content || candidate.startsWith(content + path.sep))) continue;
    for (const p of [candidate, candidate + '.md', candidate + '.Rmd', path.join(candidate, 'index.md'), path.join(candidate, 'README.md')]) {
      if (fileSet.has(p)) return { target: p, anchor };
    }
  }
  const matches = nameIndex.get(path.basename(course) + '/' + relative) ?? [];
  if (matches.length === 1) return { target: matches[0], anchor };
  return matches.length ? { ambiguous: matches.map(p => path.relative(content, p)) } : { missing: true };
}
for (const file of allNotes) {
  const original = fs.readFileSync(file, 'utf8');
  const parts = path.relative(content, file).split(path.sep);
  const course = parts.length === 1 ? '_vault' : parts[0];
  const relative = path.relative(course === '_vault' ? content : path.join(content, course), file);
  const source = original.replace(/^---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)(?:\r?\n|$)/, blank)
    .replace(/%%[\s\S]*?%%/g, blank).replace(/<!--[\s\S]*?-->/g, blank);
  const tree = parser.parse(source);
  const record = { file: path.relative(content, file), course, category: category(relative),
    sha256: crypto.createHash('sha256').update(original).digest('hex'), bytes: Buffer.byteLength(original),
    words: original.split(/\s+/).filter(Boolean).length, headings: [], links: [], mathExpressions: 0,
    findings: [], semanticReview: 'pending' };
  const review = reviews[record.file];
  if (review?.sha256 === record.sha256) {
    record.semanticReview = review.status;
    record.sourceReview = review;
  } else if (review) record.semanticReview = 'changed-since-source-review';
  records.set(file, record);
  const finding = (rule, status, line, detail) => record.findings.push({ rule, status, line, detail });
  const definitions = new Map();
  function definitionsWalk(n) {
    if (n.type === 'definition') definitions.set(n.identifier.toLowerCase(), n.url);
    for (const c of n.children ?? []) definitionsWalk(c);
  }
  definitionsWalk(tree);
  function addLink(raw, n, syntax) {
    if (raw == null) {
      finding('undefined-link-reference', 'confirmed', n.position.start.line, n.identifier);
      return;
    }
    record.links.push({ raw, line: n.position.start.line, syntax });
  }
  function walk(n) {
    const line = n.position?.start.line ?? 1;
    if (n.type === 'heading') record.headings.push({ depth: n.depth, text: plain(n), line });
    if (n.type === 'code' && !n.lang) finding('untagged-code-fence', 'review', line, 'Select the actual language, or text for plain output.');
    if (n.type === 'math' || n.type === 'inlineMath') {
      record.mathExpressions++;
      try { katex.renderToString(n.value, { throwOnError: true, displayMode: n.type === 'math', strict: false }); }
      catch (e) { finding('math-render-error', 'confirmed', line, { expression: n.value, error: e.message }); }
      if (/\^\s*\{\s*[69]\s*[69]\s*\}/.test(n.value)) finding('ocr-quotation-as-exponent', 'review', line, n.value);
    }
    if (['wikiLink', 'embed'].includes(n.type)) addLink(n.value, n, n.type);
    if (['link', 'image', 'definition'].includes(n.type)) addLink(n.url, n, n.type);
    if (['linkReference', 'imageReference'].includes(n.type)) addLink(definitions.get(n.identifier.toLowerCase()), n, n.type);
    if (n.type === 'html') {
      if (/<table\b/i.test(n.value)) finding('html-table', 'review', line, 'Review readability, cell order, and embedded mathematics.');
      for (const m of n.value.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) addLink(m[1], n, 'html');
    }
    // Code samples and inline code are not prose or links.
    if (['code', 'inlineCode'].includes(n.type)) return;
    for (const c of n.children ?? []) walk(c);
  }
  walk(tree);
  // Confirm link existence with the pinned engine too; the filesystem graph
  // separately captures Obsidian-style navigation and possible route differences.
  const targetHtml = renderTargets(file, original);
  for (const [index, html] of targetHtml.split('\n').entries()) {
    for (const match of html.matchAll(/href="(file:[^"]+)"/g)) {
      const url = new URL(match[1].replace(/&amp;/g, '&'));
      const target = fileURLToPath(url);
      if (!fs.existsSync(target)) finding('renderer-missing-local-target', 'confirmed', index + 1, path.relative(content, target));
      const renderedRelative = path.relative(content, target);
      const renderedCourse = renderedRelative.split(path.sep)[0];
      const lineLinks = record.links.filter(l => l.line === index + 1);
      if (course !== '_vault' && (renderedRelative === '' || renderedRelative === 'index.md'))
        finding('renderer-unexpected-vault-root', 'review', index + 1, 'The engine resolves this link to the vault homepage; verify the intended local hub or question anchor.');
      else if (course !== '_vault' && renderedCourse !== course && !renderedRelative.startsWith('..') &&
          !lineLinks.some(l => l.raw.includes(renderedCourse + '/')))
        finding('renderer-implicit-cross-course-target', 'review', index + 1, renderedRelative);
      const expected = lineLinks.map(l => resolve(file, l.raw).target).filter(Boolean);
      if (expected.length && !expected.includes(target))
        finding('renderer-filesystem-resolution-difference', 'review', index + 1,
          { rendered: renderedRelative, filesystemCandidates: expected.map(p => path.relative(content,p)) });
    }
  }
  const h1 = record.headings.filter(h => h.depth === 1);
  if (h1.length !== 1) finding('h1-count', record.category === 'course-code-document' ? 'review' : 'confirmed', 1, h1.length);
  for (let i = 1; i < record.headings.length; i++) {
    const h = record.headings[i], before = record.headings[i - 1];
    if (h.depth > before.depth + 1) finding('heading-level-jump', 'review', h.line, `${before.depth} to ${h.depth}`);
  }
  if (record.category === 'lecture') {
    if (!/^---\r?\n[\s\S]*?^date:\s*\d{4}-\d{2}-\d{2}/m.test(original))
      finding('lecture-date-unrecorded', 'review', 1, 'Recover from evidence; do not infer an unsupported date.');
    if (!/^Lecture\s+\d+:\s*\S/i.test(h1[0]?.text ?? '')) finding('lecture-title-shape', 'review', h1[0]?.line ?? 1, h1[0]?.text);
    if (record.words < 300) finding('short-lecture', 'review', 1, 'Compare coverage and worked examples with the source; length alone is not a defect.');
  }
  for (const [index, text] of source.split(/\r?\n/).entries()) {
    if (/\bMiner\s?U\b/i.test(text)) finding('conversion-process-prose', 'review', index + 1, text.trim());
    if (/wisconsin-legacy/.test(text)) finding('archive-name-in-note', 'review', index + 1, text.trim());
    if (/(?:WISC)?COMPSCI\d{3}MATH\d{3}|©zyBool|WISCCOMPSC|www\.zybooks\.com|WISC.*KellerSpring2025/.test(text))
      finding('ocr-watermark', 'review', index + 1, text.trim().slice(0, 240));
    if (/not (?:exhaustively|fully|independently)|not every|spot[- ]review|not[^.]*verified|Source answer unavailable|Source fidelity|uncertain|illegible/i.test(text))
      finding('source-review-needed', 'review', index + 1, text.trim().slice(0, 240));
    if (/This section has been set as|synced to your LMS|PARTICIPATION\s*$|CHALLENGE\s*$|ACTIVITY\s*$/.test(text))
      finding('lms-interface-prose', 'review', index + 1, text.trim());
    if (/[\uFFFD\uE000-\uF8FF]/.test(text)) finding('replacement-or-private-glyph', 'review', index + 1, text.trim().slice(0, 240));
  }
  if (record.bytes > 500_000) finding('large-note', 'review', 1, 'Review navigation and chapter boundaries; this is not a hosting-cap assertion.');
}
const graph = new Map();
for (const [file, record] of records) {
  const edges = new Set();
  const seen = new Set();
  for (const link of record.links) {
    const r = resolve(file, link.raw);
    link.resolution = r.target ? path.relative(content, r.target) : r;
    if (r.missing) record.findings.push({ rule: 'missing-local-target', status: 'confirmed', line: link.line, detail: link.raw });
    if (r.ambiguous) record.findings.push({ rule: 'ambiguous-local-target', status: 'review', line: link.line, detail: { target: link.raw, candidates: r.ambiguous } });
    if (r.target && records.has(r.target)) {
      edges.add(r.target);
      if (r.anchor && !r.anchor.startsWith('^')) {
        const heading = decodeURIComponent(r.anchor);
        if (!records.get(r.target).headings.some(h => h.text === heading || slug(h.text) === slug(heading)))
          record.findings.push({ rule: 'heading-anchor-review', status: 'review', line: link.line, detail: link.raw });
      }
    }
    if (link.syntax === 'wikiLink' && seen.has(link.raw)) {
      // Repeated links are often intentional; only adjacent duplicate list entries are editorial candidates.
      const previous = record.links.find(x => x !== link && x.raw === link.raw && Math.abs(x.line - link.line) <= 1);
      if (previous) record.findings.push({ rule: 'adjacent-duplicate-link', status: 'review', line: link.line, detail: link.raw });
    }
    seen.add(link.raw);
  }
  graph.set(file, edges);
}
const courses = {};
for (const course of [...new Set([...records.values()].map(r => r.course))].sort()) {
  if (selected && course !== selected) continue;
  const reached = new Set(), queue = [course === '_vault' ? path.join(content, 'index.md') : path.join(content, course, 'README.md')];
  while (queue.length) { const p = queue.pop(); if (reached.has(p)) continue; reached.add(p); queue.push(...(graph.get(p) ?? [])); }
  const notes = [...records.entries()].filter(([, r]) => r.course === course);
  for (const [file, r] of notes) {
    r.reachableFromCourseReadme = reached.has(file);
    if (!reached.has(file)) r.findings.push({ rule: 'unreachable-from-course-map', status: r.category === 'course-code-document' ? 'review' : 'confirmed', line: 1, detail: 'Graph includes wiki, Markdown, reference, and HTML links. Resolution is a filesystem audit, not renderer certification.' });
  }
  courses[course] = { documents: notes.length, withFindings: notes.filter(([,r]) => r.findings.length).length,
    confirmedFindings: notes.flatMap(([,r]) => r.findings).filter(f => f.status === 'confirmed').length,
    rules: count(notes.flatMap(([,r]) => r.findings).map(f => f.rule)),
    unreachableNotes: notes.filter(([,r]) => !r.reachableFromCourseReadme && r.category !== 'course-code-document').map(([,r]) => r.file),
    codeDocumentReviewCandidates: notes.filter(([,r]) => !r.reachableFromCourseReadme && r.category === 'course-code-document').map(([,r]) => r.file) };
}
function count(items) { const c = {}; for (const x of items) c[x] = (c[x] ?? 0) + 1; return c; }
const documents = [...records.values()].filter(r => !selected || r.course === selected);
const duplicateGroups = new Map();
for (const r of documents) duplicateGroups.set(r.sha256, [...(duplicateGroups.get(r.sha256) ?? []), r.file]);
const result = { schemaVersion: 1, generatedAt: new Date().toISOString(),
  scope: 'All Markdown/R Markdown files except dependency, generated, hidden tool state, and symlink directories. No source files mutated.',
  limitations: ['Rendering success does not certify mathematics, source fidelity, completeness, grades, or diagram topology.',
    'Review findings are candidates, not proven defects. Source and semantic review remain pending unless separately documented.',
    'Filesystem targets use source-relative, course-relative, content-relative, and unique course path-suffix resolution. renderer-missing-local-target additionally uses the pinned engine targetRenderer. Anchors and ambiguities require review.',
    'External URL availability is not checked. Binary candidates require classification as course data, source content, or printable companions.'],
  summary: { documents: documents.length, courses: Object.keys(courses).filter(c => c !== '_vault').length, rules: count(documents.flatMap(r => r.findings).map(f => f.rule)) },
  courses, exactDuplicateGroups: [...duplicateGroups.values()].filter(g => g.length > 1),
  binaryReviewCandidates: allFiles.filter(p => /\.(pdf|pptx?|docx?|m4a|mp3|wav)$/i.test(p) && (!selected || path.relative(content,p).split(path.sep)[0] === selected)).map(p => path.relative(content,p)),
  documents };
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
const htmlReport = writeReport(result, output);
console.log(JSON.stringify({ output, htmlReport, ...result.summary, exactDuplicateGroups: result.exactDuplicateGroups.length, binaryReviewCandidates: result.binaryReviewCandidates.length }, null, 2));
