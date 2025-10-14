import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://zcqcbyqbmzsvjlyuhjlp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcWNieXFibXpzdmpseXVoamxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODY0MjUsImV4cCI6MjA3NTk2MjQyNX0.M0i5f5lGTEYonpbpEgn3i5dGXb3ZgtDAP2PbDXQWCwo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
