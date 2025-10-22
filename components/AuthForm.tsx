"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Form } from "./ui/form";
import FormField from "./FormField";
import { Button } from "./ui/button";
import Link from "next/link";
import Loader from "./Loader";
import { getCurrentUser, signIn, signUp } from "@/lib/actions/auth.action";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "@/firebase/client";
import { Controller } from "react-hook-form";
import { FormType } from "@/types";

/**
 * Returns a Zod schema for authentication forms based on the form type.
 *
 * @param type - The type of the authentication form, either 'sign-in' or 'sign-up'.
 *   - If 'sign-up', the schema requires a `name` field with at least 3 characters.
 *   - If 'sign-in', the `name` field is optional.
 *   - Both types require a valid `email` and a `password` with at least 6 characters.
 * @returns A Zod object schema for validating authentication form inputs.
 */

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters long",
    }),
    role:
      type === "sign-up"
        ? z.enum(["creator", "customer", "craft-business"])
        : z.enum(["creator", "customer", "craft-business"]).optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. Define your form.
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "customer",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      if (type === "sign-up") {
        const { name, email, password, role } = values as {
          name: string;
          email: string;
          password: string;
          role: "creator" | "customer";
        };
        const userCredential = await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email: email,
          password: password,
          role,
        });

        if (!result?.success) {
          toast.error(result?.message);
          return;
        }

        toast.success("Account Created Successfully. Please Sign In.");
        router.push("/sign-in");
      } else {
        const { email, password } = values;

        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Failed to retrieve user session. Please try again.");
          return;
        }

        const res = await signIn({
          email,
          idToken,
        });

        if (res?.success === false) {
          toast.error(res.message);
          return;
        }

        // Fetch user to determine redirect based on role
        const user = await getCurrentUser();
        toast.success("Signed In Successfully.");
        if (user?.role === "creator") {
          router.push("/dashboard");
        } else if (user?.role === "craft-business") {
          router.push("/craft-business/dashboard");
        } else {
          router.push("/marketplace");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Sign in failed: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  const isSignIn = type === "sign-in";

  return loading ? (
    <Loader />
  ) : (
    <div className="card-border-custom border-t border-slate-200 lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center items-center">
          <Image src="/aury-logo.png" alt="logo" width={50} height={50} />
          <h2 className="text-primary-600 dark:text-primary-100">Aury</h2>
        </div>

        <h3 className="text-xl font-semibold text-center">
          {isSignIn ? "Sign In to Your Account" : "Create Your Account"}
        </h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                name="name"
                control={form.control}
                label="Name"
                placeholder="Your name.."
              />
            )}

            <FormField
              name="email"
              control={form.control}
              label="Email"
              placeholder="Your email address.."
              type="email"
            />

            <FormField
              name="password"
              control={form.control}
              label="Password"
              placeholder="Enter your password.."
              type="password"
            />

            {!isSignIn && (
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <div>
                    <label className="label">Role</label>
                    <select
                      {...field}
                      className="w-full mt-2 border rounded-md px-3 py-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="customer">Customer</option>
                      <option value="creator">Creator</option>
                      <option value="craft-business">Craft Business</option>
                    </select>
                  </div>
                )}
              />
            )}

            <Button type="submit" className="btn">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}{" "}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
