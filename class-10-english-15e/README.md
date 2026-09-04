# English Hub — Class 10 English 15-E Interactive

Account-free interactive exam-preparation application for Class 10 First Language English (15-E), intended for English Hub and school students.

## Phase 1 — complete
- Mobile-first dashboard and course navigation
- First Flight prose and poetry navigation
- Footprints Without Feet navigation
- Grammar & Vocabulary, Analogy, Comprehension and Composition navigation
- Mark-wise practice: 1M, 2M, 3M, 4M and 5M
- Chapter-wise practice
- 47-question mock-test engine with the 20/10/10/5/2 mark-count architecture
- 3 hour 15 minute mock timer
- Question navigation and progress bar
- Instant MCQ feedback and explanations
- Result and question-review screen
- LocalStorage last-result memory
- No login, student account or database
- GitHub Pages-friendly static architecture

## Phase 2 — question bank started
`data/questions.json` now contains the first 47-question objective batch, deliberately distributed as:
- 20 × 1 mark
- 10 × 2 marks
- 10 × 3 marks
- 5 × 4 marks
- 2 × 5 marks

This first batch is an objective interactive bank. It is not a substitute for the written-answer format of the board examination. Subsequent batches will add descriptive questions, model answers, Reference to Context, Quote from Memory, essay and letter-writing tasks, grammar transformations, competency/application questions and larger chapter-wise pools.

## Data architecture
- `data/syllabus.json` — syllabus/chapter metadata and blueprint-planning labels
- `data/questions.json` — question content and exam tags
- `assets/js/app.js` — reusable application/test engine
- `assets/css/style.css` — interface styles
- `index.html` — application shell

## Deployment
The application uses relative paths and can be published as a GitHub Pages project site or from a custom domain/subdomain. If it is placed under a subpath, keep the `data/` and `assets/` folders alongside `index.html`.
