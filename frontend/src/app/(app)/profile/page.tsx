"use client";

import { useState, FormEvent } from "react";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Avatar } from "@/components/avatar";
import { Loader2, Save, MapPin, GraduationCap, Briefcase, Building2, Globe, Heart, HandHelping } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bio, setBio] = useState(user?.bio || "");
  const [hometown, setHometown] = useState(user?.hometown || "");
  const [currentCity, setCurrentCity] = useState(user?.currentCity || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [company, setCompany] = useState(user?.company || "");
  const [profession, setProfession] = useState(user?.profession || "");
  const [languages, setLanguages] = useState(user?.languages?.join(", ") || "");
  const [interests, setInterests] = useState(user?.interests?.join(", ") || "");
  const [willingToHelp, setWillingToHelp] = useState(user?.willingToHelp?.join(", ") || "");

  if (!user) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const data = {
        bio,
        hometown,
        currentCity,
        university: university || undefined,
        company: company || undefined,
        profession: profession || undefined,
        languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        willingToHelp: willingToHelp.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const updated = await api.updateProfile(data);
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={user.avatarUrl}
            firstName={user.firstName}
            lastName={user.lastName}
            size="xl"
            verified={user.verifiedBadge}
          />
          <div>
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-surface-900/50 dark:text-surface-50/50 text-sm">{user.email}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-brand-500">
              <MapPin className="h-4 w-4" />
              {user.hometown} → {user.currentCity}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <h3 className="font-semibold text-lg">Edit Profile</h3>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
            Bio
          </label>
          <textarea
            className="input min-h-[80px] resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your community about yourself..."
            maxLength={500}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
              <MapPin className="h-4 w-4 text-brand-500" /> Hometown
            </label>
            <input className="input" value={hometown} onChange={(e) => setHometown(e.target.value)} />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
              <MapPin className="h-4 w-4 text-brand-500" /> Current City
            </label>
            <input className="input" value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
              <GraduationCap className="h-4 w-4 text-brand-500" /> University
            </label>
            <input className="input" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g. BITS Pilani" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
              <Building2 className="h-4 w-4 text-brand-500" /> Company
            </label>
            <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
            <Briefcase className="h-4 w-4 text-brand-500" /> Profession
          </label>
          <input className="input" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Software Engineer" />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
            <Globe className="h-4 w-4 text-brand-500" /> Languages
          </label>
          <input className="input" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Telugu, Hindi, English (comma-separated)" />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
            <Heart className="h-4 w-4 text-brand-500" /> Interests
          </label>
          <input className="input" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="cricket, startups, cooking (comma-separated)" />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
            <HandHelping className="h-4 w-4 text-brand-500" /> Willing to Help With
          </label>
          <input className="input" value={willingToHelp} onChange={(e) => setWillingToHelp(e.target.value)} placeholder="housing, referrals, cultural_events (comma-separated)" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
