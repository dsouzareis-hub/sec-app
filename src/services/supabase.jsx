import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kxgkgrkkicjcfnovachm.supabase.co"
const supabaseKey = "sb_publishable_XJGjNlqROpYTzh3_87Hjyg_h0jV3t7I"

export const supabase = createClient(supabaseUrl, supabaseKey)