import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/models'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, pharmacyData?: Partial<User>) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  bypassLogin: (userType: 'member' | 'admin') => void
  initialize: () => Promise<void>
  getRedirectPath: () => string
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Fetch user profile from accounts table
            const { data: profile, error } = await supabase
              .from('accounts')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()

            if (error || !profile) {
              console.error('Error fetching user profile:', error)
              set({ user: null, isAuthenticated: false })
              return
            }

            const user: User = {
              id: profile.id,
              email: profile.email,
              pharmacy_name: profile.pharmacy_name,
              role: profile.role || 'member',
              subscription_status: profile.subscription_status,
              pharmacy_phone: profile.pharmacy_phone,
              address1: profile.address1,
              city: profile.city,
              state: profile.state,
              zipcode: profile.zipcode,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            }

            set({ user, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ user: null, isAuthenticated: false })
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            throw new Error(error.message)
          }

          if (data.user) {
            // Fetch user profile from accounts table
            const { data: profile, error: profileError } = await supabase
              .from('accounts')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError) {
              console.error('Error fetching user profile:', profileError)
              throw new Error('Failed to load user profile')
            }

            const user: User = {
              id: profile.id,
              email: profile.email,
              pharmacy_name: profile.pharmacy_name,
              role: profile.role || 'member',
              subscription_status: profile.subscription_status,
              pharmacy_phone: profile.pharmacy_phone,
              address1: profile.address1,
              city: profile.city,
              state: profile.state,
              zipcode: profile.zipcode,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            }

            set({ user, isAuthenticated: true, isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async (email: string, password: string, pharmacyData?: Partial<User>) => {
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password
          })

          if (error) {
            throw new Error(error.message)
          }

          if (data.user) {
            // Update the accounts table with additional pharmacy data
            if (pharmacyData) {
              const { error: updateError } = await supabase
                .from('accounts')
                .update({
                  pharmacy_name: pharmacyData.pharmacy_name,
                  pharmacy_phone: pharmacyData.pharmacy_phone,
                  address1: pharmacyData.address1,
                  city: pharmacyData.city,
                  state: pharmacyData.state,
                  zipcode: pharmacyData.zipcode
                })
                .eq('id', data.user.id)

              if (updateError) {
                console.error('Error updating user profile:', updateError)
              }
            }

            // Fetch the complete user profile
            const { data: profile, error: profileError } = await supabase
              .from('accounts')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (!profileError && profile) {
              const user: User = {
                id: profile.id,
                email: profile.email,
                pharmacy_name: profile.pharmacy_name,
                role: profile.role || 'member',
                subscription_status: profile.subscription_status,
                pharmacy_phone: profile.pharmacy_phone,
                address1: profile.address1,
                city: profile.city,
                state: profile.state,
                zipcode: profile.zipcode,
                created_at: profile.created_at,
                updated_at: profile.updated_at
              }

              set({ user, isAuthenticated: true, isLoading: false })
            }
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        console.log('🚪 Logging out...');

        // Clear local session first to prevent rehydration if network call fails
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        if (localError) {
          console.error('❌ Local logout error:', localError);
        }

        // Attempt global sign out (network)
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Supabase signout error:', error);
        } else {
          console.log('✅ Supabase signout successful');
        }

        // Clear auth state and persisted storage
        set({ user: null, isAuthenticated: false, isLoading: false });
        localStorage.removeItem('auth-storage');

        // Remove any auth-related query or hash params
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        window.history.replaceState({}, document.title, url.pathname);

        // Force redirect to login page
        window.location.assign('/login');
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      // Bypass authentication for testing/debugging
      bypassLogin: (userType: 'member' | 'admin') => {
        const mockUsers = {
          member: {
            id: 'mock_member_001',
            role: 'member' as const,
            email: 'demo.member@clinicalrxq.com',
            pharmacy_name: 'Community Care Pharmacy',
            subscription_status: 'active',
            pharmacy_phone: '(555) 123-4567',
            address1: '123 Main Street',
            city: 'Springfield',
            state: 'IL',
            zipcode: '62701',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-12-20T15:45:00.000Z'
          },
          admin: {
            id: 'mock_admin_001',
            role: 'admin' as const,
            email: 'admin@clinicalrxq.com',
            pharmacy_name: 'ClinicalRxQ Administrative',
            subscription_status: 'active',
            pharmacy_phone: '(555) 987-6543',
            address1: '456 Admin Boulevard',
            city: 'Chicago',
            state: 'IL',
            zipcode: '60601',
            created_at: '2024-01-01T08:00:00.000Z',
            updated_at: '2024-12-20T16:30:00.000Z'
          }
        }

        const mockUser = mockUsers[userType]
        set({ user: mockUser, isAuthenticated: true, isLoading: false })
      },

      getRedirectPath: () => {
        const { user } = get()
        if (!user) return '/login'
        return user.role === 'admin' ? '/admin' : '/dashboard'
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Initialize auth state on app load
supabase.auth.onAuthStateChange(async (event) => {
  const { initialize } = useAuth.getState()
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    await initialize()
  }
})
