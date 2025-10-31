import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login } from '../api'
import '../styles/LoginPage.css'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) await register(phone, password)
      const res = await login(phone, password)
      const token = res.data.token
      localStorage.setItem('token', token)
      localStorage.setItem('phone', phone)
      nav('/order')
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Tolo Delivery</h1>
        <h2>{isRegister ? 'Create Account' : 'Login'}</h2>
        <form onSubmit={submit}>
          <input
            placeholder="Phone (e.g. +2519...)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <span
          className="toggle-btn"
          onClick={() => setIsRegister(s => !s)}
        >
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </span>
      </div>
    </div>
  )
}
