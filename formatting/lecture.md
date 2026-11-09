# Lectures

Follow the [[README|general formatting standard]]. Use one file per lecture in
`lectures/`, named `lecture-NN.md` (keep the course's existing numbering).

## File shape

```markdown
---
date: YYYY-MM-DD
---

# Lecture NN: Topic

(notes)
```

- H1 is `Lecture NN: <topic>`; section headings nested below.
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

## Linking

- Link forward/back: `[[lecture-03]] ← → [[lecture-05]]` where continuity matters.
- Link concepts to where they're used: homework, exams, projects.
- Add the lecture to the lecture hub, or directly to the course README when
  there is no hub.
