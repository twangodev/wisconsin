# Exams

Follow the [[README|general formatting standard]], including its shared question
and answer format. A single exam paper is a named file. Create an exam collection
folder when there are several related documents:

```text
exams/midterm-1/
├── index.md             # scope, logistics, and links
├── review.md            # topic explanations and worked examples
├── cheatsheet.md        # compact reference
├── exam.md              # actual course exam
├── practice/            # material for rehearsing for the exam
│   ├── index.md
│   ├── sample-1.md       # instructor sample paper
│   ├── practice-exam-1.md # generated practice paper
│   └── shortest-paths.md
└── assets/              # figures and printable references
```

- Keep semester/version labels for archived exams. Name actual course exams,
  instructor samples, and generated practice distinctly.
- `practice/` groups instructor samples, generated practice exams, and exercise
  sets. Actual course exams stay outside it, alongside review material.
- `index.md` links the papers and supporting material. Put question papers on
  their own pages.
- `review.md` explains topics and links relevant lectures and homework.
  `cheatsheet.md` is the compact reference; identify it as an allowed exam aid
  only when the instructor permits it. Preserve and link printable renderings.
- Generated papers carry a brief study-practice label. Distinguish suggested
  timing and points from instructor-specified exam conditions.
- Preserve meaningful source ambiguities, accepted grading alternatives, and key
  corrections beside the affected answer. Explain when an accepted alternative
  differs from the correct result.
- Keep reference sheets and question diagrams accessible. Use a faithful clean
  rendering of a solution-marked diagram only when reconstruction is reliable.
- After consolidating questions and keys, check question/part counts, answer
  attribution, figures, and incoming links before removing superseded pages.
