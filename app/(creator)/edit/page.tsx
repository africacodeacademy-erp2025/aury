"use client";

import { useState } from "react";
import { firebaseDb } from "@/firebase/client";
import { useAuth } from "@/lib/useAuth"; 
import { doc, setDoc } from "firebase/firestore";

export default function EditCreatorProfile() {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleSave = async () => {
    if (!currentUser) return;
    await setDoc(
      doc(firebaseDb, "users", "creators", currentUser.uid),
      { username, bio, avatar, updatedAt: new Date() },
      { merge: true }
    );
    alert("Profile updated!");
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Profile</h1>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full border p-2 mb-4"
      />

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Your bio"
        className="w-full border p-2 mb-4"
      />

      <input
        type="text"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        placeholder="Profile picture URL"
        className="w-full border p-2 mb-4"
      />

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Save
      </button>
    </div>
  );
}
