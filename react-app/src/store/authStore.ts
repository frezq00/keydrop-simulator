import { create } from 'zustand'
import { supabase, type User } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: string | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: string | null) => void
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (username: string, password: string, sandboxMode: boolean) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  setUser: (user: User | null) => set({ user }),
  setSession: (session: string | null) => set({ session }),

  login: async (username: string, _password: string) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      if (error || !user) {
        return { success: false, message: 'Invalid username or password' }
      }

      // In production, verify password hash
      const sessionId = crypto.randomUUID()

      await supabase.from('sessions').insert({
        id: sessionId,
        user_id: user.id
      })

      localStorage.setItem('session_id', sessionId)
      set({ user, session: sessionId })

      return { success: true, message: 'Login successful' }
    } catch (error) {
      return { success: false, message: 'Login failed' }
    }
  },

  register: async (username: string, password: string, sandboxMode: boolean) => {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existing) {
        return { success: false, message: 'Username already taken' }
      }

      const userId = crypto.randomUUID()
      const { error } = await supabase.from('users').insert({
        id: userId,
        username,
        password_hash: 'hashed_' + password, // In production, use proper hashing
        balance: sandboxMode ? 999999999 : 50,
        sandbox_mode: sandboxMode,
        language: 'en'
      })

      if (error) throw error

      const sessionId = crypto.randomUUID()
      await supabase.from('sessions').insert({
        id: sessionId,
        user_id: userId
      })

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      localStorage.setItem('session_id', sessionId)
      set({ user, session: sessionId })

      return { success: true, message: 'Registration successful' }
    } catch (error) {
      return { success: false, message: 'Registration failed' }
    }
  },

  logout: async () => {
    const { session } = get()
    if (session) {
      await supabase.from('sessions').delete().eq('id', session)
      localStorage.removeItem('session_id')
    }
    set({ user: null, session: null })
  },

  checkSession: async () => {
    const sessionId = localStorage.getItem('session_id')
    if (!sessionId) {
      set({ loading: false })
      return
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', sessionId)
      .maybeSingle()

    if (!session) {
      localStorage.removeItem('session_id')
      set({ loading: false })
      return
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .maybeSingle()

    set({ user: user || null, session: sessionId, loading: false })
  }
}))
