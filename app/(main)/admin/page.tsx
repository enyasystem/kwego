"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

/**
 * Admin Dashboard for BELFX
 * - Login with admin email/password (Supabase Auth)
 * - View all users, their KYC status, and transaction history
 * - Manage KYC requests (approve/reject)
 */
const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  // Fetch all users and KYC requests after login
  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = createClient();
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .then(({ data }) => setUsers(data || []));
    supabase
      .from("kyc_requests")
      .select("*, profiles(full_name, email)")
      .then(({ data }) => setKycRequests(data || []));
    setLoading(false);
  }, [isAuthenticated]);

  // Fetch transactions for selected user
  const fetchTransactions = async (userId: string) => {
    setLoading(true);
    setSelectedUser(users.find((u) => u.id === userId));
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  };

  if (!isAuthenticated) {
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

  return (
    <div className="max-w-7xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-belfx_gold-DEFAULT">
            <img src="/images/belfx-logo-dark.png" alt="BELFX Logo" className="h-8" />
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Users List */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Users</h2>
              <div className="max-h-96 overflow-y-auto border rounded-lg bg-belfx_navy-light">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-belfx_gold-DEFAULT/10 ${selectedUser?.id === user.id ? "bg-belfx_gold-DEFAULT/20" : ""}`}
                    onClick={() => fetchTransactions(user.id)}
                  >
                    <img src={user.avatar_url || "/placeholder-user.jpg"} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-semibold">{user.full_name || user.email}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* KYC Requests */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-2">KYC Requests</h2>
              <div className="max-h-96 overflow-y-auto border rounded-lg bg-belfx_navy-light">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.profiles?.full_name || req.user_id}</TableCell>
                        <TableCell>{req.document_type}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "outline"}>{req.status}</Badge>
                        </TableCell>
                        <TableCell>{req.created_at ? new Date(req.created_at).toLocaleString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          {/* Transaction History for Selected User */}
          {selectedUser && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Transaction History for {selectedUser.full_name || selectedUser.email}</h2>
              <div className="max-h-96 overflow-y-auto border rounded-lg bg-belfx_navy-light">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
