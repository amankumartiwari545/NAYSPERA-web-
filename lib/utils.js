export const CATEGORIES = [
  "AI Generate",
  "3D",
  "Environment",
  "Nature",
  "Abstract",
  "Art",
  "Character",
  "Architecture",
  "Space",
  "Sci-Fi",
  "Photography",
  "Motion",
];

export const GENERATION_CATEGORIES = [
  "Concept Art",
  "3D Scene",
  "Character Design",
  "Environment",
  "Product Visual",
  "Abstract Art",
];

export const GENERATION_STYLES = [
  "Cinematic",
  "Photorealistic",
  "Concept Art",
  "Stylised 3D",
  "Surreal",
  "Minimal",
  "Isometric",
  "Analog Film",
];

export const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "liked", label: "Most liked" },
  { value: "discussed", label: "Most discussed" },
];

export function timeAgo(value) {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCount(value) {
  const count = Number(value) || 0;
  if (count < 1000) return String(count);
  if (count < 1000000) {
    const short = count / 1000;
    return `${short >= 10 ? Math.round(short) : short.toFixed(1).replace(/\.0$/, "")}K`;
  }
  const short = count / 1000000;
  return `${short.toFixed(1).replace(/\.0$/, "")}M`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function normalizeTag(tag = "") {
  return tag.trim().replace(/^#/, "").replace(/\s+/g, " ");
}

export function parseTags(input = "") {
  return Array.from(
    new Set(
      input
        .split(/[,\n]/)
        .map(normalizeTag)
        .filter(Boolean)
    )
  ).slice(0, 6);
}

export function slugifyUsername(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 24);
}

export function cn(...values) {
  return values.filter(Boolean).join(" ");
}
