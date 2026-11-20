"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function ImageViewer({ post, onClose }) {
  useEffect(() => {
    if (!post) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [post, onClose]);

  if (!post || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${post.title} — full image`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="viewer__bar">
        <div>
          <p className="viewer__title">{post.title}</p>
          <p className="viewer__sub">
            {post.author?.full_name}
            {post.author?.username ? ` · @${post.author.username}` : ""}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close image">
          <X size={19} />
        </button>
      </div>
      <div className="viewer__stage">
        <img src={post.image_url} alt={post.title} />
      </div>
    </div>,
    document.body
  );
}
