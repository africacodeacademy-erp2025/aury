import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (user?.role === "creator") {
    redirect("/community");
  } else if (user?.role === "craft-business") {
    redirect("/craft-business/dashboard");
  } else if (user?.role === "customer") {
    redirect("/");
  }

  return <div className="auth-layout">{children}</div>;
};

export default layout;
