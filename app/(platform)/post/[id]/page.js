"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { useApp } from "@/app/providers";
import { decoratePost, findPost } from "@/lib/selectors";
import PostCard from "@/components/feed/PostCard";
import ImageViewer from "@/components/ui/ImageViewer";
import FeedSkeleton from "@/components/feed/FeedSkeleton";

export default function PostPage() {
  const params = useParams();
  const { database, viewerId, ready } = useApp();
  const [viewerPost, setViewerPost] = useState(null);
  const postId = params?.id;

  const post = useMemo(() => {
    if (!database) return null;
    const raw = findPost(database, postId);
    return raw ? decoratePost(database, raw, viewerId) : null;
  }, [database, postId, viewerId]);

  const more = useMemo(() => {
    if (!database || !post) return [];
    return database.posts
      .filter((item) => item.user_id === post.user_id && item.id !== post.id)
      .slice(0, 2)
      .map((item) => decoratePost(database, item, viewerId));
  }, [database, post, viewerId]);

  return (
    <>
      <Link
        href="/explore"
        className="btn btn--quiet btn--sm"
        style={{ paddingLeft: 0, marginBottom: 10 }}
      >
        <ArrowLeft size={15} /> Back to explore
      </Link>

      {!ready ? <FeedSkeleton count={1} /> : null}

      {ready && !post ? (
        <div className="empty">
          <span className="empty__icon">
            <ImageOff size={19} />
          </span>
          <h3>This creation is no longer available</h3>
          <p>It may have been deleted by its creator, or the link is incorrect.</p>
          <Link href="/explore" className="btn btn--primary btn--sm">
            Explore creations
          </Link>
        </div>
      ) : null}

      {post ? (
        <>
          <PostCard post={post} onOpenImage={setViewerPost} />
          {more.length > 0 ? (
            <>
              <div className="section-head">
                <h2>More from @{post.author?.username}</h2>
                <Link href={`/profile/${post.author?.username}`}>View profile</Link>
              </div>
              {more.map((item) => (
                <PostCard key={item.id} post={item} onOpenImage={setViewerPost} />
              ))}
            </>
          ) : null}
        </>
      ) : null}

      <ImageViewer post={viewerPost} onClose={() => setViewerPost(null)} />
    </>
  );
}
