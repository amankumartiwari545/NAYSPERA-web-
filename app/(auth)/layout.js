import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <div
          className="auth-visual__art"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80)",
          }}
          aria-hidden="true"
        />
        <div className="auth-visual__top">
          <Link href="/explore" className="brand__name" style={{ fontSize: 22 }}>
            <em>NAYSPERA</em> AI
          </Link>
          <p className="brand__tagline">AI Powered Creator System</p>
        </div>

        <div className="auth-visual__content">
          <span className="auth-kicker">Creator community</span>
          <h1>
            Where AI creators share <em>what they imagine.</em>
          </h1>
          <p>
            Publish cinematic concepts, 3D scenes and character studies. Follow the
            creators whose worlds you want to live inside, and keep your best references
            in one quiet place.
          </p>
          <div className="auth-stats">
            <div className="auth-stat">
              <strong>12K+</strong>
              <span>Creations</span>
            </div>
            <div className="auth-stat">
              <strong>840</strong>
              <span>Creators</span>
            </div>
            <div className="auth-stat">
              <strong>24</strong>
              <span>Categories</span>
            </div>
          </div>
        </div>

        <p className="auth-visual__foot">© 2026 NAYSPERA AI · Built for creators</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
