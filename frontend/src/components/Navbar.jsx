import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout as logoutApi } from '../utils/api'
import { Button } from './ui/Button'
import { Menu, X, LogOut, Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (typeof window !== 'undefined') document.documentElement.classList.toggle('dark')
  }

  const handleLogout = async () => {
    try {
      await logoutApi()
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary">Inbotiq</h1>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && (
            <>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut size={16} />
                Logout
              </Button>
            </>
          )}

          <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-accent transition-colors" aria-label="Toggle dark mode">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-accent transition-colors" aria-label="Toggle dark mode">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-accent transition-colors">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {isAuthenticated && (
            <>
              <div className="text-sm text-muted-foreground px-2">{user?.email}</div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2 justify-center">
                <LogOut size={16} />
                Logout
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
