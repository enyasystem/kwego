import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

/**
 * Admin KYC Review Panel for BELFX
 * - Lists all KYC requests with filters for status
 * - Shows user info, document, selfie, and Smile Identity result (if any)
 * - Allows admin to approve or reject with reason
 */
const AdminKycPanel = () => {
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending_review");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{ [id: string]: string }>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  // Check admin access on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) {
        router.replace("/login?message=Admin access required");
        return;
      }
      // Example: check if user email is in allowed list or has admin role
      // Replace this logic with your real admin check
      const adminEmails = ["admin@belfx.com"]; // TODO: Replace with real admin logic
      if (data.user.email && adminEmails.includes(data.user.email)) {
        setIsAdmin(true);
      } else {
        router.replace("/dashboard?message=Unauthorized");
      }
    });
  }, [router]);

  useEffect(() => {
    const fetchKycRequests = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("kyc_requests")
        .select("*, profiles(full_name, avatar_url, email)")
        .eq("status", filter)
        .order("created_at", { ascending: false });
      if (!error) setKycRequests(data || []);
      setLoading(false);
    };
    fetchKycRequests();
  }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from("kyc_requests").update({ status: "approved", rejection_reason: null }).eq("id", id);
    setKycRequests((prev) => prev.filter((k) => k.id !== id));
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from("kyc_requests").update({ status: "rejected", rejection_reason: rejectionReason[id] || "Rejected by admin" }).eq("id", id);
    setKycRequests((prev) => prev.filter((k) => k.id !== id));
    setActionLoading(null);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-400">Checking admin access...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-belfx_gold-DEFAULT">
            <img src="/images/belfx-logo-dark.png" alt="BELFX Logo" className="h-8" />
            Admin KYC Dashboard
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <Button variant={filter === "pending_review" ? "default" : "outline"} onClick={() => setFilter("pending_review")}>Pending</Button>
            <Button variant={filter === "approved" ? "default" : "outline"} onClick={() => setFilter("approved")}>Approved</Button>
            <Button variant={filter === "rejected" ? "default" : "outline"} onClick={() => setFilter("rejected")}>Rejected</Button>
          </div>
          <div className="mt-2 text-sm text-belfx_green-DEFAULT font-medium">KYC requests are reviewed within 24 hours of submission.</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : kycRequests.length === 0 ? (
            <div className="text-gray-400">No KYC requests found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Selfie</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Smile Result</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img src={req.profiles?.avatar_url || "/placeholder-user.jpg"} alt="avatar" className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-semibold">{req.profiles?.full_name || req.user_id}</div>
                          <div className="text-xs text-gray-400">{req.profiles?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {req.document_url ? <a href={req.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a> : "-"}
                    </TableCell>
                    <TableCell>
                      {req.selfie_url ? <a href={req.selfie_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a> : "-"}
                    </TableCell>
                    <TableCell>{req.document_type}</TableCell>
                    <TableCell>
                      <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "outline"}>{req.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {req.result ? <pre className="text-xs max-w-xs whitespace-pre-wrap">{JSON.stringify(req.result, null, 2)}</pre> : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>{req.created_at ? new Date(req.created_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      {filter === "pending_review" && (
                        <div className="flex flex-col gap-2">
                          <Button size="sm" disabled={actionLoading === req.id} onClick={() => handleApprove(req.id)}>
                            {actionLoading === req.id ? "Approving..." : "Approve"}
                          </Button>
                          <textarea
                            className="w-full p-1 border rounded text-xs mt-1"
                            placeholder="Rejection reason (optional)"
                            value={rejectionReason[req.id] || ""}
                            onChange={e => setRejectionReason(r => ({ ...r, [req.id]: e.target.value }))}
                          />
                          <Button size="sm" variant="destructive" disabled={actionLoading === req.id} onClick={() => handleReject(req.id)}>
                            {actionLoading === req.id ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      )}
                      {filter !== "pending_review" && req.rejection_reason && (
                        <div className="text-xs text-red-400">{req.rejection_reason}</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKycPanel;
