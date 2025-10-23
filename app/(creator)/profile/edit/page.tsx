/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb, firebaseStorage } from "@/firebase/client";
import { Camera } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface CreatorProfile {
  name: string;
  bio: string;
  contact: string;
  logoUrl: string;
}

export default function EditProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [formData, setFormData] = useState<CreatorProfile>({
    name: "",
    bio: "",
    contact: "",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Load profile on auth change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      setUser(authUser);

      try {
        // Fetch from users collection
        const userRef = doc(firebaseDb, "users", authUser.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
          const userData = snap.data();
          setFormData({
            name: userData.name || authUser.displayName || "",
            bio: userData.bio || "",
            contact: userData.email || authUser.email || "",
            logoUrl: userData.photoURL || authUser.photoURL || "",
          });
        } else {
          // If no profile exists, populate with auth data
          setFormData({
            name: authUser.displayName || "",
            bio: "",
            contact: authUser.email || "",
            logoUrl: authUser.photoURL || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const storageRef = ref(firebaseStorage, `logos/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData((prev) => ({ ...prev, logoUrl: url }));
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Save to users collection
      const userRef = doc(firebaseDb, "users", user.uid);
      await setDoc(userRef, {
        name: formData.name,
        bio: formData.bio,
        email: formData.contact,
        photoURL: formData.logoUrl,
        updatedAt: new Date(),
      }, { merge: true });

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.name,
        photoURL: formData.logoUrl || null,
      });

      alert("Profile updated successfully!");
      router.push("/profile");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Profile
      </h1>

      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Logo Upload */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Camera className="text-gray-500" />
            )}
          </div>
          <label className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            {uploading ? "Uploading..." : "Upload Logo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Info
          </label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Save Button */}
        <div>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
