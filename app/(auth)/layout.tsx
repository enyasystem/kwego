import type React from "react"
import Link from "next/link"
import { cookies } from "next/headers" // Add this import
import { redirect } from "next/navigation" // Add this import
import { createClient } from "@/lib/supabase/server" // Add this import

export default async function AuthLayout({
  // Make the function async
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Attempt to get the session from cookies
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // If a session object exists based on cookies,
    // verify its validity by fetching the user from Supabase server.
    // This ensures the session isn't just a lingering cookie but an active server-side session.
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()

    if (getUserError) {
      // An error occurred trying to validate the user with the session.
      // This could be a network issue or the token is definitively invalid.
      // Log it and proceed as if no valid user, allowing access to the auth page.
      console.error("AuthLayout: Error validating user session with getUser():", getUserError.message)
    }

    if (user) {
      // User is confirmed to be active for this session, redirect to dashboard.
      redirect("/dashboard")
    } else {
      // Session cookie was present, but getUser() confirmed no active user (or an error occurred).
      // This means the session is stale or invalid.
      // Do NOT redirect to dashboard. Allow user to see login/register page.
      console.warn(
        "AuthLayout: Session cookie found, but no active user confirmed by getUser(). Allowing access to auth page.",
      )
    }
  }
  // If no session cookie or session is stale (as determined above), proceed to render the auth page children.

  return (
    <div className="flex min-h-screen flex-col bg-belfx_navy-DEFAULT text-white">
      <header className="sticky top-0 z-50 w-full border-b border-belfx_navy-light bg-belfx_navy-DEFAULT/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* <MountainIcon className="h-6 w-6 text-belfx_gold-DEFAULT" /> */}
            <img src="/placeholder.svg?height=32&width=120" alt="BELFX Logo" className="h-8" />
            {/* <span className="text-xl font-bold text-belfx_gold-DEFAULT">BELFX</span> */}
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/marketplace" className="text-gray-300 transition-colors hover:text-belfx_gold-DEFAULT">
              Marketplace
            </Link>
            <Link href="/support" className="text-gray-300 transition-colors hover:text-belfx_gold-DEFAULT">
              Support
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-belfx_gold-DEFAULT px-4 py-2 text-sm font-medium text-belfx_navy-DEFAULT transition-colors hover:bg-belfx_gold-dark"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-belfx_gold-DEFAULT px-4 py-2 text-sm font-medium text-belfx_gold-DEFAULT transition-colors hover:bg-belfx_gold-DEFAULT hover:text-belfx_navy-DEFAULT"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">{children}</main>
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-belfx_navy-light">
        © {new Date().getFullYear()} BELFX. All rights reserved.
      </footer>
    </div>
  )
}
