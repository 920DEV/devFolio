# Dev's Portfolio

## Resume assistant

The avatar's assistant retrieves relevant passages from `public/Dev_Choudhary_Resume.tex` and gives those passages to a language model. Answers include the resume sections used as evidence. Questions with no matching resume evidence receive a fixed "not found" answer without calling a model.

Retrieval currently uses weighted keyword matching. This keeps the first version dependency-free and works well for direct resume questions; semantic embeddings can be added later if visitors often phrase questions without using resume terms.

### Deployment with Gemini

Create a Gemini API key, then configure these variables in your hosting provider's server environment (Render Environment or Hostinger Node.js app variables):

```text
GEMINI_API_KEY=your-server-side-key
GEMINI_MODEL=gemini-2.5-flash
```

The app reads the key only in the Node server. Never add it to frontend code, use a `VITE_` variable name for it, or commit a real key. `.env` is ignored by Git and is only a local-development convenience. For deployment, set secrets in the hosting dashboard. Build with `npm run build` and start with `npm start`. The Node server serves the built frontend and handles `/api/ask` on the same domain; it needs outbound HTTPS access to Google's Generative Language API. `PORT` is read from the hosting environment.

The assistant retrieves matching passages from `public/Dev_Choudhary_Resume.tex` and asks Gemini to phrase an answer using those excerpts as evidence. It does not train or fine-tune Gemini. When the résumé has no relevant passage, the server returns a fixed not-found response instead of asking the model to guess. Add verified information to the résumé knowledge source to cover more recruiter questions.

### Checks

Run `npm test` for the résumé parser and retrieval tests, and `npm run build` for the production build.