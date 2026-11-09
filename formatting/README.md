# General formatting

These rules apply to every course. Content-type specs add only their exceptions.

## Files and navigation

- One document, one named Markdown file: `lecture-04.md`, `quiz-03.md`,
  `practice-exam-1.md`. Never wrap a single document in a folder with `index.md`.
  Standalone navigation pages follow the same rule.
- Use folders for collections and working projects. `index.md` is a collection
  hub; course and code-project entry pages use `README.md`.
- Keep course numbering and required code layouts. Figures belong in the
  containing directory's `assets/`, named `<note>-figNN.<ext>`; use course-level
  assets only for genuinely shared figures.
- The course README links category hubs or individual notes. Hubs list their
  contents in course order. Every note must be reachable from the README;
  adding a note to an existing hub does not require duplicating its link there.
- When moving or merging a note, update every incoming link and asset reference.

## Writing and sources

- Use one H1, nested headings, tagged code fences, and LaTeX math. Escape literal
  currency dollars (`\$5`). Keep frontmatter limited to useful metadata; omit
  unknown dates and empty fields.
- Preserve substantive source content, assignment requirements, citations,
  credits, licenses, and personal work. Keep submissions and grades identifiable.
- Keep attribution brief: descriptive title, author, date, or a useful source
  link. Omit importer narration: conversion tools, API/session diagnostics,
  extraction history, cleanup claims, and inventories of missing inputs.
- State specific gaps or ambiguities briefly beside the affected content:
  "Questions unavailable; see Canvas." Keep actual source errors and corrections
  distinguishable. Put processing details in private review reports outside the
  course notes; removing boilerplate does not establish source verification.
- Keep original upload filenames, local paths, and recording export titles out
  of notes and indexes. Preserve filenames required by coursework and file links.

## Questions and answers

- Quizzes, homework, discussions, and exams share the same study format: visible
  question, then a collapsed `> [!success]- Answer` callout when an answer exists.
  Filing a question does not require generating an answer.
- Preserve original numbering, parts, points, and assumptions. Use `## Question N`
  or the source's term, such as `Exercise N`, with subheadings for parts. Generated
  mixed practice uses neutral headings that do not reveal the technique.
- Give the result followed by its reasoning inside the answer callout, including
  worked figures. Keep choices unmarked: `- [ ]` or `- **(A)** ...`.
- Identify instructor answers and study answers once per uniform page; label
  exceptions locally. State reconstructed prompts and changed assumptions.
- Combine matching questions and keys into one study page. Keep distinct
  assessment versions and personal submissions identifiable; retain personal
  feedback and grades in private records. An awarded score does not verify an answer.

## Links

- Use wikilinks for local notes and figures, Markdown links for external sources.
  Qualify ambiguous targets with the course path, such as
  `[[fa26-cs577/lectures/lecture-04|Dynamic programming]]`.
- Link related lectures, assignments, readings, and exams where the connection
  helps studying. Link to a heading or embed a section when reusing an explanation.
- Verify actual destinations, including headings and figures. Preserve useful
  external links until a verified local equivalent exists.

## Content-specific rules

- [[course-readme]] — course landing pages
- [[lecture]] — lectures and recordings
- [[assignment]] — assignments and code projects
- [[exam]] — exam collections and review material
- [[conversion]] — conversion tools and source review
