'use client';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const frame = window.requestAnimationFrame(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    window.addEventListener('scroll', onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-switching');
    const isDark = document.documentElement.classList.toggle('dark');
    setDark(isDark);
    setTimeout(() => document.documentElement.classList.remove('theme-switching'), 600);
    try {
      localStorage.setItem('hidayat-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Unable to save the theme preference.', error);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#home" className="brand">
          <div className="brand-icon"><i className="fas fa-mosque" /></div>
          <div className="brand-text">
            <span className="brand-name">Hidayat Academy</span>
            <span className="brand-tag">Guidance · Knowledge · Light</span>
          </div>
        </a>
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#home"><i className="fas fa-house" /> Home</a></li>
          <li><a href="#about"><i className="fas fa-circle-info" /> About</a></li>
          <li><a href="#apply"><i className="fas fa-file-pen" /> Apply</a></li>
          <li><a href="#guidelines"><i className="fas fa-list-check" /> Guidelines</a></li>
          <li><a href="#faq"><i className="fas fa-circle-question" /> FAQ</a></li>
          <li><a href="#apply" className="nav-cta"><i className="fas fa-paper-plane" /> Apply Now</a></li>
        </ul>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
            aria-pressed={dark}
          >
            <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'}`} />
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <i className={`fas ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}