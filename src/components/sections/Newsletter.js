'use client';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg('Subscribed successfully!');
      setEmail('');
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg('Please enter a valid email.');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="newsletter-box">
          <h3><i className="fas fa-envelope-open-text" /> Stay Updated</h3>
          <p>Subscribe for exam updates and admission news.</p>
          <form className="newsletter-form" onSubmit={submit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit"><i className="fas fa-paper-plane" /> Subscribe</button>
          </form>
          {msg && <p style={{ marginTop: '1rem', color: '#fff' }}>{msg}</p>}
        </div>
      </div>
    </section>
  );
}