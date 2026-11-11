export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              <div className="brand-icon"><i className="fas fa-mosque" /></div>
              <div className="brand-text">
                <span className="brand-name">Hidayat Academy</span>
                <span className="brand-tag">Guidance · Knowledge · Light</span>
              </div>
            </div>
            <p>Dedicated to nurturing the next generation of Islamic scholars through authentic knowledge and academic excellence.</p>
          </div>
          <div className="footer-col">
            <h4><i className="fas fa-compass" /> Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home"><i className="fas fa-chevron-right" /> Home</a></li>
              <li><a href="#about"><i className="fas fa-chevron-right" /> About</a></li>
              <li><a href="#apply"><i className="fas fa-chevron-right" /> Apply Online</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4><i className="fas fa-book" /> Programmes</h4>
            <ul className="footer-links">
              <li><a href="#about"><i className="fas fa-chevron-right" /> Qur&apos;an &amp; Tafsir</a></li>
              <li><a href="#about"><i className="fas fa-chevron-right" /> Hadith Studies</a></li>
              <li><a href="#about"><i className="fas fa-chevron-right" /> Fiqh &amp; Usul</a></li>
              <li><a href="#about"><i className="fas fa-chevron-right" /> Arabic Language</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4><i className="fas fa-address-card" /> Contact</h4>
            <div className="footer-contact-item"><i className="fas fa-location-dot" /> Sirsaganj, Firozabad, UP, India</div>
            <div className="footer-contact-item"><i className="fas fa-envelope" /> admissions@hidayatacademy.org</div>
            <div className="footer-contact-item"><i className="fas fa-phone" /> +91 8273619031</div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="bism">وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ</span>
          © 1448 / 2026 Hidayat Academy. All rights reserved. · Reg. No. UP/SOC/2020/12345
        </div>
      </div>
    </footer>
  );
}