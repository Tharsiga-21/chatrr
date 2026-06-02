import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://slcpvuckecakhqcfzewr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY3B2dWNrZWNha2hxY2Z6ZXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDU0NzcsImV4cCI6MjA5NTcyMTQ3N30.4ONg2Zj2ntlJKN3Em6hQnPJ0GFQLIePO2_PWLO3_sD0'

export const supabase = createClient(supabaseUrl, supabaseKey)