# Lectures

One file per lecture in `lectures/`, named `lecture-NN.md` (zero-padded unless
the course already does otherwise).

## File shape

```markdown
---
date: YYYY-MM-DD
---

# Lecture NN: Topic

(notes)
```

- H1 is `Lecture NN: <topic>`; section headings nested below.
- Figures in a per-directory `assets/`, embedded with `![[...]]`.
- Code fences tagged; math in LaTeX. Escape literal currency dollars (`\$5`, `\$0.08`); unescaped `$...$` is inline math.
- When a lecture has both a recording and slides, **synthesize them into one
  note**: the transcript supplies the narrative and emphasis, the slides
  supply structure and figures. Never file transcript and slide-notes as two
  parallel artifacts — and never file a wall of raw transcript text.

## Editorial quality

- Explain the concepts and their relationships in a coherent sequence. Retain
  important assumptions, domain restrictions, counterexamples, and worked steps.
- Include representative source exercises and their reasoning when they help
  teach the topic. A list of definitions alone is not a substitute for the
  lecture's examples or proof arguments.
- Consolidate repeated slide reveals and logistical chatter. Do not pad a short
  lecture to meet a word count, or invent dates or missing recording content.
- Keep source attribution brief. Put extraction history in private reports and
  place any specific unresolved ambiguity beside the affected material.

## Linking

- Link forward/back: `[[lecture-03]] ← → [[lecture-05]]` where continuity matters.
- Link concepts to where they're used: homework, exams, projects.
- Add the lecture to the course README index.
