"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Users, IdCard, Settings, BarChart2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import UserManagement from "@/components/admin/UserManagement";
import KycManagement from "@/components/admin/KycManagement";
import SettingsPanel from "@/components/admin/SettingsPanel";
import ReportsPanel from "@/components/admin/ReportsPanel";
import MorePanel from "@/components/admin/MorePanel";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [kycFilter, setKycFilter] = useState("pending");
  const [kycModal, setKycModal] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("users");
  const [profileDrawer, setProfileDrawer] = useState<any | null>(null);
  const [adminProfile, setAdminProfile] = useState<any | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  };

  // On mount, check if admin is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  // Fetch admin profile after login
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, is_admin")
          .eq("id", user.id)
          .single();
        setAdminProfile(data);
      }
    };
    fetchAdmin();
  }, [isAuthenticated]);

  // Fetch all users and KYC requests only after confirming admin status
  useEffect(() => {
    if (!isAuthenticated || !adminProfile || !adminProfile.is_admin) return;
    const supabase = createClient();
    setLoading(true);
    Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at, is_admin, status")
        .order("created_at", { ascending: false }),
      supabase
        .from("kyc_requests")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })
    ]).then(([usersRes, kycRes]) => {
      setUsers(usersRes.data || []);
      setKycRequests(kycRes.data || []);
      setLoading(false);
    });
  }, [isAuthenticated, adminProfile]);

  // Fetch transactions for selected user
  const fetchTransactions = async (userId: string) => {
    setLoading(true);
    setSelectedUser(users.find((u) => u.id === userId));
    setProfileDrawer(users.find((u) => u.id === userId));
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  };

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      (u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // Filtered KYC requests
  const filteredKyc = kycRequests.filter((k) =>
    kycFilter === "all" ? true : k.status === kycFilter
  );

  // Approve/reject KYC
  const handleKycAction = async (id: string, status: "approved" | "rejected") => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("kyc_requests").update({ status }).eq("id", id);
    setKycRequests((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status } : k))
    );
    setKycModal(null);
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAdminProfile(null);
    setLoading(false);
  };

  // Only show login form if isAuthenticated === false
  if (isAuthenticated === false) {
    return (
      <AdminLoginForm
        email={email}
        password={password}
        loading={loading}
        loginError={loginError}
        setEmail={setEmail}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    );
  }

  // Show nothing until session is checked
  if (isAuthenticated === null || (isAuthenticated && !adminProfile)) {
    return null;
  }

  // Show unauthorized message to non-admins
  if (isAuthenticated && adminProfile && !adminProfile.is_admin) {
    return (
      <div className="p-8 text-center text-red-600 font-bold text-xl">
        🚫 Unauthorized: You do not have admin access.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-belfx_navy-light">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-belfx_navy-DEFAULT text-belfx_gold-DEFAULT shadow-lg focus:outline-none"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Users className="w-6 h-6" />
      </button>
      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="w-64 bg-belfx_navy-DEFAULT text-white min-h-screen shadow-xl animate-slide-in-left flex flex-col">
            <AdminSidebar
              tab={tab}
              setTab={(t) => { setTab(t); setMobileSidebarOpen(false); }}
              adminProfile={adminProfile}
              onLogout={handleLogout}
              isMobile
              closeSidebar={() => setMobileSidebarOpen(false)}
            />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AdminSidebar
            tab={tab}
            setTab={setTab}
            adminProfile={adminProfile}
            onLogout={handleLogout}
          />
        </div>
        <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-2 sm:px-4 md:px-8 transition-all">
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <Loader2 className="animate-spin w-12 h-12 text-belfx_gold-DEFAULT" />
            </div>
          )}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-belfx_navy-DEFAULT rounded-t-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-bold text-belfx_gold-DEFAULT">
                <img src="/images/belfx-logo-dark.png" alt="BELFX Logo" className="h-8" />
                Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="mb-6 flex flex-wrap gap-2 sticky top-16 z-10 bg-belfx_navy-DEFAULT/80 backdrop-blur rounded-lg shadow-sm overflow-x-auto">
                  <TabsTrigger value="users" className="flex items-center gap-1"><Users className="w-4 h-4" /> Users</TabsTrigger>
                  <TabsTrigger value="kyc" className="flex items-center gap-1"><IdCard className="w-4 h-4" /> KYC</TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center gap-1"><BarChart2 className="w-4 h-4" /> Reports</TabsTrigger>
                  <TabsTrigger value="more" className="flex items-center gap-1"><MoreHorizontal className="w-4 h-4" /> More</TabsTrigger>
                </TabsList>
                {/* Users Tab */}
                <TabsContent value="users">
                  <UserManagement
                    users={users}
                    userSearch={userSearch}
                    setUserSearch={setUserSearch}
                    filteredUsers={filteredUsers}
                    fetchTransactions={fetchTransactions}
                    profileDrawer={profileDrawer}
                    setProfileDrawer={setProfileDrawer}
                    transactions={transactions}
                  />
                </TabsContent>
                {/* KYC Tab */}
                <TabsContent value="kyc">
                  <KycManagement
                    kycFilter={kycFilter}
                    setKycFilter={setKycFilter}
                    filteredKyc={filteredKyc}
                    setKycModal={setKycModal}
                    kycModal={kycModal}
                    handleKycAction={handleKycAction}
                    loading={loading}
                  />
                </TabsContent>
                {/* Settings Tab */}
                <TabsContent value="settings">
                  <SettingsPanel users={users} />
                </TabsContent>
                {/* Reports Tab */}
                <TabsContent value="reports">
                  <ReportsPanel />
                </TabsContent>
                {/* More Tab */}
                <TabsContent value="more">
                  <MorePanel />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

// Commit message: refactor: use new components for each dashboard section, move UI logic into those components, and keep only state/handlers in the main page. Import and use AdminLoginForm, UserManagement, KycManagement, SettingsPanel, ReportsPanel, MorePanel.
