import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import Header from "@/components/Header";

const MessagesLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Allow all authenticated users (customers, creators, craft-business)
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default MessagesLayout;
