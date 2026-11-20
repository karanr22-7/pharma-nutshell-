
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import './AdminLogin.css'

function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const ADMIN_EMAIL = 'karunyar2202@gmail.com'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        throw error
      }

      if (data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await supabase.auth.signOut()
        throw new Error('You are not authorised to access the admin portal.')
      }

      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <Link to="/" className="admin-back-link">
          ← Back to website
        </Link>

        <div className="admin-logo">
          <img src="/pharma-nutshell-icon.png" alt="Pharma Nutshell" />
        </div>

        <h1>Welcome Back</h1>
        <p className="admin-subtitle">
          Sign in to manage Pharma Nutshell
        </p>

        <form className="admin-login-form" onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p style={{ color: '#d9534f', fontSize: '14px' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="admin-footer">
          Pharma Nutshell · Admin Portal
        </p>

      </div>
    </div>
  )
}

export default AdminLogin
