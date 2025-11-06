import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [sandboxMode, setSandboxMode] = useState(false)
  const [message, setMessage] = useState('')

  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const result = isLogin
      ? await login(username, password)
      : await register(username, password, sandboxMode)

    if (result.success) {
      navigate('/')
    } else {
      setMessage(result.message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-secondary p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-accent">
          {isLogin ? 'Login' : 'Register'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-primary border border-gray-700 rounded focus:border-accent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-primary border border-gray-700 rounded focus:border-accent focus:outline-none"
              required
            />
          </div>

          {!isLogin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sandbox"
                checked={sandboxMode}
                onChange={(e) => setSandboxMode(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="sandbox" className="text-sm">
                Sandbox Mode (999,999,999 balance)
              </label>
            </div>
          )}

          {message && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-accent text-white rounded font-semibold hover:bg-red-600 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
            }}
            className="text-accent hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
