"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Eye,
  Heart,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Trash2,
} from "lucide-react";
import { useApp } from "@/app/providers";
import { formatCount, timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onOpenImage }) {
  const { viewerId, profile, toggleLike, toggleRepost, toggleBookmark, toggleFollow, deletePost, toast } =
    useApp();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handle = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  const author = post.author;
  const isOwn = viewerId && author?.id === viewerId;

  const copyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard.", "success");
    } catch {
      toast("Your browser blocked clipboard access.", "error");
    }
    setMenuOpen(false);
  };

  return (
    <article className="post-card">
      <header className="post-card__head">
        <Link
          href={author ? `/profile/${author.username}` : "/explore"}
          className="author-link"
        >
          <Avatar src={author?.avatar_url} name={author?.full_name || "Creator"} size="md" />
          <span className="author-link__meta">
            <span className="author-name">{author?.full_name || "Anonymous creator"}</span>
            <span className="author-handle">
              <span>@{author?.username || "nayspera"}</span>
              <span>{timeAgo(post.created_at)}</span>
            </span>
          </span>
        </Link>

        <div className="post-card__tools">
          {author && !isOwn ? (
            <button
              type="button"
              className={`follow-chip ${post.isFollowingAuthor ? "is-following" : ""}`}
              onClick={() => {
                const following = toggleFollow(author.id);
                if (following) toast(`Following ${author.full_name}.`, "success");
              }}
            >
              {post.isFollowingAuthor ? "Following" : "Follow"}
            </button>
          ) : null}
          <div ref={menuRef}>
            <button
              type="button"
              className="icon-btn"
              aria-label="Post options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen ? (
              <div className="post-menu" role="menu">
                <Link href={`/post/${post.id}`} className="post-menu__item" role="menuitem">
                  <Eye size={14} /> Open post
                </Link>
                <button
                  type="button"
                  className="post-menu__item"
                  role="menuitem"
                  onClick={copyLink}
                >
                  <Link2 size={14} /> Copy link
                </button>
                <button
                  type="button"
                  className="post-menu__item"
                  role="menuitem"
                  onClick={() => {
                    toggleBookmark(post.id);
                    setMenuOpen(false);
                  }}
                >
                  <Bookmark size={14} /> {post.bookmarked ? "Remove from saved" : "Save creation"}
                </button>
                {isOwn ? (
                  <button
                    type="button"
                    className="post-menu__item is-danger"
                    role="menuitem"
                    onClick={() => {
                      if (window.confirm("Delete this creation permanently?")) {
                        deletePost(post.id);
                      }
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 size={14} /> Delete post
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div>
        <Link href={`/post/${post.id}`} className="post-card__title">
          {post.title}
        </Link>
        {post.description ? <p className="post-card__desc">{post.description}</p> : null}
        <div className="post-card__tags">
          {(post.tags || []).map((tag) => (
            <Link
              key={tag}
              href={`/explore?q=${encodeURIComponent(tag)}`}
              className="tag"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="post-card__media"
        onClick={() => onOpenImage?.(post)}
        aria-label={`Open ${post.title} full size`}
      >
        <img src={post.image_url} alt={post.title} loading="lazy" />
      </button>

      <div className="post-card__actions">
        <button
          type="button"
          className={`action-btn ${post.liked ? "is-active" : ""}`}
          onClick={() => toggleLike(post.id)}
          aria-pressed={post.liked}
          aria-label={post.liked ? "Unlike" : "Like"}
        >
          <Heart size={16} strokeWidth={1.9} />
          <span>{formatCount(post.likeCount)}</span>
        </button>

        <button
          type="button"
          className="action-btn"
          onClick={() => setCommentsOpen((open) => !open)}
          aria-expanded={commentsOpen}
          aria-label="Comments"
        >
          <MessageCircle size={16} strokeWidth={1.9} />
          <span>{formatCount(post.commentCount)}</span>
        </button>

        <button
          type="button"
          className={`action-btn ${post.reposted ? "is-active" : ""}`}
          onClick={() => toggleRepost(post.id)}
          aria-pressed={post.reposted}
          aria-label={post.reposted ? "Undo repost" : "Repost"}
        >
          <Repeat2 size={16} strokeWidth={1.9} />
          <span>{formatCount(post.repostCount)}</span>
        </button>

        <button
          type="button"
          className={`action-btn action-btn--save ${post.bookmarked ? "is-active" : ""}`}
          onClick={() => toggleBookmark(post.id)}
          aria-pressed={post.bookmarked}
          aria-label={post.bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark size={16} strokeWidth={1.9} />
        </button>
      </div>

      {commentsOpen ? <CommentSection postId={post.id} /> : null}
    </article>
  );
}
