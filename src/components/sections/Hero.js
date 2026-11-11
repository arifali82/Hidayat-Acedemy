'use client';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [cd, setCd] = useState({ d: '00', h: '00', m: '00', s: '00' });

  useEffect(() => {
    const tick = () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 45);
      deadline.setHours(23, 59, 59, 0);
      const dist = deadline.getTime() - Date.now();
      setCd({
        d: String(Math.max(0, Math.floor(dist / 86400000))).padStart(2, '0'),
        h: String(Math.max(0, Math.floor((dist % 86400000) / 3600000))).padStart(2, '0'),
        m: String(Math.max(0, Math.floor((dist % 3600000) / 60000))).padStart(2, '0'),
        s: String(Math.max(0, Math.floor((dist % 60000) / 1000))).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <header className="hero" id="home">
        <div className="container">
          <div className="bismillah">
            <i className="fas fa-mosque" />
            <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <i className="fas fa-mosque" />
          </div>
          <div className="hero-badge">
            <i className="fas fa-star-and-crescent" /> Academic Year 1448 / 2026
          </div>
          <h1>
            Hidayat Academy
            <span className="accent">Islamic Entrance Exam</span>
          </h1>
          <p>
            Begin your journey of sacred knowledge. Apply for admission to Hidayat Academy&apos;s
            comprehensive Islamic studies programme — Qur&apos;an, Hadith, Fiqh, Aqeedah, and Arabic.
          </p>
          <div className="hero-actions">
            <a href="#apply" className="btn btn-primary">
              <i className="fas fa-pen-to-square" /> Start Application
            </a>
            <a href="#guidelines" className="btn btn-outline">
              <i className="fas fa-book-open-reader" /> Exam Guidelines
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">30</div>
              <div className="stat-label">Juz&apos; Curriculum</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">5+</div>
              <div className="stat-label">Exam Centers</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">2</div>
              <div className="stat-label">Exam Languages</div>
            </div>
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="countdown-box">
            <div className="countdown-label">
              <i className="fas fa-hourglass-half" /> Application Deadline
            </div>
            <div className="countdown-timer">
              <div className="countdown-item">
                <span className="countdown-number">{cd.d}</span>
                <span className="countdown-unit">Days</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{cd.h}</span>
                <span className="countdown-unit">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{cd.m}</span>
                <span className="countdown-unit">Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{cd.s}</span>
                <span className="countdown-unit">Seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}