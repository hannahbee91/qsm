import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount === 0) {
    redirect("/setup");
  }

  const session = await auth();

  // If already logged in, redirect to the appropriate dashboard
  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/registrant");
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', alignItems: 'stretch', marginTop: '4rem', minHeight: '60vh' }}>
      
      {/* Left Card: Call to Action */}
      <div className="rainbow-border card text-center" style={{ flex: '1 1 400px', maxWidth: '600px', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 className="rainbow-text" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Find Your Person
        </h1>
        <p className="mb-4" style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
          Queer Speed Meet is the premier speed dating experience. 
          Connect authentically in a safe, inclusive, and vibrant environment.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Link href="/auth/signin" className="btn btn-rainbow" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            Get Started
          </Link>
        </div>
      </div>
      
      {/* Right Card: Features */}
      <div className="card rainbow-border text-center" style={{ flex: '1 1 400px', maxWidth: '600px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>Why {process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}?</h2>
        
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

    </div>
  );
}
