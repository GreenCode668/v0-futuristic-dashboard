import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTenant() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getTenant() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const { data: userTenants } = await supabase
          .from('user_tenants')
          .select('tenant_id')
          .eq('user_id', user.id)
          .limit(1)
          .single()

        if (userTenants) {
          setTenantId(userTenants.tenant_id)
        }
      } catch (error) {
        console.error('Error fetching tenant:', error)
      } finally {
        setLoading(false)
      }
    }

    getTenant()
  }, [])

  return { tenantId, loading }
}
