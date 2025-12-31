import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnnfsxclthsfrdbgkjos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubmZzeGNsdGhzZnJkYmdram9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzcwMTUsImV4cCI6MjA4MjYxMzAxNX0.nMkFvtsnEvETqI6mYjEl8K4BbG4806suy7FKXRLwQOw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
