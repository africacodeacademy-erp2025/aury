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
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      if (type === "sign-up") {
        // const { name, email, password } = values;
        console.log(values);

        toast.success("Account Created Successfully. Please Sign In.");
        router.push("/sign-in");
      } else {
        // const { email, password } = values;
        console.log(values);

        toast.success("Signed In Successfully.");
        router.push("/");
        console.log("Sign In Values:", values);
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
    <div className="h-screen w-full flex items-center justify-center">
      <div className="card-border-custom border-t border-slate-200 lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/coach.svg" alt="logo" width={38} height={32} />
            <h2 className="text-primary-200 dark:text-primary-100">
              Aury
            </h2>
          </div>

          <h3>Some title here</h3>

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
    </div>
  );
};

export default AuthForm;
