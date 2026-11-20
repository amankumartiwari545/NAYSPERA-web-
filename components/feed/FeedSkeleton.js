export default function FeedSkeleton({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div className="post-card" key={index} aria-hidden="true">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: "34%", height: 11 }} />
              <div className="skeleton" style={{ width: "22%", height: 9, marginTop: 7 }} />
            </div>
          </div>
          <div className="skeleton" style={{ width: "58%", height: 14, marginTop: 18 }} />
          <div className="skeleton" style={{ width: "78%", height: 10, marginTop: 9 }} />
          <div
            className="skeleton"
            style={{ width: "100%", aspectRatio: "16 / 9", marginTop: 16, borderRadius: 12 }}
          />
          <div className="skeleton" style={{ width: "50%", height: 12, margin: "16px 0" }} />
        </div>
      ))}
    </>
  );
}
