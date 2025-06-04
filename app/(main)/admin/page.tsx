"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Chart } from "@/components/ui/chart";
import { Loader2, Users, IdCard, Settings, BarChart2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import AdminSidebar from "@/components/layout/admin-sidebar";

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

  // Fetch all users and KYC requests after login
  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = createClient();
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, created_at, is_admin, status")
      .order("created_at", { ascending: false })
      .then(({ data }) => setUsers(data || []));
    supabase
      .from("kyc_requests")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setKycRequests(data || []));
    setLoading(false);
  }, [isAuthenticated]);

  // Fetch admin profile after login
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", user.id)
          .single();
        setAdminProfile(data);
      }
    };
    fetchAdmin();
  }, [isAuthenticated]);

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
      <div className="flex items-center justify-center min-h-screen bg-belfx_navy-DEFAULT">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-belfx_gold-DEFAULT">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show nothing until session is checked
  if (isAuthenticated === null) {
    return null;
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
                  <h2 className="text-xl font-semibold mb-4 text-belfx_gold-DEFAULT">User Management</h2>
                  <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  <div className="overflow-x-auto border rounded-lg bg-belfx_navy-light shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="cursor-pointer hover:bg-belfx_gold-DEFAULT/10 transition" onClick={() => fetchTransactions(user.id)}>
                            <TableCell className="flex items-center gap-2">
                              <img src={user.avatar_url || "/placeholder-user.jpg"} alt="avatar" className="w-8 h-8 rounded-full border border-belfx_gold-DEFAULT" />
                              <span className="font-medium">{user.full_name || user.email}</span>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</TableCell>
                            <TableCell>
                              <Badge variant={user.status === "active" ? "default" : "outline"}>{user.status || "active"}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.is_admin ? "default" : "outline"}>{user.is_admin ? "Admin" : "User"}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* User Profile Drawer/Modal */}
                  {profileDrawer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
                      <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                          <img src={profileDrawer.avatar_url || "/placeholder-user.jpg"} alt="avatar" className="w-16 h-16 rounded-full border-2 border-belfx_gold-DEFAULT" />
                          <div>
                            <div className="text-xl font-bold">{profileDrawer.full_name || profileDrawer.email}</div>
                            <div className="text-sm text-gray-500">{profileDrawer.email}</div>
                            <div className="mt-1"><Badge variant={profileDrawer.is_admin ? "default" : "outline"}>{profileDrawer.is_admin ? "Admin" : "User"}</Badge></div>
                          </div>
                        </div>
                        <div className="mb-2 text-xs text-gray-400">Registered: {profileDrawer.created_at ? new Date(profileDrawer.created_at).toLocaleString() : "-"}</div>
                        <div className="mb-4">
                          <Badge variant={profileDrawer.status === "active" ? "default" : "outline"}>{profileDrawer.status || "active"}</Badge>
                        </div>
                        <h3 className="font-semibold mb-2">Transaction History</h3>
                        <div className="flex-1 overflow-y-auto border rounded-lg bg-belfx_navy-light">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transactions.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center text-gray-400">No transactions</TableCell></TableRow>
                              )}
                              {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                  <TableCell>{tx.type}</TableCell>
                                  <TableCell>{tx.amount}</TableCell>
                                  <TableCell>{tx.currency_code}</TableCell>
                                  <TableCell>
                                    <Badge variant={tx.status === "completed" ? "default" : tx.status === "failed" ? "destructive" : "outline"}>{tx.status}</Badge>
                                  </TableCell>
                                  <TableCell>{tx.created_at ? new Date(tx.created_at).toLocaleString() : "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <Button className="mt-6" variant="outline" onClick={() => setProfileDrawer(null)}>Close</Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                {/* KYC Tab */}
                <TabsContent value="kyc">
                  <div className="mb-4 flex flex-wrap gap-2 items-center">
                    <span className="font-semibold">Filter:</span>
                    <Button size="sm" variant={kycFilter === "pending" ? "default" : "outline"} onClick={() => setKycFilter("pending")}>Pending</Button>
                    <Button size="sm" variant={kycFilter === "approved" ? "default" : "outline"} onClick={() => setKycFilter("approved")}>Approved</Button>
                    <Button size="sm" variant={kycFilter === "rejected" ? "default" : "outline"} onClick={() => setKycFilter("rejected")}>Rejected</Button>
                    <Button size="sm" variant={kycFilter === "all" ? "default" : "outline"} onClick={() => setKycFilter("all")}>All</Button>
                  </div>
                  <div className="overflow-x-auto border rounded-lg bg-belfx_navy-light">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredKyc.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell>{req.profiles?.full_name || req.user_id}</TableCell>
                            <TableCell>{req.document_type}</TableCell>
                            <TableCell>
                              <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "outline"}>{req.status}</Badge>
                            </TableCell>
                            <TableCell>{req.created_at ? new Date(req.created_at).toLocaleString() : "-"}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => setKycModal(req)} disabled={req.status !== "pending"}>Review</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* KYC Modal */}
                  {kycModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-2">KYC Review</h3>
                        <div className="mb-2"><span className="font-semibold">User:</span> {kycModal.profiles?.full_name || kycModal.user_id}</div>
                        <div className="mb-2"><span className="font-semibold">Type:</span> {kycModal.document_type}</div>
                        <div className="mb-2"><span className="font-semibold">Status:</span> <Badge variant={kycModal.status === "approved" ? "default" : kycModal.status === "rejected" ? "destructive" : "outline"}>{kycModal.status}</Badge></div>
                        <div className="mb-2"><span className="font-semibold">Submitted:</span> {kycModal.created_at ? new Date(kycModal.created_at).toLocaleString() : "-"}</div>
                        {/* TODO: Show uploaded document links/images here */}
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="default" onClick={() => handleKycAction(kycModal.id, "approved")} disabled={loading}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleKycAction(kycModal.id, "rejected")} disabled={loading}>Reject</Button>
                          <Button size="sm" variant="outline" onClick={() => setKycModal(null)}>Close</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                {/* Settings Tab */}
                <TabsContent value="settings">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Roles & Permissions */}
                    <div>
                      <h3 className="font-bold mb-2">Roles & Permissions</h3>
                      <div className="bg-belfx_navy-light rounded-lg p-4">
                        <div className="mb-2">Assign admin rights to users:</div>
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center gap-2 mb-2">
                            <span>{user.full_name || user.email}</span>
                            <Button size="sm" variant={user.is_admin ? "default" : "outline"} disabled>{user.is_admin ? "Admin" : "User"}</Button>
                            {/* TODO: Add toggle for admin rights */}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Branding & Notifications */}
                    <div>
                      <h3 className="font-bold mb-2">Branding & Notifications</h3>
                      <div className="bg-belfx_navy-light rounded-lg p-4">
                        <div className="mb-2">Platform branding and notification settings coming soon.</div>
                        {/* TODO: Add branding/logo upload and notification config */}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {/* Reports Tab */}
                <TabsContent value="reports">
                  <div className="mb-4 flex flex-wrap gap-2 items-center">
                    <span className="font-semibold">Filter:</span>
                    <Button size="sm" variant="outline">Last 7 days</Button>
                    <Button size="sm" variant="outline">Last 30 days</Button>
                    <Button size="sm" variant="outline">All time</Button>
                    <Button size="sm" variant="outline">Export</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-belfx_navy-light rounded-lg p-4">
                      <h4 className="font-semibold mb-2">User Growth</h4>
                      <Chart type="line" data={{ labels: ["Jan", "Feb", "Mar", "Apr"], datasets: [{ label: "Users", data: [10, 30, 50, 80] }] }} />
                    </div>
                    <div className="bg-belfx_navy-light rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Transaction Volume</h4>
                      <Chart type="bar" data={{ labels: ["Jan", "Feb", "Mar", "Apr"], datasets: [{ label: "Volume", data: [1000, 3000, 5000, 8000] }] }} />
                    </div>
                  </div>
                </TabsContent>
                {/* More Tab */}
                <TabsContent value="more">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-belfx_navy-light rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Transactions</h4>
                      <div className="text-sm text-gray-400">Full transaction management coming soon.</div>
                    </div>
                    <div className="bg-belfx_navy-light rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Support Tickets</h4>
                      <div className="text-sm text-gray-400">Support ticket handling coming soon.</div>
                    </div>
                    <div className="bg-belfx_navy-light rounded-lg p-4">
                      <h4 className="font-semibold mb-2">System Logs</h4>
                      <div className="text-sm text-gray-400">System log monitoring coming soon.</div>
                    </div>
                  </div>
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

// Commit message: fix(responsive): make admin dashboard and sidebar fully responsive for all devices 📱
