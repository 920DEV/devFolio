import assert from "node:assert/strict";
import test from "node:test";
import { loadResumePassages, parseResume, retrievePassages } from "./rag.mjs";

test("resume parser retains section names and useful factual passages", async () => {
  const passages = await loadResumePassages();
  assert.ok(passages.some(({ section }) => section === "EDUCATION"));
  assert.ok(passages.some(({ text }) => text.includes("FaceNet")));
  assert.ok(passages.some(({ text }) => text.includes("800ms")));
});

test("retrieval finds the relevant project and education passages", async () => {
  const passages = await loadResumePassages();
  const biometric = retrievePassages("How did Dev build facial biometric authentication?", passages);
  const education = retrievePassages("What did Dev study and what was his CGPA?", passages);

  assert.ok(biometric[0]?.text.includes("FaceNet"));
  assert.ok(education.some(({ text }) => text.includes("8.1")));
});

test("name questions retrieve the name from the resume header", async () => {
  const passages = await loadResumePassages();
  const result = retrievePassages("What is the name of this person?", passages);

  assert.match(result[0]?.text ?? "", /Name: DEV KUMAR CHOUDHARY/);
});

test("resume parser removes comments and formatting commands", () => {
  const passages = parseResume(String.raw`\\begin{document}
\\section*{EXPERIENCE}
\\textbf{Engineer}\\
Worked on \textit{Spring Boot} APIs. % Ignore this note
\\end{document}`);

  assert.equal(passages[0]?.section, "EXPERIENCE");
  assert.ok(passages[0]?.text.includes("Spring Boot"));
  assert.ok(!passages[0]?.text.includes("Ignore this note"));
});

test("retrieval returns no passages when the resume has no matching terms", async () => {
  const passages = await loadResumePassages();
  assert.deepEqual(retrievePassages("favorite pizza topping", passages), []);
});