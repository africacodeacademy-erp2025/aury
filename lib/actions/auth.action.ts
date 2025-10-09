"use server";

import { firebaseAuth, firebaseDb } from "@/firebase/admin";
import { SignInParams, SignUpParams, User } from "@/types";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email, role } = params;

  try {
    const userRecord = await firebaseDb.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead.",
      };
    }

    await firebaseDb.collection("users").doc(uid).set({
      name,
      email,
      role,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
    
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error signing up:", error.message);
    } else {
      console.error("Unknown error signing up:", error);
    }

    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code: string }).code;

      if (code === "auth/email-already-exists") {
        return {
          success: false,
          message: "Email already exists. Please use a different email.",
        };
      }
    }

    return {
      success: false,
      message: "Failed to create an account. Please try again later.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await firebaseAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await firebaseAuth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Please sign up first.",
      };
    }

  await setSessionCookie(idToken);
  return { success: true } as const;

  } catch (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      message: "Failed to sign in. Please try again later.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}


export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodeClaims = await firebaseAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    const userRecord = await firebaseDb
      .collection("users")
      .doc(decodeClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    const userData = userRecord.data();
    if (!userData) return null;

    // Only return serializable fields to avoid Timestamp serialization errors
    return {
      id: userRecord.id,
      name: userData.name || "",
      email: userData.email || "",
      role: userData.role || "customer",
      stripeAccountId: userData.stripeAccountId,
      stripeOnboardingComplete: userData.stripeOnboardingComplete,
    } as User;

  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}