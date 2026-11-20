"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Image as ImageIcon,
  Info,
  Layers,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useApp } from "@/app/providers";
import { GENERATION_CATEGORIES, GENERATION_STYLES } from "@/lib/utils";

const PROMPT_IDEAS = [
  "A bioluminescent library carved into a glacier, warm reading lamps inside",
  "Rooftop garden city at dusk, terracotta towers, soft haze, cinematic",
  "Portrait of a desert courier, hand-painted textures, amber rim light",
  "Abandoned space station overgrown with moss, volumetric light",
];

export default function StudioPage() {
  const { toast } = useApp();
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState(GENERATION_CATEGORIES[0]);
  const [style, setStyle] = useState(GENERATION_STYLES[0]);
  const [status, setStatus] = useState("idle");
  const [concept, setConcept] = useState(null);
  const [message, setMessage] = useState("");

  const generate = async (event) => {
    event.preventDefault();
    if (prompt.trim().length < 8) {
      setStatus("error");
      setMessage("Describe your idea in at least 8 characters.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category, style }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.concept) {
        setConcept(data.concept);
        setStatus("ready");
        return;
      }
      if (response.status === 503) {
        setStatus("not_configured");
        setMessage(
          data.message ||
            "AI generation is not connected. Add OPENAI_API_KEY to .env.local."
        );
        return;
      }
      setStatus("error");
      setMessage(data.message || "The generation request failed. Try again.");
    } catch {
      setStatus("error");
      setMessage("Could not reach the generation service. Check your connection.");
    }
  };

  const copyBrief = async () => {
    if (!concept) return;
    const text = `${concept.title}\n\n${concept.description}\n\nTags: ${concept.tags.join(", ")}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Creative brief copied.", "success");
    } catch {
      toast("Your browser blocked clipboard access.", "error");
    }
  };

  const generating = status === "loading";

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">AI Studio</h1>
          <p className="page-sub">
            Turn an idea into a production-ready creative brief before you render.
          </p>
        </div>
        <div className="page-head__actions">
          <span className="tag tag--neutral">
            <span className="activity-dot" /> Workspace
          </span>
        </div>
      </header>

      <div className="studio-grid">
        <form className="studio-panel" onSubmit={generate}>
          <h2 className="studio-panel__title">
            <Wand2 size={15} /> Generation brief
          </h2>

          <label className="field">
            <span className="field__label">Prompt</span>
            <textarea
              className="textarea"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the scene, mood, lighting and materials you want…"
              maxLength={600}
              rows={5}
            />
            <span className="field__hint">{prompt.length}/600 characters</span>
          </label>

          <div className="field" style={{ marginTop: 12 }}>
            <span className="field__label">Prompt inspiration</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PROMPT_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  className="chip"
                  style={{ height: 28, fontSize: 11 }}
                  onClick={() => setPrompt(idea)}
                >
                  {idea.split(",")[0]}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field__label">Generation category</span>
            <select
              className="select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {GENERATION_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span className="field__label">Style</span>
            <div className="style-grid">
              {GENERATION_STYLES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`style-option ${style === item ? "is-active" : ""}`}
                  onClick={() => setStyle(item)}
                  aria-pressed={style === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            style={{ marginTop: 18 }}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Generate concept
              </>
            )}
          </button>

          <div
            className={`studio-status ${
              status === "not_configured" ? "studio-status--warn" : ""
            } ${status === "error" ? "studio-status--error" : ""}`}
          >
            {status === "not_configured" || status === "error" ? (
              <AlertTriangle size={14} />
            ) : (
              <Info size={14} />
            )}
            <span>
              {status === "not_configured" || status === "error"
                ? message
                : "Generation uses your configured OpenAI-compatible key on the server. Without a key the studio reports that it is not connected instead of faking results."}
            </span>
          </div>
        </form>

        <section className="studio-panel preview-panel">
          <h2 className="studio-panel__title">
            <Layers size={15} /> Preview
          </h2>

          <div className="preview-stage" aria-live="polite">
            {generating ? (
              <div>
                <span className="preview-stage__icon">
                  <span className="spinner spinner--light" />
                </span>
                <h3>Composing your brief</h3>
                <p>Structuring mood, lighting and materials for {style.toLowerCase()} style.</p>
              </div>
            ) : concept ? (
              <div className="concept-result">
                <p className="eyebrow" style={{ marginBottom: 7 }}>
                  {category} · {style}
                </p>
                <h3 className="concept-result__title">{concept.title}</h3>
                <p className="concept-result__body">{concept.description}</p>
                <div className="concept-result__tags">
                  {concept.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ marginTop: 16 }}
                  onClick={copyBrief}
                >
                  <Copy size={13} /> Copy brief
                </button>
              </div>
            ) : status === "not_configured" ? (
              <div>
                <span className="preview-stage__icon">
                  <AlertTriangle size={20} />
                </span>
                <h3>Generation is not connected</h3>
                <p>
                  Add an OpenAI-compatible key to <code>.env.local</code>, restart the dev
                  server, and this panel will show the generated brief.
                </p>
              </div>
            ) : (
              <div>
                <span className="preview-stage__icon">
                  <ImageIcon size={20} />
                </span>
                <h3>Your concept appears here</h3>
                <p>
                  Write a prompt, pick a category and a style, then generate. Studio turns
                  ideas into a structured brief you can publish or hand to a renderer.
                </p>
              </div>
            )}
          </div>

          <div className="studio-hint">
            <div className="studio-hint__row">
              <Check size={13} />
              <span>Briefs are written by the model, never pre-filled placeholders.</span>
            </div>
            <div className="studio-hint__row">
              <Check size={13} />
              <span>
                Image rendering is a separate model. Studio focuses on direction and
                consistency.
              </span>
            </div>
          </div>

          <p className="panel__note" style={{ marginTop: 14 }}>
            Ready to publish? Use the New creation button in the sidebar to share the
            finished piece.
          </p>
        </section>
      </div>
    </>
  );
}
