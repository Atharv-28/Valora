import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './signup.css'

export const Signup = () => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [status, setStatus] = useState('idle') // idle | submitting
	const [error, setError] = useState('')

	const passwordMismatch = useMemo(() => {
		if (!form.password || !form.confirmPassword) return false
		return form.password !== form.confirmPassword
	}, [form.confirmPassword, form.password])

	const onChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
		setError('')
	}

	const onSubmit = (e) => {
		e.preventDefault()
		setError('')

		if (passwordMismatch) {
			setError('Passwords do not match.')
			return
		}

		setStatus('submitting')

		// Auth is not wired yet (no backend endpoint). Keep UX minimal.
		setTimeout(() => {
			setStatus('idle')
			setError('Sign up is not configured yet. Please try again later.')
		}, 400)
	}

	return (
		<main className="signup-page">
			<div className="signup-container">
				<header className="signup-header">
					<h1 className="signup-title">Create account</h1>
					<p className="signup-subtitle">Start preparing with Valora.</p>
				</header>

				<section className="signup-card" aria-label="Sign up form">
					<form className="signup-form" onSubmit={onSubmit}>
						<div className="signup-field">
							<label htmlFor="name">Name</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								value={form.name}
								onChange={onChange}
								placeholder="Your name"
								required
							/>
						</div>

						<div className="signup-field">
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

						<div className="signup-field">
							<label htmlFor="password">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								value={form.password}
								onChange={onChange}
								placeholder="••••••••"
								required
							/>
						</div>

						<div className="signup-field">
							<label htmlFor="confirmPassword">Confirm password</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								value={form.confirmPassword}
								onChange={onChange}
								placeholder="••••••••"
								required
								aria-invalid={passwordMismatch ? 'true' : 'false'}
							/>
							{passwordMismatch && (
								<p className="signup-hint" role="status">Passwords must match.</p>
							)}
						</div>

						{error && (
							<p className="signup-error" role="alert">
								{error}
							</p>
						)}

						<button className="signup-submit" type="submit" disabled={status === 'submitting'}>
							{status === 'submitting' ? 'Creating…' : 'Create account'}
						</button>

						<p className="signup-footer">
							Already have an account? <Link to="/login">Log in</Link>
						</p>
					</form>
				</section>
			</div>
		</main>
	)
}
