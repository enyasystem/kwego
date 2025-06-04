import React from "react";
import { Users, IdCard, Settings, BarChart2, MoreHorizontal, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  tab: string;
  setTab: (tab: string) => void;
  adminProfile: any;
  onLogout: () => void;
}

const navItems = [
  { key: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
  { key: "kyc", label: "KYC", icon: <IdCard className="w-5 h-5" /> },
  { key: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  { key: "reports", label: "Reports", icon: <BarChart2 className="w-5 h-5" /> },
  { key: "more", label: "More", icon: <MoreHorizontal className="w-5 h-5" /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ tab, setTab, adminProfile, onLogout }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-belfx_navy-DEFAULT text-white min-h-screen shadow-xl sticky top-0 z-30">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-belfx_gold-DEFAULT">
        <img src="/images/belfx-logo-dark.png" alt="BELFX Logo" className="h-8" />
        <span className="font-bold text-belfx_gold-DEFAULT text-lg">BELFX Admin</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 mt-6">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`flex items-center gap-3 px-6 py-3 text-base font-medium transition rounded-l-full ${tab === item.key ? "bg-belfx_gold-DEFAULT/20 text-belfx_gold-DEFAULT" : "hover:bg-belfx_gold-DEFAULT/10"}`}
            onClick={() => setTab(item.key)}
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

// Commit message: feat(admin): add AdminSidebar component for modern sidebar navigation 🧭
