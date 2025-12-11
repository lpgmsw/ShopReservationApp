import { createClient } from '@/lib/supabase/client'

describe('Supabase Client', () => {
  it('should create a Supabase client instance', () => {
    const supabase = createClient()
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should have environment variables configured', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })
})
