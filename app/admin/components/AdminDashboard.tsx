"use client";

import { useState } from "react";
import { useModal } from "@/app/components/ModalProvider";

type Event = any;

export default function AdminDashboard({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [registrantsMap, setRegistrantsMap] = useState<Record<string, any[]>>({});
  
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventAddress, setNewEventAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const { showAlert, showConfirm } = useModal();

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const fetchRegistrants = async (eventId: string) => {
    const res = await fetch(`/api/admin/events/${eventId}/registrants`);
    if (res.ok) {
        const data = await res.json();
        setRegistrantsMap(prev => ({ ...prev, [eventId]: data }));
    }
  };

  const toggleExpand = (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
      if (!registrantsMap[eventId]) {
        fetchRegistrants(eventId);
      }
    }
  };

  const refreshEvents = async () => {
    const res = await fetch("/api/events");
    if (res.ok) {
      setEvents(await res.json());
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newEventTitle, date: new Date(newEventDate).toISOString(), address: newEventAddress || null })
      });
      if (res.ok) {
        setNewEventTitle("");
        setNewEventDate("");
        setNewEventAddress("");
        showAlert("Success", "Event created successfully");
        await refreshEvents();
      } else {
        showAlert("Error", "Failed to create event");
      }
    } catch {
      showAlert("Error", "Error creating event");
    }
    setCreating(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAdminName, email: newAdminEmail, password: newAdminPassword })
      });
      if (res.ok) {
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
        showAlert("Success", "Admin created successfully");
      } else {
        const data = await res.json();
        showAlert("Error", data.error || "Failed to create admin");
      }
    } catch {
      showAlert("Error", "Error creating admin");
    }
    setCreatingAdmin(false);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    showConfirm("Confirm Status Update", `Are you sure you want to mark this event as ${status}?`, async () => {
      try {
        const res = await fetch("/api/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status })
        });
        if (res.ok) {
          showAlert("Success", `Event marked as ${status}`);
          await refreshEvents();
        } else {
          showAlert("Error", "Failed to update status");
        }
      } catch {
        showAlert("Error", "Error updating status");
      }
    });
  };

  const handleNotify = (id: string, type: "INVITE" | "CANCEL" | "FORM") => {
    showConfirm("Send Emails", `Are you sure you want to send ${type} emails?`, async () => {
      try {
        const res = await fetch(`/api/events/${id}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type })
        });
        if (res.ok) {
          showAlert("Success", "Emails sent successfully!");
        } else {
          const err = await res.json();
          showAlert("Error", err.error || err.message || "Failed to send emails");
        }
      } catch {
        showAlert("Error", "Error sending emails");
      }
    });
  };

  const handleEmailResults = (id: string) => {
    showConfirm("Email Results", `Are you sure you want to email MATCH RESULTS for this event?`, async () => {
      try {
        const res = await fetch(`/api/matches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: id })
        });
        if (res.ok) {
          showAlert("Success", "Results emailed successfully!");
        } else {
          const err = await res.json();
          showAlert("Error", err.error || err.message || "Failed to email results");
        }
      } catch {
        showAlert("Error", "Error emailing results");
      }
    });
  };

  const handleRemoveRegistration = (registrationId: string) => {
    showConfirm("Remove Registration", "Remove this user from the event?", async () => {
      try {
        const res = await fetch(`/api/admin/registrations/${registrationId}`, { method: "DELETE" });
        if (res.ok) {
          showAlert("Success", "Registration removed");
          await refreshEvents();
        } else {
          showAlert("Error", "Failed to remove registration");
        }
      } catch {
        showAlert("Error", "Error removing registration");
      }
    });
  };

  const handleSuspendUser = (userId: string, currentStatus: boolean) => {
    showConfirm("Confirm Suspension", `Are you sure you want to ${currentStatus ? "UNSUSPEND" : "SUSPEND"} this user?`, async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/suspend`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: !currentStatus })
        });
        if (res.ok) {
          showAlert("Success", `User ${currentStatus ? "unsuspended" : "suspended"}`);
          await refreshEvents(); // Not perfect but refreshes state
        } else {
          showAlert("Error", "Failed to update user");
        }
      } catch {
        showAlert("Error", "Error updating user");
      }
    });
  };

  return (
    <div className="grid grid-cols-2" style={{ gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" }}>
      <div className="card">
        <h2>Schedule New Event</h2>
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input 
              required
              className="form-input" 
              type="text" 
              value={newEventTitle} 
              onChange={e => setNewEventTitle(e.target.value)} 
              placeholder="e.g. June Mixer" 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input 
              required
              className="form-input" 
              type="datetime-local" 
              value={newEventDate} 
              onChange={e => setNewEventDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
            <input 
              className="form-input" 
              type="text" 
              value={newEventAddress} 
              onChange={e => setNewEventAddress(e.target.value)} 
              placeholder="e.g. 123 Main St, Bend, OR 97701" 
            />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={creating}>
            {creating ? "Scheduling..." : "Create Event"}
          </button>
        </form>
        
        <hr style={{ margin: "2rem 0", border: 'none', borderTop: '1px solid var(--color-border)' }} />
        
        <h2>Add Administrator</h2>
        <form onSubmit={handleCreateAdmin}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              required
              className="form-input" 
              type="text" 
              value={newAdminName} 
              onChange={e => setNewAdminName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              required
              className="form-input" 
              type="email" 
              value={newAdminEmail} 
              onChange={e => setNewAdminEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input 
              required
              className="form-input" 
              type="password" 
              value={newAdminPassword} 
              onChange={e => setNewAdminPassword(e.target.value)} 
            />
          </div>
          <button className="btn btn-secondary" style={{ width: "100%" }} disabled={creatingAdmin}>
            {creatingAdmin ? "Creating..." : "Create Admin Role"}
          </button>
        </form>
      </div>

      <div className="card rainbow-border">
        <h2>Manage Events</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {events.map((event) => {
            const isExpanded = expandedEventId === event.id;
            
            return (
              <div key={event.id} style={{ border: "1px solid var(--color-border)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                <div className="flex justify-between items-center" style={{ cursor: "pointer" }} onClick={() => toggleExpand(event.id)}>
                  <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {event.title}
                      <span style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        backgroundColor: event.status === 'UPCOMING' ? 'var(--color-honey-light)' : (event.status === 'CLOSED' ? 'var(--color-lavender-dark)' : '#ffcccc')
                      }}>
                        {event.status}
                      </span>
                    </h3>
                    <p style={{ color: "var(--color-text-muted)", fontSize: '0.9rem' }}>
                      {new Date(event.date).toLocaleString()} • {event._count.registrations} Registrants • {event._count.matchResponses} Responses
                    </p>
                  </div>
                  <div>
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                    
                    {/* Status Controls */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {event.status !== "CANCELLED" && (
                        <button onClick={() => handleUpdateStatus(event.id, "CANCELLED")} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                          Mark Cancelled
                        </button>
                      )}
                      
                      {event.status === "UPCOMING" && (
                        <button onClick={() => handleUpdateStatus(event.id, "CLOSED")} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                          Mark Closed
                        </button>
                      )}
                    </div>

                    {/* Email Triggers */}
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Email Triggers</h4>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <button onClick={() => handleNotify(event.id, "INVITE")} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                        Send Invites
                      </button>
                      <button onClick={() => handleNotify(event.id, "CANCEL")} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                        Send Cancellation
                      </button>
                      <button onClick={() => handleNotify(event.id, "FORM")} className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                        Send Feedback Form
                      </button>
                      
                      {event.status === "CLOSED" && (
                        <button onClick={() => handleEmailResults(event.id)} className="btn btn-rainbow" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                          EMAIL MATCH RESULTS
                        </button>
                      )}
                    </div>

                    {/* Registrants List */}
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Registrants Management</h4>
                    {registrantsMap[event.id] ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {registrantsMap[event.id].map(reg => (
                          <div key={reg.id} className="flex justify-between items-center" style={{ padding: '0.5rem', background: 'var(--color-surface-hover)', borderRadius: '4px' }}>
                            <div>
                                <span style={{ fontWeight: 500 }}>{reg.user.name || reg.user.email}</span>
                                {reg.user.suspended && <span style={{ marginLeft: '0.5rem', color: 'var(--color-error)', fontSize: '0.8rem' }}>(Suspended)</span>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRemoveRegistration(reg.id)} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Remove Registration</button>
                                <button onClick={() => handleSuspendUser(reg.user.id, reg.user.suspended)} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>{reg.user.suspended ? 'Unsuspend User' : 'Suspend User'}</button>
                            </div>
                          </div>
                        ))}
                        {registrantsMap[event.id].length === 0 && <p className="text-muted text-sm">No registrants yet.</p>}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: "var(--color-text-muted)", marginBottom: '1rem' }}>Loading registrants...</p>
                    )}
                    
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
