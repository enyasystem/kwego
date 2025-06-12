-- kwegofx: KYC Requests Table for Smile Identity Integration
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending_submission', -- pending_submission, pending_review, approved, rejected
    document_type text NOT NULL, -- bvn, national_id, passport, drivers_license, selfie
    document_url text, -- Supabase Storage URL for ID document
    selfie_url text, -- Supabase Storage URL for selfie
    smile_id_job_id text, -- Smile Identity job reference
    result jsonb, -- Smile Identity API response
    rejection_reason text, -- Optional: reason for rejection
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing smile_id_job_id and result columns for Smile Identity integration
ALTER TABLE public.kyc_requests
ADD COLUMN IF NOT EXISTS smile_id_job_id text,
ADD COLUMN IF NOT EXISTS result jsonb;

-- Add missing document_type column for KYC document type
ALTER TABLE public.kyc_requests
ADD COLUMN IF NOT EXISTS document_type text;

-- Index for quick lookup by user
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON public.kyc_requests(user_id);

-- Row-level security (RLS) policies should be enabled and configured for this table.
