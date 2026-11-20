"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { useApp } from "@/app/providers";
import { postComments, findPost } from "@/lib/selectors";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

export default function CommentSection({ postId }) {
  const { database, viewerId, profile, addComment, deleteComment, ensureAuth } = useApp();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  if (!database) return null;

  const comments = postComments(database, postId);
  const post = findPost(database, postId);

  const submit = (event) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    if (!ensureAuth("Sign in to join the conversation.")) return;
    const ok = addComment(postId, text);
    if (ok) setValue("");
  };

  return (
    <div className="comments">
      <form className="comment-form" onSubmit={submit}>
        {profile ? (
          <Avatar src={profile.avatar_url} name={profile.full_name} size="xs" />
        ) : (
          <Avatar name="Guest" size="xs" />
        )}
        <input
          className="input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={viewerId ? "Add a thoughtful comment…" : "Sign in to comment…"}
          aria-label="Write a comment"
          maxLength={600}
        />
        {value.trim() || focused ? (
          <button
            type="submit"
            className="btn btn--primary btn--sm"
            disabled={!value.trim()}
            aria-label="Post comment"
          >
            <Send size={14} />
          </button>
        ) : null}
      </form>

      {comments.length === 0 ? (
        <p className="comments__empty">No comments yet. Start the conversation.</p>
      ) : (
        comments.map((comment) => {
          const canRemove =
            viewerId &&
            (comment.user_id === viewerId || post?.user_id === viewerId);
          return (
            <div className="comment" key={comment.id}>
              <Link href={comment.author ? `/profile/${comment.author.username}` : "/explore"}>
                <Avatar
                  src={comment.author?.avatar_url}
                  name={comment.author?.full_name || "Creator"}
                  size="xs"
                />
              </Link>
              <div className="comment__body">
                <div className="comment__head">
                  <Link
                    href={comment.author ? `/profile/${comment.author.username}` : "/explore"}
                    className="comment__name"
                  >
                    {comment.author?.full_name || "Former member"}
                  </Link>
                  <span className="comment__time">{timeAgo(comment.created_at)}</span>
                  {canRemove ? (
                    <button
                      type="button"
                      className="comment__remove"
                      onClick={() => deleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <p className="comment__text">{comment.content}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
