/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface ProfileData {
  name: string;
  bio: string;
  logoUrl?: string;
  email?: string;
  contactInfo?: string;
}

interface ProfileFormProps {
  uid: string;
}

export default function ProfileForm({ uid }: ProfileFormProps) {
  const [formValues, setFormValues] = useState<ProfileData>({
    name: '',
    bio: '',
    logoUrl: undefined,
    email: '',
    contactInfo: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/${uid}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data: ProfileData = await res.json();
        setFormValues((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, [uid]);

  // ============================
  // Image upload
  // ============================
  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success && data.url) {
        setFormValues((prev) => ({ ...prev, logoUrl: data.url }));
        toast.success('Logo uploaded successfully!');
      } else {
        toast.error(data.message || 'Failed to upload logo');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => setFormValues((prev) => ({ ...prev, logoUrl: undefined }));

  // ============================
  // Submit
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/${uid}`, {
        method: 'POST', // You can switch to PUT if preferred
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Submit profile error:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
        <textarea
          value={formValues.bio}
          onChange={(e) => setFormValues({ ...formValues, bio: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formValues.email}
          onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Contact Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
        <input
          type="text"
          value={formValues.contactInfo}
          onChange={(e) => setFormValues({ ...formValues, contactInfo: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
        {formValues.logoUrl ? (
          <div className="relative w-32 h-32">
            <img src={formValues.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={removeLogo}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
            className="border p-2 rounded-lg"
          />
        )}
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || uploading}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
