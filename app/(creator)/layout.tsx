import CreatorHeader from "@/components/creator/CreatorHeader";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import React, { ReactNode } from 'react'

const CreatorLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "creator") redirect("/");

  return (
    <div>
      <CreatorHeader />
      <div className="pt-16">{children}</div>
    </div>
  )
}

export default CreatorLayout