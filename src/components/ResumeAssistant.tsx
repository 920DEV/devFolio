import { useState, type FormEvent } from "react";
import { ArrowUp, LoaderCircle, Sparkles } from "lucide-react";

type Source = { section: string; excerpt: string };
type Message = { role: "visitor" | "assistant"; content: string; sources?: Source[] };

const suggestedQuestions = [
  "How did Dev improve system performance?",
  "Tell me about the biometric authentication work.",
  "What did Dev study?",
];

export function ResumeAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const ask = async (value: string) => {
    const prompt = value.trim();
    if (!prompt || isLoading) return;
    setMessages((current) => [...current, { role: "visitor", content: prompt }]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The assistant could not answer right now.");
      setMessages((current) => [...current, {
        role: "assistant",
        content: result.answer,
        sources: result.sources,
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        role: "assistant",
        content: error instanceof Error ? error.message : "The assistant could not answer right now.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  return (
    <section className="resume-assistant" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <span className="assistant-mark" aria-hidden="true"><Sparkles size={17} /></span>
        <div>
          <p>ASK MY AVATAR</p>
          <h2 id="assistant-title">Ask about my resume</h2>
        </div>
        <span className="assistant-status"><i /> Resume grounded</span>
      </div>

      <div className="assistant-messages" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 ? (
          <p className="assistant-welcome">Ask me about my experience, projects, skills, or education.</p>
        ) : messages.map((message, index) => (
          <article className={`assistant-message is-${message.role}`} key={`${message.role}-${index}`}>
            <p>{message.content}</p>
            {message.sources && message.sources.length > 0 && (
              <details className="assistant-sources">
                <summary>Resume sources ({message.sources.length})</summary>
                <ul>
                  {message.sources.map((source, sourceIndex) => (
                    <li key={`${source.section}-${sourceIndex}`}>
                      <strong>{source.section}</strong>
                      <span>{source.excerpt}{source.excerpt.length === 240 ? "..." : ""}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}
        {isLoading && (
          <p className="assistant-thinking"><LoaderCircle size={15} /> Looking through my resume...</p>
        )}
      </div>

      {messages.length === 0 && (
        <div className="assistant-suggestions" aria-label="Suggested questions">
          {suggestedQuestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => void ask(suggestion)} disabled={isLoading}>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form className="assistant-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="resume-question">Ask a question about Dev's resume</label>
        <input
          id="resume-question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about my experience..."
          maxLength={500}
          disabled={isLoading}
        />
        <button type="submit" aria-label="Send question" disabled={!question.trim() || isLoading}>
          {isLoading ? <LoaderCircle size={18} className="assistant-spinner" /> : <ArrowUp size={19} />}
        </button>
      </form>
    </section>
  );
}