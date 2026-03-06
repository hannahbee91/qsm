"use client";

import { useState } from "react";
import { useModal } from "@/app/components/ModalProvider";
import Link from "next/link";
import { ResponsiveTabs } from "@/app/components/ResponsiveTabs";

type User = any;
type Event = any;

export default function RegistrantDashboard({ initialUser, initialEvents, pendingFeedback }: { initialUser: User, initialEvents: Event[], pendingFeedback: any[] }) {
  const [user, setUser] = useState<User>(initialUser);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  
  const [saving, setSaving] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);
  const [notifyNewEvents, setNotifyNewEvents] = useState<boolean>(initialUser.notifyNewEvents ?? true);
  const { showAlert } = useModal();

  const [formData, setFormData] = useState({
    name: user.name || "",
    age: user.age || "",
    pronouns: user.pronouns || "",
    contactEmail: user.contactEmail || "",
    phoneNumber: user.phoneNumber || "",
    instagram: user.instagram || "",
    discord: user.discord || "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        showAlert("Success", "Profile updated successfully!");
      } else {
        showAlert("Error", "Failed to update profile.");
      }
    } catch {
      showAlert("Error", "Error updating profile.");
    }
    setSaving(false);
  };

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        showAlert("Success", "Registered successfully!");
        // Refresh events list to show registered status
        const evRes = await fetch("/api/events");
        if (evRes.ok) {
          const evs = await evRes.json();
          setEvents(evs);
        }
      } else {
        const err = await res.json();
        showAlert("Error", err.error || "Failed to register.");
      }
    } catch {
      showAlert("Error", "Error registering for event.");
    }
    setRegistering(null);
  };

  const tabs = [
    {
      id: "profile",
      label: "My Profile",
      content: (
        <div className="card rainbow-border">
          <h2>My Profile</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="responsive-grid-half">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Pronouns</label>
                <input className="form-input" type="text" value={formData.pronouns} onChange={e => setFormData({...formData, pronouns: e.target.value})} placeholder="e.g. they/them" />
              </div>
            </div>

            <div className="mb-4">
              <Link href="/settings/password" className="btn btn-outline" style={{ display: 'inline-block', fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
                Change Password
              </Link>
            </div>
            
            <h3 className="mt-2" style={{ fontSize: '1.2rem' }}>Contact Info (For Matches)</h3>
            <p className="form-label mb-2">Provide the methods you prefer to be contacted at if you match with someone.</p>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram Handle</label>
              <input className="form-input" type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Discord Username</label>
              <input className="form-input" type="text" value={formData.discord} onChange={e => setFormData({...formData, discord: e.target.value})} />
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                <input 
                  type="checkbox" 
                  checked={notifyNewEvents} 
                  onChange={async (e) => {
                    const newVal = e.target.checked;
                    setNotifyNewEvents(newVal);
                    await fetch('/api/users/me', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ notifyNewEvents: newVal })
                    });
                  }}
                  style={{ width: '18px', height: '18px', accentColor: '#A66CFF' }}
                />
                Email me when new events are announced
              </label>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", marginTop: '1rem' }} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      )
    },
    {
      id: "events",
      label: "Events",
      content: (
        <div className="card">
          <h2>Upcoming Events</h2>
          {events.filter(e => e.status === "UPCOMING").length === 0 ? (
            <p className="text-muted">No upcoming events right now.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {events.filter(e => e.status === "UPCOMING").map(event => {
                const dateObj = new Date(event.date);
                const isRegistered = event.registrations && event.registrations.some((r: any) => r.userId === user.id);
                
                return (
                  <div key={event.id} style={{ border: "1px solid var(--color-border)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                    <h3 style={{ margin: 0 }}>{event.title}</h3>
                    <p style={{ color: "var(--color-text-muted)" }}>{dateObj.toLocaleString()}</p>
                    <div className="mt-1">
                      {isRegistered ? (
                        <span style={{ color: "var(--color-success)", fontWeight: 500 }}>✓ Registered</span>
                      ) : (
                        <button 
                          onClick={() => handleRegister(event.id)} 
                          className="btn btn-primary" 
                          style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}
                          disabled={registering === event.id}
                        >
                          {registering === event.id ? "Registering..." : "Register Now"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Feedback Section */}
          {pendingFeedback.length > 0 && (
            <div className="mt-4" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem" }}>
              <h2>Event Feedback</h2>
              <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>Submit feedback for events you attended to find your matches!</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {pendingFeedback.map(event => (
                  <div key={event.id} className="responsive-flex-stack" style={{ border: "1px solid var(--color-border)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{event.title}</h3>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{new Date(event.date).toLocaleString()}</p>
                    </div>
                    <div>
                      {event.hasResponded ? (
                        <Link href={`/event/${event.id}/feedback`} className="btn btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                          ✓ Edit Feedback
                        </Link>
                      ) : (
                        <Link href={`/event/${event.id}/feedback`} className="btn btn-rainbow" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                          Submit Feedback
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <ResponsiveTabs layoutClassName="responsive-grid-half" tabs={tabs} />
  );
}
