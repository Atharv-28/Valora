import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './login.css'

export const Login = () => {
	const [form, setForm] = useState({ email: '', password: '' })
	const [error, setError] = useState('')
	const [status, setStatus] = useState('idle') // idle | submitting

	const onChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
		setError('')
	}

	const onSubmit = (e) => {
		e.preventDefault()
		setError('')
		setStatus('submitting')

		// Auth is not wired yet (no backend endpoint). Keep UX minimal.
		setTimeout(() => {
			setStatus('idle')
			setError('Login is not configured yet. Please try again later.')
		}, 400)
	}

	return (
		<main className="login-page">
			<div className="login-container">
				<header className="login-header">
					<h1 className="login-title">Log in</h1>
					<p className="login-subtitle">Welcome back to Valora.</p>
				</header>

				<section className="login-card" aria-label="Login form">
					<form className="login-form" onSubmit={onSubmit}>
						<div className="login-field">
							<label htmlFor="email">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								value={form.email}
								onChange={onChange}
								placeholder="you@example.com"
								required
							/>
						</div>

						<div className="login-field">
							<label htmlFor="password">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								value={form.password}
								onChange={onChange}
								placeholder="••••••••"
								required
							/>
						</div>

						{error && (
							<p className="login-error" role="alert">
								{error}
							</p>
						)}

						<button className="login-submit" type="submit" disabled={status === 'submitting'}>
							{status === 'submitting' ? 'Signing in…' : 'Sign in'}
						</button>

						<p className="login-footer">
							Don’t have an account? <Link to="/signup">Sign up</Link>
						</p>
					</form>
				</section>
			</div>
		</main>
	)
}
