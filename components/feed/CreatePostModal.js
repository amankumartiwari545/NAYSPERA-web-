"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Lock, X } from "lucide-react";
import { useApp } from "@/app/providers";
import { CATEGORIES, parseTags } from "@/lib/utils";
import { fileToDataUrl } from "@/lib/image";
import Modal from "@/components/ui/Modal";

const EMPTY = { title: "", description: "", category: "AI Generate", tags: "" };

export default function CreatePostModal({ open, onClose }) {
  const { session, createPost } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY);
      setImage(null);
      setError("");
      setBusy(false);
    }
  }, [open]);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const pickImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
    } catch (uploadError) {
      setError(uploadError.message || "That image could not be used.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setError("");
    if (form.title.trim().length < 3) {
      setError("Add a title with at least 3 characters.");
      return;
    }
    if (!image) {
      setError("Upload the artwork you want to publish.");
      return;
    }
    const tags = parseTags(form.tags);
    const id = createPost({
      title: form.title,
      description: form.description,
      category: form.category,
      tags: tags.length ? tags : [form.category],
      imageUrl: image,
    });
    if (id) onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="create-post-title">
      <div className="modal__head">
        <h2 className="modal__title" id="create-post-title">
          Publish a creation
        </h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={17} />
        </button>
      </div>

      {!session ? (
        <div className="modal__body">
          <div className="empty" style={{ padding: "38px 20px" }}>
            <span className="empty__icon">
              <Lock size={19} />
            </span>
            <h3>Sign in to publish</h3>
            <p>
              Publishing is tied to your creator profile. Sign in to share work with the
              community.
            </p>
            <Link href="/login?next=%2Fexplore" className="btn btn--primary btn--sm">
              Sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="modal__body">
            {image ? (
              <div className="upload-preview" style={{ marginBottom: 16 }}>
                <img src={image} alt="Selected artwork preview" />
                <button
                  type="button"
                  className="upload-preview__remove"
                  onClick={() => setImage(null)}
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="upload-zone"
                onClick={() => fileRef.current?.click()}
                style={{ marginBottom: 16, width: "100%" }}
              >
                <ImagePlus size={22} />
                <span>{busy ? "Preparing image…" : "Upload artwork"}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  JPG, PNG or WebP · resized locally
                </span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pickImage}
              className="sr-only"
              tabIndex={-1}
            />

            <label className="field">
              <span className="field__label">Title</span>
              <input
                className="input"
                value={form.title}
                onChange={update("title")}
                placeholder="Futuristic City - AI Concept"
                maxLength={90}
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Description</span>
              <textarea
                className="textarea"
                value={form.description}
                onChange={update("description")}
                placeholder="What is happening in this piece? Which tools or prompts did you use?"
                maxLength={400}
                style={{ minHeight: 88 }}
              />
            </label>

            <div className="form-grid">
              <label className="field">
                <span className="field__label">Category</span>
                <select className="select" value={form.category} onChange={update("category")}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Tags</span>
                <input
                  className="input"
                  value={form.tags}
                  onChange={update("tags")}
                  placeholder="AI Generate, Environment"
                />
                <span className="field__hint">Comma separated, up to 6.</span>
              </label>
            </div>

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="modal__foot">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? "Preparing…" : "Publish creation"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
