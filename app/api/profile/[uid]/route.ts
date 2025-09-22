// app/api/[uid]/route.ts
import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin"; // ✅ uses admin SDK
import type { DocumentData } from "firebase-admin/firestore";

// Utility function to standardize JSON responses
function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET creator profile
export async function GET(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  if (!uid) return jsonResponse({ error: "UID is required" }, 400);

  try {
    const docRef = firebaseDb.collection("creators").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return jsonResponse({ error: "Profile not found" }, 404);

    const data: DocumentData = docSnap.data()!;
    return jsonResponse(data);
  } catch (error: unknown) {
    console.error("GET /api/[uid] error:", error);
    if (error instanceof Error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ error: "Unknown error" }, 500);
  }
}

// POST (create or update creator profile)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  if (!uid) return jsonResponse({ error: "UID is required" }, 400);

  try {
    const body = (await req.json()) as Record<string, unknown>;

    // Optional: basic validation
    if (!body.name || !body.bio) {
      return jsonResponse({ error: "Name and bio are required" }, 400);
    }

    const docRef = firebaseDb.collection("creators").doc(uid);
    await docRef.set(body, { merge: true });

    return jsonResponse({ success: true });
  } catch (error: unknown) {
    console.error("POST /api/[uid] error:", error);
    if (error instanceof Error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ error: "Unknown error" }, 500);
  }
}
