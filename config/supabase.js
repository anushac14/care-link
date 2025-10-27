import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vesuwnubaxqwepbneizk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlc3V3bnViYXhxd2VwYm5laXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTY0OTgsImV4cCI6MjA3NzA5MjQ5OH0.oawQeYdx1ukOFgollwc3YS_XHPb4TFY-hZe0q9SIC7U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, 
  }
});