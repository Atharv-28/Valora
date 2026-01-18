
import React, { useMemo, useRef, useState } from 'react'
import './ContactUs.css'

export const ContactUs = () => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	})
	const [status, setStatus] = useState('idle') // idle | sent
		const mailtoLinkRef = useRef(null)

	const mailtoHref = useMemo(() => {
		const to = 'info@valora.ai'
			const subject = form.subject?.trim() ? form.subject.trim() : 'Valora - Contact'
		const bodyLines = [
			`Name: ${form.name || '-'}`,
			`Email: ${form.email || '-'}`,
			'',
			form.message || '',
		]

		const params = new URLSearchParams({
			subject,
			body: bodyLines.join('\n'),
		})

		return `mailto:${to}?${params.toString()}`
	}, [form.email, form.message, form.name, form.subject])

	const onChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const onSubmit = (e) => {
		e.preventDefault()
		setStatus('sent')

			// Most reliable way (avoids popup blockers): trigger a user-gesture link click.
			if (mailtoLinkRef.current) {
				mailtoLinkRef.current.click()
				return
			}

			window.location.assign(mailtoHref)
	}

	return (
		<main className="contact-page">
			<div className="contact-container">
				<header className="contact-header">
					<h1 className="contact-title">Contact us</h1>
					<p className="contact-subtitle">
						Questions, feedback, or partnership ideas — we’d love to hear from you.
					</p>
				</header>

				<section className="contact-grid">
					<div className="contact-card contact-info">
						<h2 className="contact-card-title">Reach us</h2>
						<p className="contact-muted">
							The quickest way is email. We typically respond within 1–2 business days.
						</p>

						<div className="contact-details">
							<div className="contact-detail">
								<span className="contact-label">Email</span>
								<a className="contact-link" href="mailto:info@valora.ai">info@valora.ai</a>
							</div>
							<div className="contact-detail">
								<span className="contact-label">Careers</span>
								<a className="contact-link" href="mailto:careers@valora.ai">careers@valora.ai</a>
							</div>
						</div>

						<a className="contact-cta" href={mailtoHref}>
							Email us
						</a>
						<a
							ref={mailtoLinkRef}
							href={mailtoHref}
							tabIndex={-1}
							aria-hidden="true"
							style={{ display: 'none' }}
						>
							Open mail
						</a>

						{status === 'sent' && (
							<p className="contact-success" role="status">
								Your email draft is ready in your mail app.
							</p>
						)}
					</div>

					<div className="contact-card contact-form">
						<h2 className="contact-card-title">Send a message</h2>

						<form className="contact-form-inner" onSubmit={onSubmit}>
							<div className="contact-row">
								<div className="contact-field">
									<label htmlFor="name">Name</label>
									<input
										id="name"
										name="name"
										type="text"
										value={form.name}
										onChange={onChange}
										placeholder="Your name"
										autoComplete="name"
										required
									/>
								</div>

								<div className="contact-field">
									<label htmlFor="email">Email</label>
									<input
										id="email"
										name="email"
										type="email"
										value={form.email}
										onChange={onChange}
										placeholder="you@example.com"
										autoComplete="email"
										required
									/>
								</div>
							</div>

							<div className="contact-field">
								<label htmlFor="subject">Subject</label>
								<input
									id="subject"
									name="subject"
									type="text"
									value={form.subject}
									onChange={onChange}
									placeholder="How can we help?"
								/>
							</div>

							<div className="contact-field">
								<label htmlFor="message">Message</label>
								<textarea
									id="message"
									name="message"
									value={form.message}
									onChange={onChange}
									placeholder="Write your message..."
									rows={6}
									required
								/>
							</div>

							<button className="contact-submit" type="submit">
								Send
							</button>
						</form>
					</div>
				</section>
			</div>
		</main>
	)
}

