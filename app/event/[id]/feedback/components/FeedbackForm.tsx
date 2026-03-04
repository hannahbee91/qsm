"use client";

import { useState } from "react";
import { useModal } from "@/app/components/ModalProvider";

type Participant = any;
type ResponseData = any;

export default function FeedbackForm({ 
  eventId, 
  participants, 
  existingResponses,
  userContact 
}: { 
  eventId: string, 
  participants: Participant[], 
  existingResponses: ResponseData[],
  userContact: { discord: string, instagram: string, phoneNumber: string, contactEmail: string }
}) {
  
  // Transform existing responses into a state map
  const initialMap: Record<string, { platonic: boolean, fwb: boolean, monogamous: boolean, nonmonogamous: boolean }> = {};
  
  participants.forEach(p => {
    const existing = existingResponses.find(r => r.targetUserId === p.id);
    initialMap[p.id] = {
      platonic: existing?.platonic || false,
      fwb: existing?.fwb || false,
      monogamous: existing?.monogamous || false,
      nonmonogamous: existing?.nonmonogamous || false,
    };
  });

  const [responses, setResponses] = useState(initialMap);
  const [contact, setContact] = useState(userContact);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useModal();

  const handleCheckbox = (userId: string, category: "platonic" | "fwb" | "monogamous" | "nonmonogamous") => {
    setResponses(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [category]: !prev[userId][category]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate contact info
    if (!contact.discord && !contact.instagram && !contact.phoneNumber && !contact.contactEmail) {
      showAlert("Contact Required", "At least one form of contact info must be provided (Instagram, Discord, Phone Number, or Email Adress).");
      return;
    }

    setSaving(true);
    try {
      // 1. Update contact info
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
      });

      // 2. Submit all match responses
      const submissions = Object.keys(responses).map(async targetUserId => {
        return fetch("/api/matches/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            targetUserId,
            ...responses[targetUserId]
          })
        });
      });

      await Promise.all(submissions);
      showAlert("Success", "Feedback saved successfully! We'll email you your matches once results are processed.");
      
    } catch (err) {
      showAlert("Error", "Error saving feedback");
    }
    setSaving(false);
  };

  if (participants.length === 0) {
    return <p className="text-center">No other participants found for this event.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-2" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Attendees</h3>
      
      <div className="grid grid-cols-1 mb-4" style={{ gap: '1rem' }}>
        {participants.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-hover)' }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {p.name || "Unknown"} <span style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>({p.pronouns || "Ask"})</span>
            </div>
            
            <div className="flex gap-4" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={responses[p.id].platonic} onChange={() => handleCheckbox(p.id, "platonic")} />
                Platonic Friendship
              </label>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={responses[p.id].fwb} onChange={() => handleCheckbox(p.id, "fwb")} />
                Friends With Benefits
              </label>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={responses[p.id].monogamous} onChange={() => handleCheckbox(p.id, "monogamous")} />
                Monogamous Dating
              </label>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={responses[p.id].nonmonogamous} onChange={() => handleCheckbox(p.id, "nonmonogamous")} />
                Nonmonogamous Dating
              </label>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 mt-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Contact Info Settings</h3>
      <p className="text-muted mb-2 text-sm">Please verify your contact methods. At least one is required.</p>
      
      <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <div className="form-group mb-1">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={contact.contactEmail} onChange={e => setContact({...contact, contactEmail: e.target.value})} />
        </div>
        <div className="form-group mb-1">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel" value={contact.phoneNumber} onChange={e => setContact({...contact, phoneNumber: e.target.value})} />
        </div>
        <div className="form-group ">
          <label className="form-label">Instagram Handle</label>
          <input className="form-input" type="text" value={contact.instagram} onChange={e => setContact({...contact, instagram: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Discord Username</label>
          <input className="form-input" type="text" value={contact.discord} onChange={e => setContact({...contact, discord: e.target.value})} />
        </div>
      </div>

      <div className="mt-4 text-center">
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 3rem', fontSize: '1.1rem' }} disabled={saving}>
          {saving ? "Saving Feedback..." : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}
