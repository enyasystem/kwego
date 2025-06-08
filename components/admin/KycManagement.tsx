import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KycManagementProps {
  kycFilter: string;
  setKycFilter: (v: string) => void;
  filteredKyc: any[];
  setKycModal: (v: any | null) => void;
  kycModal: any | null;
  handleKycAction: (id: string, status: "approved" | "rejected") => void;
  loading: boolean;
}

const KycManagement: React.FC<KycManagementProps> = ({
  kycFilter,
  setKycFilter,
  filteredKyc,
  setKycModal,
  kycModal,
  handleKycAction,
  loading,
}) => (
  <>
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
                <Button size="sm" variant="outline" onClick={() => setKycModal(req)} disabled={!(req.status === "pending" || req.status === "pending_submission" || req.status === "pending_review")}>Review</Button>
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
  </>
);

export default KycManagement;
