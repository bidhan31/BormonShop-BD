"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, refetchUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [mobileNumber, setMobileNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      await api.put("/users/profile", { name, mobileNumber });
      await refetchUser();
      setMessage("Profile updated successfully");
    } catch (err: any) {
      setMessage(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Profile</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-ink mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1.5">Email</label>
          <input
            value={user?.email || ""}
            disabled
            className="w-full bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-muted"
          />
        </div>

        <div>
          <label htmlFor="mobileNumber" className="block text-sm text-ink mb-1.5">
            Mobile Number
          </label>
          <input
            id="mobileNumber"
            placeholder="01XXXXXXXXX"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
          />
        </div>

        {message && <p className="text-sm text-accent">{message}</p>}

        <button type="submit" disabled={isSaving} className="btn-gold disabled:opacity-50">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
