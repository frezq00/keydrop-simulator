import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-secondary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-accent">
            KeyDrop Simulator
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/" className="text-white hover:text-accent transition">
              Cases
            </Link>
            {user && (
              <>
                <Link to="/upgrader" className="text-white hover:text-accent transition">
                  Upgrader
                </Link>
                <Link to="/inventory" className="text-white hover:text-accent transition">
                  Inventory
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">{user.username}</div>
                    <div className="text-yellow-400 font-bold">${user.balance.toFixed(2)}</div>
                  </div>
                  <img
                    src={user.pfp_url}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-accent text-white rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-accent text-white rounded hover:bg-red-600 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
