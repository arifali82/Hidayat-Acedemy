const cards = [
  { icon: 'fa-quran', title: "Qur'anic Excellence", desc: 'Structured memorization and Tajweed programme from beginner to Ijazah level.' },
  { icon: 'fa-scale-balanced', title: 'Authentic Scholarship', desc: 'Fiqh, Hadith, and Aqeedah taught according to traditional Islamic scholarship.' },
  { icon: 'fa-language', title: 'Bilingual Exams', desc: 'Choose to appear in English or Hindi — making the exam accessible to all.' },
  { icon: 'fa-shield-halved', title: 'QR Verification', desc: 'Every admit card is digitally signed and scannable for instant authenticity checks.' },
];

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why Hidayat Academy</span>
          <h2><i className="fas fa-graduation-cap" /> A Path of Guidance</h2>
          <div className="underline" />
        </div>
        <div className="about-grid">
          {cards.map((c) => (
            <div className="about-card" key={c.title}>
              <div className="about-icon"><i className={`fas ${c.icon}`} /></div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}