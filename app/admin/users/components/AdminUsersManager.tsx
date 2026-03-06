"use client";

import { useState } from "react";
import { useModal } from "@/app/components/ModalProvider";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  age: number | null;
  pronouns: string | null;
  role: string;
  suspended: boolean;
  contactEmail: string | null;
  phoneNumber: string | null;
  instagram: string | null;
  discord: string | null;
  _count: { registrations: number };
};

export default function AdminUsersManager({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "suspended">("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const { showAlert, showConfirm } = useModal();

  const refreshUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const handleSuspendUser = (userId: string, currentStatus: boolean) => {
    showConfirm("Confirm", `Are you sure you want to ${currentStatus ? "unsuspend" : "suspend"} this user?`, async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/suspend`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: !currentStatus }),
        });
        if (res.ok) {
          showAlert("Success", `User ${currentStatus ? "unsuspended" : "suspended"}`);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended: !currentStatus } : u));
        } else {
          showAlert("Error", "Failed to update user");
        }
      } catch {
        showAlert("Error", "Error updating user");
      }
    });
  };

  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "REGISTRANT" : "ADMIN";
    showConfirm("Confirm", `Are you sure you want to make this user an ${newRole}?`, async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
          showAlert("Success", "User role updated");
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
          const data = await res.json();
          showAlert("Error", data.error || "Failed to update user role");
        }
      } catch {
        showAlert("Error", "Error updating user role");
      }
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !u.suspended) ||
      (filter === "suspended" && u.suspended);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Link href="/admin" className="btn btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card rainbow-border">
        <div className="flex justify-between items-center mb-4 flex-wrap" style={{ gap: "1rem" }}>
          <h2 style={{ margin: 0 }}>All Registrants ({filteredUsers.length})</h2>
          <div className="flex gap-2" style={{ gap: "0.75rem" }}>
            <input
              className="form-input"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: "150px", maxWidth: "250px", width: "100%", padding: "0.4rem 0.75rem", fontSize: "0.9rem" }}
            />
            <select
              className="form-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.9rem" }}
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-muted">No users found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filteredUsers.map((user) => {
              const isExpanded = expandedUserId === user.id;
              return (
                <div
                  key={user.id}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="flex justify-between items-center"
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      background: user.suspended ? "rgba(255,100,100,0.05)" : "transparent",
                    }}
                    onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                  >
                    <div className="flex items-center" style={{ gap: "0.75rem" }}>
                      <span style={{ fontWeight: 500 }}>
                        {user.name || "Unnamed"}
                      </span>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                        {user.email}
                      </span>
                      {user.suspended && (
                        <span style={{
                          fontSize: "0.75rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          backgroundColor: "rgba(255,100,100,0.15)",
                          color: "var(--color-error)",
                          fontWeight: 600,
                        }}>
                          SUSPENDED
                        </span>
                      )}
                      {user.role === "ADMIN" && (
                        <span style={{
                          fontSize: "0.75rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          backgroundColor: "rgba(100,200,255,0.15)",
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center" style={{ gap: "1rem" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                        {user._count.registrations} event{user._count.registrations !== 1 ? "s" : ""}
                      </span>
                      <span>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: "1rem",
                      borderTop: "1px solid var(--color-border)",
                      background: "var(--color-surface-hover)",
                    }}>
                      <div className="responsive-grid-half" style={{ gap: "0.75rem", marginBottom: "1rem" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Age</span>
                          <p style={{ margin: 0, fontWeight: 500 }}>{user.age ?? "—"}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Pronouns</span>
                          <p style={{ margin: 0, fontWeight: 500 }}>{user.pronouns || "—"}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Contact Email</span>
                          <p style={{ margin: 0, fontWeight: 500 }}>{user.contactEmail || "—"}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Phone</span>
                          <p style={{ margin: 0, fontWeight: 500 }}>{user.phoneNumber || "—"}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Instagram</span>
                          <p style={{ margin: 0, fontWeight: 500 }}>{user.instagram || "—"}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Discord</span>
                          <p style={{ margin: 0, fontWeight: 500 }}>{user.discord || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSuspendUser(user.id, user.suspended)}
                          className="btn btn-outline"
                          style={{
                            padding: "0.3rem 0.75rem",
                            fontSize: "0.85rem",
                            color: user.suspended ? "var(--color-success)" : "var(--color-error)",
                            borderColor: user.suspended ? "var(--color-success)" : "var(--color-error)",
                          }}
                        >
                          {user.suspended ? "Unsuspend User" : "Suspend User"}
                        </button>
                        <button
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className="btn btn-outline"
                          style={{
                            padding: "0.3rem 0.75rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          Make {user.role === "ADMIN" ? "Registrant" : "Admin"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
