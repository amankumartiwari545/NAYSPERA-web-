import { initials } from "@/lib/utils";

export default function Avatar({ src, name, size = "md", ring = false, className = "" }) {
  return (
    <span
      className={`avatar avatar--${size} ${ring ? "avatar--ring" : ""} ${className}`.trim()}
    >
      {src ? (
        <img src={src} alt={name ? `${name}'s avatar` : "Creator avatar"} loading="lazy" />
      ) : (
        <span>{initials(name || "NAYSPERA")}</span>
      )}
    </span>
  );
}
