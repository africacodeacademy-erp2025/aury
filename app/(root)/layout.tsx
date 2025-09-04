import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user?.role === "creator") {
    redirect("/community");
  }

  return (
    <div>
      <Header />
      <div className="pt-16">{children}</div>
    </div>
  );
};

export default RootLayout;
