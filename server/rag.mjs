import { readFile } from "node:fs/promises";

const resumePath = new URL("../public/Dev_Choudhary_Resume.tex", import.meta.url);
const stopWords = new Set([
  "about", "and", "are", "can", "did", "does", "for", "from", "have", "how",
  "into", "is", "me", "my", "of", "the", "this", "tell", "that", "was", "were",
  "what", "when", "where", "which", "who", "with", "work", "your", "person",
]);

function cleanLatex(value) {
  return value
    .replace(/\\href\{([^{}]*)\}\{([^{}]*)\}/g, "$2 ($1)")
    .replace(/\\(?:textbf|textit|texttt|emph)\{([^{}]*)\}/g, "$1")
    .replace(/\\begin\{itemize\}|\\end\{itemize\}/g, "")
    .replace(/\\item\s*/g, "- ")
    .replace(/\\vspace\*?\{[^{}]*\}/g, "")
    .replace(/\\(?:LARGE|large|bfseries|hfill|small|normalsize|sffamily|rmfamily)\b/g, "")
    .replace(/\\&/g, "and")
    .replace(/\\%/g, "%")
    .replace(/\\#/g, "#")
    .replace(/\\_/g, "_")
    .replace(/\\\s*/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseResume(source) {
  const document = source
    .split("\\begin{document}")[1]
    ?.split("\\end{document}")[0] ?? source;
  const lines = document
    .split("\n")
    .map((line) => line.replace(/%.*/, "").trim())
    .filter(Boolean);
  const passages = [];
  let section = "Profile";
  let current = [];

  const flush = () => {
    const text = cleanLatex(current.join(" "));
    if (text.length > 24) passages.push({ section, text });
    current = [];
  };

  for (const line of lines) {
    const heading = line.match(/\\section\*?\{([^{}]+)\}/);
    if (heading) {
      flush();
      section = cleanLatex(heading[1]);
      continue;
    }
    if (/^\\(?:documentclass|usepackage|pagenumbering|setlength|setlist|linespread|definecolor|titleformat|titlespacing)/.test(line)) {
      continue;
    }
    current.push(line.replace(/\\\\/g, " "));
  }
  flush();

  const name = document.match(/\\bfseries\s+([^}]+)/)?.[1];
  const profile = passages.find((passage) => passage.section === "Profile");
  if (name && profile) {
      profile.text = `Name: ${cleanLatex(name)}. ${profile.text.replace(cleanLatex(name), "").trim()}`;
  }

  return passages.map((passage, index) => ({ ...passage, id: index }));
}

export async function loadResumePassages() {
  return parseResume(await readFile(resumePath, "utf8"));
}

function tokenize(text) {
  return text
    .toLowerCase()
    .match(/[a-z0-9+#.]+/g)
    ?.filter((token) => token.length > 1 && !stopWords.has(token)) ?? [];
}

export function retrievePassages(question, passages, limit = 4) {
  const queryTerms = [...new Set(tokenize(question))];
  if (queryTerms.length === 0) return [];

  const ranked = passages.map((passage) => {
    const terms = tokenize(`${passage.section} ${passage.text}`);
    const frequencies = new Map();
    for (const term of terms) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
    const score = queryTerms.reduce((total, term) => {
      const frequency = frequencies.get(term) ?? 0;
      return total + (frequency > 0 ? 1 + Math.log1p(frequency) : 0);
    }, 0);
    return { ...passage, score, matchedTerms: queryTerms.filter((term) => frequencies.has(term)).length };
  });

  return ranked
    .filter((passage) => passage.matchedTerms > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}