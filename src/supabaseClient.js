import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdrhhriyiwwswewzagrf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkcmhocml5aXd3c3dld3phZ3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTI3NTEsImV4cCI6MjA5MDQ2ODc1MX0.Ptm4CgyoUM3rHMUO3ey_gIKx1GFefsFDdtQ5dbzKfDs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

