"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ArrowRight } from "lucide-react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#about-us", label: "About Us" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "#faq", label: "FAQ" },
  ]

  // Close sheet on link click
  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-gray-300 hover:text-belfx_gold-DEFAULT">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-xs bg-belfx_navy-DEFAULT text-white border-l border-belfx_navy-light p-0"
      >
        <SheetHeader className="p-6 border-b border-belfx_navy-light">
          <SheetTitle className="flex items-center">
            <img src="/images/belfx-logo-dark.png" alt="BELFX Logo" className="h-8 mr-2" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-2 p-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-belfx_navy-light hover:text-belfx_gold-DEFAULT transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-6 border-t border-belfx_navy-light mt-4">
            <Link href="/login" onClick={handleLinkClick}>
              <Button
                variant="outline"
                className="w-full mb-3 border-belfx_gold-DEFAULT text-belfx_gold-DEFAULT hover:bg-belfx_gold-DEFAULT hover:text-belfx_navy-DEFAULT"
              >
                Login
              </Button>
            </Link>
            <Link href="/register" onClick={handleLinkClick}>
              <Button className="w-full bg-belfx_gold-DEFAULT text-belfx_navy-DEFAULT hover:bg-belfx_gold-dark">
                Register <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
