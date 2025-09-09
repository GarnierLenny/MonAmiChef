-- Add missing foreign key constraints to production database
-- Run this only if the constraints don't already exist

BEGIN;

-- Add ChatMessage -> Conversation foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ChatMessage_conversationId_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" 
        FOREIGN KEY ("conversation_id") REFERENCES "public"."Conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- Add Conversation -> Guest foreign key  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Conversation_owner_guest_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_owner_guest_id_fkey" 
        FOREIGN KEY ("owner_guest_id") REFERENCES "public"."Guest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- Add Conversation -> Profile foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Conversation_userId_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_userId_fkey" 
        FOREIGN KEY ("owner_profile_id") REFERENCES "public"."Profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

COMMIT;

SELECT 'Foreign key constraints added successfully' as result;