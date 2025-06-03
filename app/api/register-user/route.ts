import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Ensure these are set in your environment variables for Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  console.log("[API /api/register-user] Received POST request.")

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error(
      "[API /api/register-user] CRITICAL ERROR: Supabase URL or Service Role Key is not configured in environment variables.",
    )
    // Return JSON even for this critical configuration error
    return NextResponse.json(
      {
        message: "Server configuration error. Please contact support if this issue persists.",
      },
      { status: 500 },
    )
  }

  let supabaseAdmin
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    console.log("[API /api/register-user] Supabase admin client initialized.")
  } catch (e: any) {
    console.error("[API /api/register-user] Error initializing Supabase admin client:", e.toString(), e.stack)
    return NextResponse.json({ message: "Server error during Supabase client initialization." }, { status: 500 })
  }

  let requestBody
  try {
    requestBody = await request.json()
    console.log("[API /api/register-user] Request body parsed:", JSON.stringify(requestBody, null, 2))
  } catch (e: any) {
    console.error("[API /api/register-user] Error parsing request JSON:", e.toString())
    return NextResponse.json({ message: "Invalid request format. Expected JSON." }, { status: 400 })
  }

  const { email, password, fullName } = requestBody

  if (!email || !password || !fullName) {
    console.warn(
      "[API /api/register-user] Validation Error: Missing required fields in request body. Received:",
      requestBody,
    )
    return NextResponse.json({ message: "Missing required fields: email, password, or full name." }, { status: 400 })
  }
  // Basic password validation server-side (can be more complex)
  if (typeof password !== "string" || password.length < 8) {
    console.warn("[API /api/register-user] Validation Error: Password does not meet complexity requirements.")
    return NextResponse.json({ message: "Password must be at least 8 characters long." }, { status: 400 })
  }

  try {
    console.log(`[API /api/register-user] Attempting to create user: ${email}`)
    const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Supabase sends confirmation email
      user_metadata: { full_name: fullName },
    })

    if (createUserError) {
      console.warn(
        `[API /api/register-user] Supabase createUser error for ${email}. Status: ${createUserError.status}, Message: ${createUserError.message}`,
      )
      const errorMessageLower = createUserError.message.toLowerCase()
      // Check for various forms of "user already exists" or unique constraint violation
      if (
        errorMessageLower.includes("user already registered") ||
        errorMessageLower.includes("user already exists") ||
        errorMessageLower.includes("duplicate key value violates unique constraint") || // PostgreSQL error
        (createUserError.status === 400 &&
          (errorMessageLower.includes("already registered") || errorMessageLower.includes("user exists"))) ||
        (createUserError.status === 422 && errorMessageLower.includes("email link signin disabled for user")) // Can indicate user exists
      ) {
        console.log(`[API /api/register-user] Email ${email} already exists.`)
        return NextResponse.json(
          {
            message:
              "This email address is already registered. Please try logging in, or reset your password if you've forgotten it.",
            errorCode: "EMAIL_ALREADY_EXISTS",
          },
          { status: 409 },
        ) // 409 Conflict
      }

      // For other Supabase errors during creation
      return NextResponse.json(
        {
          message: createUserError.message || "Registration failed due to a server issue. Please try again.",
          details: createUserError.name, // Provide some detail if available
        },
        { status: createUserError.status || 500 },
      )
    }

    if (createUserData && createUserData.user) {
      console.log(`[API /api/register-user] User ${email} created successfully. ID: ${createUserData.user.id}`)
      return NextResponse.json(
        {
          message:
            "Almost there! We've sent a confirmation link to your email. Please check your inbox (and spam folder).",
        },
        { status: 200 },
      )
    } else {
      // This case should ideally not be reached if createUserError is null
      console.error("[API /api/register-user] CRITICAL: Supabase createUser returned no error and no user data.")
      return NextResponse.json(
        {
          message:
            "An unexpected issue occurred during registration (no user data returned from provider). Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (e: any) {
    console.error("[API /api/register-user] CRITICAL: Unhandled exception in POST handler:", e.toString(), e.stack)
    return NextResponse.json(
      { message: "An unexpected server error occurred. Please try again later." },
      { status: 500 },
    )
  }
}

// The AuthForm component remains the same as it's correctly trying to parse JSON.
// The error it reports is a symptom, not the cause.
// For completeness, here's a reference to where the error occurs in AuthForm:
