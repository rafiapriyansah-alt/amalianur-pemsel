import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRole) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Server actions may fail.')
}

export const supabaseServer = createClient(url, serviceRole)
