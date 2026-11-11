const items = [
  { icon: 'fa-id-card', title: 'Valid ID Required', desc: 'Bring a printed copy of your Aadhaar card.' },
  { icon: 'fa-clock', title: 'Arrive Early', desc: 'Report 30 minutes before the start time.' },
  { icon: 'fa-shield-halved', title: 'QR Verification', desc: 'Your admit card QR is cryptographically signed.' },
  { icon: 'fa-mobile-screen', title: 'No Electronic Devices', desc: 'Mobile phones prohibited in the hall.' },
  { icon: 'fa-file-pen', title: 'Written & Oral', desc: 'The exam includes written and recitation components.' },
  { icon: 'fa-circle-check', title: 'Results & Admission', desc: 'Results announced within two weeks.' },
];

export default function Guidelines() {
  return (
    <section className="section" id="guidelines">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Before You Apply</span>
          <h2><i className="fas fa-list-check" /> Exam Guidelines</h2>
          <div className="underline" />
        </div>
        <div className="info-grid">
          {items.map((item) => (
            <div className="info-card" key={item.title}>
              <div className="info-icon"><i className={`fas ${item.icon}`} /></div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}