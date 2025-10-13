import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xymiqwhodxootvghgxto.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bWlxd2hvZHhvb3R2Z2hneHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzA3NTcsImV4cCI6MjA3NTg0Njc1N30.SDWQU6TXh5CfEVu-h_tZEYy5HMumM5qQ84m2aVxfq4I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
