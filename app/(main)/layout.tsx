import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
// You might want a shared Navbar/Sidebar for the main app layout here
// For now, it's a simple pass-through if authenticated.

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // If no session, redirect to login, optionally pass current path for redirect back
    // const currentPath = headers().get('next-url') || '/dashboard';
    // redirect(`/login?redirect_to=${encodeURIComponent(currentPath)}`);
    redirect("/login?message=Please log in to continue.")
  }

  // If session exists, render the children (the protected page)
  return <>{children}</>
}
