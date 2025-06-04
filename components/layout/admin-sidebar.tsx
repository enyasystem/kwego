import React, { useEffect, useState } from "react";
import { Users, IdCard, Settings, BarChart2, MoreHorizontal, LogOut, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";

interface AdminSidebarProps {
  tab: string;
  setTab: (tab: string) => void;
  adminProfile: any;
  onLogout: () => void;
  isMobile?: boolean;
  closeSidebar?: () => void;
}

const navItems = [
  { key: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
  { key: "kyc", label: "KYC", icon: <IdCard className="w-5 h-5" /> },
  { key: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  { key: "reports", label: "Reports", icon: <BarChart2 className="w-5 h-5" /> },
  { key: "more", label: "More", icon: <MoreHorizontal className="w-5 h-5" /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ tab, setTab, adminProfile, onLogout, isMobile, closeSidebar }) => {
  // Notification state (simulate real-time for now)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New KYC request submitted", time: "2m ago", read: false },
    { id: 2, message: "User John Doe completed a trade", time: "10m ago", read: false },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Simulate real-time notification (for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: "System log: New admin login", time: "just now", read: false },
      ]);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside className={`flex flex-col w-64 bg-belfx_navy-DEFAULT text-white min-h-screen shadow-xl sticky top-0 z-30 ${isMobile ? "fixed left-0 top-0 h-full z-[101]" : "hidden md:flex"}`}>
      <div className="flex items-center gap-3 px-6 py-6 border-b border-belfx_gold-DEFAULT relative">
        <img src="/images/belfx-logo-dark.png" alt="BELFX Logo" className="h-8" />
        <span className="font-bold text-belfx_gold-DEFAULT text-lg">BELFX Admin</span>
        {/* Notification Bell */}
        <button
          className="ml-auto relative p-2 hover:bg-belfx_gold-DEFAULT/10 rounded-full"
          onClick={() => setShowNotif((v) => !v)}
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-belfx_gold-DEFAULT" />
          {unreadCount > 0 && (
            <UIBadge className="absolute -top-1 -right-1 bg-red-500 text-xs px-1.5 py-0.5">{unreadCount}</UIBadge>
          )}
        </button>
        {/* Close button for mobile */}
        {isMobile && closeSidebar && (
          <button
            className="ml-2 p-2 rounded-full bg-belfx_gold-DEFAULT/10 text-belfx_gold-DEFAULT hover:bg-belfx_gold-DEFAULT/20"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <span className="text-lg">×</span>
          </button>
        )}
      </div>
      <nav className="flex-1 flex flex-col gap-1 mt-6">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`flex items-center gap-3 px-6 py-3 text-base font-medium transition rounded-l-full ${tab === item.key ? "bg-belfx_gold-DEFAULT/20 text-belfx_gold-DEFAULT" : "hover:bg-belfx_gold-DEFAULT/10"}`}
            onClick={() => { setTab(item.key); setMobileOpen(false); }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto px-6 py-6 border-t border-belfx_gold-DEFAULT flex flex-col gap-3">
        {adminProfile && (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-belfx_gold-DEFAULT">
              <AvatarImage src={adminProfile.avatar_url || "/placeholder-user.jpg"} alt={adminProfile.full_name || adminProfile.email} />
              <AvatarFallback>{adminProfile.full_name ? adminProfile.full_name[0] : "A"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-belfx_gold-DEFAULT">{adminProfile.full_name || adminProfile.email}</div>
              <div className="text-xs text-gray-400">Admin</div>
            </div>
          </div>
        )}
        <Button variant="ghost" className="w-full flex items-center gap-2 mt-4 text-red-500 hover:bg-red-100" onClick={onLogout}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

// Commit message: fix(responsive): update AdminSidebar for mobile/desktop support and close button on mobile 📱
