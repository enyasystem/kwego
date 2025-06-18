import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// TODO: Import new KYC provider SDK or use fetch for REST API
// This route handles KYC submission: uploads files to Supabase Storage, and (eventually) calls the KYC provider for liveness check.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    const documentType = formData.get("documentType") as string;
    const documentValue = formData.get("documentValue") as string;
    const documentFile = formData.get("documentFile") as File;
    const selfieFile = formData.get("selfieFile") as File;

    // --- Upload files to Supabase Storage ---
    // Use service role key to bypass RLS for trusted server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    // Upload ID document
    let documentUrl = "";
    if (documentFile) {
      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .upload(`${userId}/id-${Date.now()}-${documentFile.name}`, documentFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw new Error("Failed to upload ID document: " + error.message);
      documentUrl = data?.path ? supabase.storage.from("kyc-documents").getPublicUrl(data.path).data.publicUrl : "";
    }
    // Upload selfie
    let selfieUrl = "";
    if (selfieFile) {
      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .upload(`${userId}/selfie-${Date.now()}-${selfieFile.name}`, selfieFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw new Error("Failed to upload selfie: " + error.message);
      selfieUrl = data?.path ? supabase.storage.from("kyc-documents").getPublicUrl(data.path).data.publicUrl : "";
    }

    // --- KYC Provider API call for liveness check (to be implemented) ---
    // You will provide the new KYC API credentials and integration details here.
    // For now, we use placeholders for job ID and result.
    const kycJobId = "kyc-job-id-placeholder";
    const kycResult = null;

    // --- Save KYC request to Supabase ---
    const { error } = await supabase.from("kyc_requests").insert({
      user_id: userId,
      status: "pending_review",
      document_type: documentType,
      document_url: documentUrl,
      selfie_url: selfieUrl,
      kyc_job_id: kycJobId,
      result: kycResult,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, status: "pending_review" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
// ---
// This route uploads KYC files to Supabase Storage and prepares for the new KYC provider liveness check.
// Replace placeholders with actual KYC provider API integration when credentials are available.
