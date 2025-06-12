"use client"

import { useState, useEffect, useCallback } from "react" // Added useCallback
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Repeat,
  Users,
  Target,
  ChevronDown,
  LogOutIcon,
  DotIcon as DashboardIcon,
  SettingsIcon,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ScrollToTop } from "@/components/layout/scroll-to-top"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const router = useRouter()
  const supabase = createClient() // Memoize? For now, it's fine as createClient is cheap.
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fetchAndSetUser = useCallback(
    async (isInitialLoad = false) => {
      if (isInitialLoad) {
        console.log("HomePage Auth: Initial user fetch started.")
        setIsLoadingUser(true)
      }
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error("HomePage Auth: Error from supabase.auth.getUser():", error.message)
          setCurrentUser(null)
        } else {
          if (isInitialLoad) console.log("HomePage Auth: Initial user from getUser():", user ? user.email : "null")
          setCurrentUser(user)
        }
      } catch (e: any) {
        console.error("HomePage Auth: Exception during supabase.auth.getUser():", e.message)
        setCurrentUser(null)
      } finally {
        if (isInitialLoad) {
          setIsLoadingUser(false)
          console.log("HomePage Auth: Initial user fetch finished.")
        }
      }
    },
    [supabase.auth],
  ) // supabase.auth is stable

  useEffect(() => {
    let isMounted = true

    fetchAndSetUser(true) // Initial fetch

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      console.log("HomePage Auth: onAuthStateChange event:", event, "session user:", session?.user?.email ?? "null")
      setCurrentUser(session?.user ?? null)
      setIsLoadingUser(false) // Ensure loading is false after any auth event

      if (event === "SIGNED_OUT") {
        console.log("HomePage Auth: SIGNED_OUT detected, calling router.refresh()")
        router.refresh() // Crucial for server components to re-evaluate session
      } else if (event === "SIGNED_IN") {
        console.log("HomePage Auth: SIGNED_IN detected. Current user should be set.")
        // Optionally, refresh if other page content depends on server state post-login
        // router.refresh();
      } else if (event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        console.log("HomePage Auth: Session updated/refreshed:", event)
        // Potentially re-fetch user details if they might have changed and are displayed directly
        // For now, just ensuring currentUser is from the session is enough for the nav.
      }
    })

    return () => {
      isMounted = false
      if (authListener?.unsubscribe) {
        console.log("HomePage Auth: Unsubscribing auth listener.")
        authListener.unsubscribe()
      }
    }
  }, [fetchAndSetUser, router, supabase.auth]) // Add supabase.auth to ensure listener re-subscribes if client changes (though unlikely)

  const handleLogout = async () => {
    console.log("HomePage Auth: handleLogout initiated.")
    toast({ title: "Logging out...", description: "Please wait." })
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("HomePage Auth: supabase.auth.signOut() error:", error.message)
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" })
    } else {
      console.log(
        "HomePage Auth: supabase.auth.signOut() successful. onAuthStateChange should handle UI update and refresh.",
      )
      // onAuthStateChange handles setCurrentUser(null) and router.refresh() for SIGNED_OUT
      toast({ title: "Logged Out", description: "You have been successfully logged out." })
    }
  }

  const getUserInitials = () => {
    if (!currentUser) return ""
    const fullName = currentUser.user_metadata?.full_name
    if (fullName && typeof fullName === "string" && fullName.trim() !== "") {
      return fullName
        .split(" ")
        .filter((n) => n) // handle multiple spaces
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    }
    return currentUser.email ? currentUser.email[0].toUpperCase() : "U"
  }

  const faqItems = [
    {
      id: "faq-1",
      question: "What is kwegofx?",
      answer:
        "kwegofx is a peer-to-peer (P2P) Forex platform that allows users to directly exchange currencies like NGN, USD, CAD, GBP, and EUR with each other securely and efficiently.",
    },
    {
      id: "faq-2",
      question: "How do I start trading on kwegofx?",
      answer:
        "To start trading, you need to register for an account, complete the KYC (Know Your Customer) verification process, fund your wallet, and then you can browse existing offers or create your own in the marketplace.",
    },
    {
      id: "faq-3",
      question: "Is kwegofx secure?",
      answer:
        "Yes, security is our top priority. We use state-of-the-art encryption, offer Two-Factor Authentication (2FA), and have robust KYC/AML protocols to protect your assets and personal information.",
    },
    {
      id: "faq-4",
      question: "What currencies can I trade?",
      answer: "Currently, kwegofx supports NGN, USD, CAD, GBP, and EUR. We plan to add more currencies in the future.",
    },
    {
      id: "faq-5",
      question: "Are there any fees for trading?",
      answer:
        "kwegofx aims to offer competitive and transparent fees. Please refer to our 'Fees & Limits' page for detailed information on transaction fees.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-belfx_navy-DEFAULT text-white">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 
                  ${isScrolled ? "bg-belfx_navy-DEFAULT/95 border-b-belfx_navy-light/50 shadow-lg backdrop-blur-md" : "bg-transparent border-transparent"}`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="kwegofx Homepage">
            <img src="/images/belfx-logo-dark.png" alt="kwegofx Logo" className="h-9 md:h-10" />
          </Link>
          <nav className="hidden items-center gap-x-5 lg:gap-x-7 text-sm font-medium md:flex">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "#about-us", label: "About Us" },
              { href: "/marketplace", label: "Marketplace" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-300 transition-colors hover:text-belfx_gold-DEFAULT focus:text-belfx_gold-DEFAULT focus:outline-none focus-visible:ring-2 focus-visible:ring-belfx_gold-DEFAULT rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {isLoadingUser ? (
              <div className="h-10 w-36 animate-pulse bg-belfx_navy-light rounded-md">
                <span className="sr-only">Loading user status...</span>
              </div>
            ) : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border-2 border-belfx_gold-DEFAULT">
                      <AvatarImage
                        src={currentUser.user_metadata?.avatar_url || undefined} // Pass undefined if no URL
                        alt={currentUser.user_metadata?.full_name || "User avatar"}
                      />
                      <AvatarFallback className="bg-belfx_gold-DEFAULT text-belfx_navy-DEFAULT font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-belfx_navy-light border-belfx_navy-light text-white shadow-xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal py-2 px-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-100 truncate">
                        {currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs leading-none text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-belfx_gold-dark/30" />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:!bg-belfx_gold-DEFAULT/90 hover:!text-belfx_navy-DEFAULT focus:!bg-belfx_gold-DEFAULT/90 focus:!text-belfx_navy-DEFAULT text-gray-200 py-2 px-3"
                  >
                    <Link href="/dashboard">
                      <DashboardIcon className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:!bg-belfx_gold-DEFAULT/90 hover:!text-belfx_navy-DEFAULT focus:!bg-belfx_gold-DEFAULT/90 focus:!text-belfx_navy-DEFAULT text-gray-200 py-2 px-3"
                  >
                    <Link href="/dashboard/settings">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-belfx_gold-dark/30" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer hover:!bg-belfx_gold-DEFAULT/90 hover:!text-belfx_navy-DEFAULT focus:!bg-belfx_gold-DEFAULT/90 focus:!text-belfx_navy-DEFAULT text-gray-200 py-2 px-3"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2 text-sm font-medium text-belfx_gold-DEFAULT transition-colors hover:text-belfx_gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-belfx_gold-DEFAULT"
                >
                  Login
                </Link>
                <Link href="/register">
                  <Button
                    variant="default"
                    className="bg-belfx_gold-DEFAULT text-belfx_navy-DEFAULT hover:bg-belfx_gold-dark shadow-md hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-belfx_navy-DEFAULT focus-visible:ring-belfx_gold-DEFAULT"
                  >
                    Register
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
          <MobileNav /> {/* Note: MobileNav will also need similar auth state logic for consistency */}
        </div>
      </header>

      {/* Hero Section (and rest of the page) remains unchanged */}
      <main className="flex-1">
        <section className="relative py-24 md:py-32 lg:py-48 bg-belfx_navy-DEFAULT overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/hero-background-unsplash.png"
              alt="Abstract global finance network connecting various points on a dark background with blue and gold accents"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-belfx_navy-DEFAULT/50 via-belfx_navy-DEFAULT/80 to-belfx_navy-DEFAULT"></div>
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Empowering Your</span>
              <span className="block text-belfx_gold-DEFAULT mt-2 sm:mt-4">Global Forex Exchange 🌍</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-300 sm:text-xl md:text-2xl leading-relaxed">
              Trade NGN, USD, CAD, GBP, and EUR directly with peers. Secure, fast, and transparent P2P currency exchange
              at your fingertips.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-belfx_gold-DEFAULT text-belfx_navy-DEFAULT hover:bg-belfx_gold-dark text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-belfx_navy-DEFAULT focus-visible:ring-belfx_gold-DEFAULT"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-belfx_gold-DEFAULT text-belfx_gold-DEFAULT hover:bg-belfx_gold-DEFAULT hover:text-belfx_navy-DEFAULT text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-belfx_gold-DEFAULT"
                >
                  Explore Marketplace
                </Button>
              </Link>
            </div>
            <div className="mt-16 animate-bounce">
              <Link href="#features" aria-label="Scroll to features section">
                <ChevronDown className="h-10 w-10 text-gray-500 hover:text-belfx_gold-DEFAULT mx-auto transition-colors" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-belfx_navy-light">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
              Why <span className="text-belfx_gold-DEFAULT">kwegofx</span> Stands Out
            </h2>
            <p className="text-center text-gray-400 mb-12 md:mb-16 max-w-2xl mx-auto text-lg leading-relaxed">
              Experience the future of currency exchange with our user-centric platform, designed for security, speed,
              and unparalleled ease of use.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldCheck className="h-12 w-12 text-belfx_green-DEFAULT mb-6" />,
                  title: "Robust Security 🛡️",
                  description: "State-of-the-art encryption, 2FA, and KYC protocols to protect your assets and data.",
                },
                {
                  icon: <Zap className="h-12 w-12 text-belfx_green-DEFAULT mb-6" />,
                  title: "Fast Transactions ⚡️",
                  description: "Enjoy quick deposits, withdrawals, and P2P exchanges with our optimized system.",
                },
                {
                  icon: <Repeat className="h-12 w-12 text-belfx_green-DEFAULT mb-6" />,
                  title: "Competitive Rates 💹",
                  description: "Access favorable exchange rates by trading directly with other users on the platform.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-8 rounded-xl bg-belfx_navy-DEFAULT shadow-2xl hover:shadow-belfx_gold-DEFAULT/20 transition-all duration-300 transform hover:-translate-y-2"
                >
                  {feature.icon}
                  <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about-us" className="py-16 md:py-24 bg-belfx_navy-DEFAULT">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  The <span className="text-belfx_gold-DEFAULT">kwegofx</span> Vision ✨
                </h2>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  kwegofx is pioneering a new era of financial freedom by providing a secure, transparent, and
                  user-friendly P2P Forex platform.
                </p>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-belfx_green-DEFAULT mt-1" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-belfx_gold-DEFAULT mb-1">Who We Are 👥</h3>
                      <p className="text-gray-400 leading-relaxed">
                        A dedicated team of finance and technology experts committed to democratizing access to foreign
                        exchange markets, empowering individuals globally.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Target className="h-8 w-8 text-belfx_green-DEFAULT mt-1" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-belfx_gold-DEFAULT mb-1">Our Mission 🎯</h3>
                      <p className="text-gray-400 leading-relaxed">
                        To create a seamless, equitable global financial ecosystem where currency exchange is
                        borderless, instant, and accessible to everyone, everywhere.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center items-center">
                <img
                  src="/images/about-us-unsplash.png"
                  alt="Diverse professional team collaborating in a bright, modern office, symbolizing kwegofx's global vision and teamwork"
                  className="rounded-xl shadow-2xl max-w-md w-full object-cover aspect-[4/3] transform transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-belfx_navy-light">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 md:mb-16">
              Get Started in <span className="text-belfx_gold-DEFAULT">3 Simple Steps</span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="hidden md:block absolute top-6 left-0 w-full h-1 bg-belfx_navy-DEFAULT/50 -z-10"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-0 relative">
                  {[
                    {
                      title: "Register & Verify ✅",
                      description: "Create your account and complete KYC verification quickly and securely.",
                    },
                    {
                      title: "Fund Your Wallet 💰",
                      description: "Deposit NGN or other supported currencies into your multi-currency wallet.",
                    },
                    {
                      title: "Trade P2P 🔄",
                      description: "Browse offers or create your own to exchange currencies directly with other users.",
                    },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center relative p-6 pt-12 bg-belfx_navy-DEFAULT rounded-xl shadow-xl transition-all duration-300 hover:shadow-belfx_green-DEFAULT/20"
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-14 h-14 bg-gradient-to-br from-belfx_green-DEFAULT to-belfx_gold-DEFAULT rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-belfx_navy-light shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white mt-4 mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 bg-belfx_navy-DEFAULT">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
              <div className="md:col-span-2">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Frequently <span className="text-belfx_gold-DEFAULT">Asked Questions</span> 🤔
                </h2>
                <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                  Have questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free
                  to contact our support team.
                </p>
                <img
                  src="/images/faq-illustration-unsplash.png"
                  alt="Abstract representation of information flow or interconnected ideas on a dark background"
                  className="rounded-lg opacity-50 hidden md:block mt-8 object-cover aspect-video"
                />
              </div>
              <div className="md:col-span-3">
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {faqItems.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="bg-belfx_navy-light/30 rounded-lg border-belfx_navy-light/50 transition-shadow hover:shadow-md"
                    >
                      <AccordionTrigger className="w-full flex justify-between items-center p-5 md:p-6 text-left text-lg font-medium text-white hover:text-belfx_gold-DEFAULT hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-belfx_gold-DEFAULT rounded-lg">
                        <span>{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="p-5 md:p-6 pt-0 text-gray-300 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-belfx_green-DEFAULT via-belfx_gold-DEFAULT to-yellow-400 text-belfx_navy-DEFAULT">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              Ready to Revolutionize Your Forex Experience? 🚀
            </h2>
            <p className="mb-8 max-w-xl mx-auto text-lg leading-relaxed">
              Join thousands of users benefiting from secure and efficient P2P currency exchange. Sign up today and take
              control of your finances.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-belfx_navy-DEFAULT text-white hover:bg-belfx_navy-light text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-current focus-visible:ring-white"
              >
                Create Your Free Account Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-belfx_navy-DEFAULT border-t border-belfx_navy-light/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/images/belfx-logo-dark.png" alt="kwegofx Logo" className="h-8 mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed">
                The future of P2P Forex. Securely exchange currencies with ease and confidence.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/marketplace", label: "Marketplace" },
                  { href: "/wallets", label: "Wallets" },
                  { href: "#how-it-works", label: "How It Works" },
                  { href: "#faq", label: "FAQ" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-belfx_gold-DEFAULT transition-colors focus:outline-none focus-visible:text-belfx_gold-DEFAULT"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/aml", label: "AML Policy" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-belfx_gold-DEFAULT transition-colors focus:outline-none focus-visible:text-belfx_gold-DEFAULT"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Contact Us</h5>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">📧 support@belfx.com</li>
                <li className="text-gray-400">📍 105 Kwegofx Avenue, Lagos, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-belfx_navy-light/30">
            © {new Date().getFullYear()} kwegofx Technologies Ltd. All rights reserved. kwegofx is a financial technology
            company, not a bank. Currency exchange services are provided on a peer-to-peer basis.
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  )
}
