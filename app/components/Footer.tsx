import Link from "next/link";

export function Footer() {
  return (
    <footer style={{
      marginTop: "auto",
      padding: "2rem 1rem",
      borderTop: "1px solid var(--color-border)",
      backgroundColor: "var(--color-surface)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem"
    }}>
      <div className="flex flex-wrap justify-center gap-4" style={{ fontSize: "0.9rem" }}>
        <Link href="/terms" className="hover-rainbow" style={{ color: "var(--color-text-muted)" }}>
          Terms & Conditions
        </Link>
        <span style={{ color: "var(--color-border)" }}>|</span>
        <Link href="/privacy" className="hover-rainbow" style={{ color: "var(--color-text-muted)" }}>
          Privacy Policy
        </Link>
        <span style={{ color: "var(--color-border)" }}>|</span>
        <Link href="/support" className="hover-rainbow" style={{ color: "var(--color-text-muted)" }}>
          Support
        </Link>
      </div>
      
      <div>
        <a
          href={`https://ko-fi.com/${process.env.NEXT_PUBLIC_KO_FI_USERNAME || "hannahbee91"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span>☕</span> Donate on Ko-fi
        </a>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--color-border)" }}>
        &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}. All rights reserved.
      </div>
    </footer>
  );
}
