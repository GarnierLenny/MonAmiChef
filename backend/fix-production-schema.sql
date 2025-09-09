-- Clean up production database schema to match our new schema separation
-- This removes foreign key constraints that reference the auth schema

BEGIN;

-- Drop foreign key constraints that reference auth.users
DO $$ 
BEGIN
    -- Drop Profile constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Profile_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_id_fkey";
    END IF;

    -- Drop Conversation constraint if it exists  
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Conversation_userId_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_userId_fkey";
    END IF;
END $$;

-- Add new columns to Guest table if they don't exist
DO $$ 
BEGIN
    -- Add conversion tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Guest' AND column_name = 'converted_user_id') THEN
        ALTER TABLE "public"."Guest" ADD COLUMN "converted_user_id" UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Guest' AND column_name = 'converted_at') THEN
        ALTER TABLE "public"."Guest" ADD COLUMN "converted_at" TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Guest' AND column_name = 'conversion_token') THEN
        ALTER TABLE "public"."Guest" ADD COLUMN "conversion_token" TEXT DEFAULT gen_random_uuid()::text;
    END IF;
END $$;

-- Create GuestConversion table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."GuestConversion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guest_id" UUID NOT NULL,
    "converted_user_id" UUID NOT NULL,
    "converted_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "GuestConversion_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints that only reference public schema
DO $$ 
BEGIN
    -- Add Guest -> Profile foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Guest_converted_user_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Guest" ADD CONSTRAINT "Guest_converted_user_id_fkey" 
        FOREIGN KEY ("converted_user_id") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Add GuestConversion -> Guest foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'GuestConversion_guest_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."GuestConversion" ADD CONSTRAINT "GuestConversion_guest_id_fkey" 
        FOREIGN KEY ("guest_id") REFERENCES "public"."Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Add GuestConversion -> Profile foreign key  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'GuestConversion_converted_user_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."GuestConversion" ADD CONSTRAINT "GuestConversion_converted_user_id_fkey" 
        FOREIGN KEY ("converted_user_id") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Add Conversation -> Profile foreign key (for owner_profile_id)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Conversation_owner_profile_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_owner_profile_id_fkey" 
        FOREIGN KEY ("owner_profile_id") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

COMMIT;

-- Verify the changes
SELECT 
    'Guest table columns' as check_type,
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'Guest' 
  AND column_name IN ('converted_user_id', 'converted_at', 'conversion_token')

UNION ALL

SELECT 
    'GuestConversion table exists' as check_type,
    table_name as column_name,
    'table' as data_type,
    'exists' as is_nullable
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'GuestConversion';