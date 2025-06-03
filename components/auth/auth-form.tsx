"use client"

import { useEffect, useState, useTransition } from "react" // Added useEffect
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, LogOut } from "lucide-react" // Added LogOut icon

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain a number" })
      .regex(/[^a-zA-Z0-9]/, { message: "Password must contain a special character" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

type AuthFormProps = {
  mode: "login" | "register" | "forgot-password"
}

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Check for messages in URL params (e.g., after logout or email verification)
  useEffect(() => {
    const message = searchParams.get("message")
    const errorParam = searchParams.get("error") // For general errors from redirects

    if (message === "logout_successful") {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default", // Or 'success' if you have one
        action: <LogOut className="h-5 w-5 text-green-500" />,
      })
      // Clean the URL by removing the message param
      router.replace("/login", { scroll: false })
    } else if (message) {
      // Handle other generic messages if needed
      toast({
        title: "Notification",
        description: message.replace(/_/g, " "), // Replace underscores for readability
      })
      router.replace("/login", { scroll: false })
    }

    if (errorParam) {
      toast({
        variant: "destructive",
        title: "Error",
        description: errorParam,
      })
      router.replace("/login", { scroll: false })
    }
  }, [searchParams, toast, router])

  const currentSchema = mode === "login" ? loginSchema : mode === "register" ? registerSchema : forgotPasswordSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues | RegisterFormValues | ForgotPasswordFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues:
      mode === "register"
        ? { fullName: "", email: "", password: "", confirmPassword: "" }
        : { email: "", password: "" },
  })

  const onSubmit: SubmitHandler<any> = async (data) => {
    setError(null)
    startTransition(async () => {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (signInError) {
          setError(signInError.message)
          toast({ variant: "destructive", title: "Login Failed", description: signInError.message })
        } else {
          toast({ title: "Login Successful", description: "Redirecting to dashboard..." })
          router.push("/dashboard")
          router.refresh() // Important to update server-side session state for layouts
        }
      } else if (mode === "register") {
        try {
          const response = await fetch("/api/register-user", {
            // This is the call
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
              fullName: data.fullName,
            }),
          })

          // The error occurs here if 'response' is HTML
          const result = await response.json()

          if (!response.ok) {
            const displayMessage = result.message || "An unknown error occurred during registration."
            setError(displayMessage)
            toast({
              variant: "destructive",
              title: "Registration Failed",
              description: displayMessage,
            })
          } else {
            toast({
              title: "Almost there!",
              description:
                result.message ||
                "Please check your email to verify your account. If you don't see it, check your spam folder.",
              duration: 9000,
            })
          }
        } catch (fetchError: any) {
          // This catch block is where your "Unexpected token '<'" error is originating
          console.error("Client-side fetch error during registration:", fetchError.message, fetchError.stack)
          // Check if the error message is the JSON parsing error
          let displayError = "Could not connect to the server. Please check your internet connection and try again."
          if (
            fetchError.message.toLowerCase().includes("unexpected token") &&
            fetchError.message.toLowerCase().includes("json")
          ) {
            displayError =
              "Received an invalid response from the server. Please try again. If the issue persists, contact support."
          }
          setError(displayError)
          toast({
            variant: "destructive",
            title: "Registration Error",
            description: displayError,
          })
        }
      } else if (mode === "forgot-password") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (resetError) {
          setError(resetError.message)
          toast({ variant: "destructive", title: "Error", description: resetError.message })
        } else {
          toast({ title: "Password Reset Email Sent", description: "Please check your email for instructions." })
        }
      }
    })
  }

  const pageTitle =
    mode === "login" ? "Welcome Back" : mode === "register" ? "Create an Account" : "Reset Your Password"
  const submitButtonText = mode === "login" ? "Login" : mode === "register" ? "Register" : "Send Reset Link"

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-belfx_navy-light p-8 shadow-xl">
      <h1 className="mb-6 text-center text-3xl font-bold text-belfx_gold-DEFAULT">{pageTitle}</h1>
      {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {mode === "register" && (
          <div>
            <Label htmlFor="fullName" className="text-gray-300">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              {...register("fullName")}
              className="mt-1 bg-belfx_navy-DEFAULT border-belfx_gold-dark/50 text-white focus:border-belfx_gold-DEFAULT focus:ring-belfx_gold-DEFAULT"
              placeholder="John Doe"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message as string}</p>}
          </div>
        )}
        <div>
          <Label htmlFor="email" className="text-gray-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 bg-belfx_navy-DEFAULT border-belfx_gold-dark/50 text-white focus:border-belfx_gold-DEFAULT focus:ring-belfx_gold-DEFAULT"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message as string}</p>}
        </div>
        {mode !== "forgot-password" && (
          <div>
            <Label htmlFor="password_auth_form" className="text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password_auth_form"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="mt-1 bg-belfx_navy-DEFAULT border-belfx_gold-dark/50 text-white focus:border-belfx_gold-DEFAULT focus:ring-belfx_gold-DEFAULT"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-belfx_gold-DEFAULT"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message as string}</p>}
          </div>
        )}
        {mode === "register" && (
          <div>
            <Label htmlFor="confirmPassword_auth_form" className="text-gray-300">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword_auth_form"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="mt-1 bg-belfx_navy-DEFAULT border-belfx_gold-dark/50 text-white focus:border-belfx_gold-DEFAULT focus:ring-belfx_gold-DEFAULT"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-belfx_gold-DEFAULT"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message as string}</p>
            )}
          </div>
        )}
        <Button
          type="submit"
          className="w-full bg-belfx_gold-DEFAULT text-belfx_navy-DEFAULT hover:bg-belfx_gold-dark focus:ring-belfx_gold-DEFAULT font-semibold"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitButtonText}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm">
        {mode === "login" && (
          <>
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-belfx_gold-DEFAULT hover:underline">
                Register
              </Link>
            </p>
            <p className="mt-2 text-gray-400">
              <Link href="/forgot-password" className="font-medium text-belfx_gold-DEFAULT hover:underline">
                Forgot password?
              </Link>
            </p>
          </>
        )}
        {mode === "register" && (
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-belfx_gold-DEFAULT hover:underline">
              Login
            </Link>
          </p>
        )}
        {mode === "forgot-password" && (
          <p className="text-gray-400">
            Remembered your password?{" "}
            <Link href="/login" className="font-medium text-belfx_gold-DEFAULT hover:underline">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
