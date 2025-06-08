import React from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserManagementProps {
  users: any[];
  userSearch: string;
  setUserSearch: (v: string) => void;
  filteredUsers: any[];
  fetchTransactions: (userId: string) => void;
  profileDrawer: any | null;
  setProfileDrawer: (v: any | null) => void;
  transactions: any[];
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  userSearch,
  setUserSearch,
  filteredUsers,
  fetchTransactions,
  profileDrawer,
  setProfileDrawer,
  transactions,
}) => (
  <>
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
  </>
);

export default UserManagement;
