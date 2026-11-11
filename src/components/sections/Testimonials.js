const data = [
  { name: 'Muhammad Ahmad', role: 'Hafiz Student', text: "The structured Qur'an program completely transformed my relationship with the Book of Allah." },
  { name: 'Fatima Khan', role: 'Fiqh Student', text: 'The bilingual exam option made it easier. The application process was smooth.' },
  { name: 'Abdur Rahman', role: 'Hadith Student', text: 'I applied from Firozabad and the center was convenient. Truly inspiring.' },
];

export default function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Student Voices</span>
          <h2><i className="fas fa-quote-left" /> What Our Students Say</h2>
          <div className="underline" />
        </div>
        <div className="testimonials-grid">
          {data.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <i className="fas fa-quote-right testimonial-quote" />
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <i className="fas fa-star" key={i} />)}
              </div>
              <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name.split(' ').map((n) => n[0]).join('')}</div>
                <div className="testimonial-info">
                  <h5>{t.name}</h5>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}