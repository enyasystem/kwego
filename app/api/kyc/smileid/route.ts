import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import Smile Identity SDK or use fetch for REST API

// TODO: Securely load Smile Identity credentials from env
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

    // TODO: Upload files to Supabase Storage and get URLs
    // For now, just placeholders
    const documentUrl = "";
    const selfieUrl = "";

    // TODO: Call Smile Identity API to initiate KYC job
    // See: https://docs.usesmileid.com/reference/submit-job
    // Example: fetch(`${SMILE_ID_BASE_URL}/job`, { ... })
    const smileIdJobId = "smile-job-id-placeholder";
    const smileIdResult = null;

    // Save KYC request to Supabase
    const supabase = createClient();
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
