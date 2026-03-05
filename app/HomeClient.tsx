"use client";

import Link from "next/link";
import { ResponsiveTabs } from "./components/ResponsiveTabs";

export function HomeClient({ appName }: { appName: string }) {
  const tabs = [
    {
      id: "welcome",
      label: "Welcome",
      content: (
        <div className="rainbow-border card text-center hero-card-welcome">
          <h1 className="rainbow-text" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            Make New Connections
          </h1>
          <p className="mb-4" style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
            {appName} is the premier speed meeting experience. 
            Connect authentically in a safe, inclusive, and vibrant environment.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/auth/signin" className="btn btn-rainbow" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
              Get Started
            </Link>
          </div>
        </div>
      )
    },
    {
      id: "features",
      label: "Features",
      content: (
        <div className="card rainbow-border text-center hero-card-features">
          <h2 style={{ marginBottom: '2rem' }}>Why {appName}?</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ color: 'var(--color-honey-dark)', marginBottom: '0.5rem' }}>Authentic Connections</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Meet real people in your area looking for exactly what you're looking for.</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--color-lavender-dark)', marginBottom: '0.5rem' }}>Inclusive Space</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>We celebrate all identities and orientations with open arms.</p>
            </div>
            <div>
              <h3 style={{ color: '#FF6B6B', marginBottom: '0.5rem' }}>Private & Secure</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Your contact info is only shared with mutual matches.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return <ResponsiveTabs layoutClassName="responsive-hero" tabs={tabs} />;
}

