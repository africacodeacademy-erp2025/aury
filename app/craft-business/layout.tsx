import Sidebar from "@/components/craft-business/Sidebar";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import React, { ReactNode } from 'react'

const CraftBusinessLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "craft-business") redirect("/community");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <div className="p-4 lg:p-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default CraftBusinessLayout