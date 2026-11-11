'use client';
import { useState } from 'react';

const faqs = [
  { q: 'What is the eligibility criteria?', a: "Open to students aged 12+ with basic Qur'anic foundation." },
  { q: 'Is there an application fee?', a: 'Yes, ₹50 non-refundable application fee.' },
  { q: 'How does QR verification work?', a: 'Each admit card has a cryptographically signed QR that opens a verification page.' },
  { q: 'What if I lose my admit card?', a: 'Use the Recover link in navigation. Enter your details to re-download.' },
  { q: 'Can I change my exam center?', a: 'Contact admissions within 7 days of submission.' },
  { q: 'How will I know my exam date?', a: 'Your admit card displays the exact date and time.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Need Help?</span>
          <h2><i className="fas fa-circle-question" /> Frequently Asked Questions</h2>
          <div className="underline" />
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item ${open === i ? 'open' : ''}`} key={i}>
              <div className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <i className="fas fa-chevron-down" />
              </div>
              <div className="faq-answer"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}