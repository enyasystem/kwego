import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// TODO: Import Smile Identity SDK or use fetch for REST API
// This route handles KYC submission: uploads files to Supabase Storage, and (eventually) calls Smile Identity for liveness check.

const SMILE_ID_PARTNER_ID = process.env.SMILE_ID_PARTNER_ID;
const SMILE_ID_API_KEY = process.env.SMILE_ID_API_KEY;
const SMILE_ID_BASE_URL = process.env.SMILE_ID_BASE_URL || "https://api.smileidentity.com/v1";

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

    // --- Smile Identity API call for liveness check (to be implemented) ---
    // You will provide Smile Identity API credentials and integration details here.
    // For now, we use placeholders for job ID and result.
    const smileIdJobId = "smile-job-id-placeholder";
    const smileIdResult = null;

    // --- Save KYC request to Supabase ---
    const { error } = await supabase.from("kyc_requests").insert({
      user_id: userId,
      status: "pending_review",
      document_type: documentType,
      document_url: documentUrl,
      selfie_url: selfieUrl,
      smile_id_job_id: smileIdJobId,
      result: smileIdResult,
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
// This route uploads KYC files to Supabase Storage and prepares for Smile Identity liveness check.
// Replace placeholders with actual Smile Identity API integration when credentials are available.
