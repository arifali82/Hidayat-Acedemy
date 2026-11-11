'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CENTERS, SLOT_TIMES, STEP_TITLES, TOTAL_STEPS, DRAFT_KEY, APP_PREFIX, MIN_FORM_TIME } from '@/lib/constants';
import { validateAadhaar, simpleHash, formatExamDate, formatRelative, generateRollNumber } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

let razorpayScriptPromise;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve();
      else reject(new Error('Razorpay Checkout could not be loaded. Please try again.'));
    };
    script.onerror = () => reject(new Error('Could not load Razorpay Checkout. Check your internet connection and try again.'));
    document.body.appendChild(script);
  }).catch((error) => {
    razorpayScriptPromise = null;
    throw error;
  });

  return razorpayScriptPromise;
}

function AdmitCard({ data, watermark, verifyToken }) {
  return (
    <div className="admit-card-paper" style={{ position: 'relative' }}>
      {watermark && (
        <div className="preview-watermark" style={{ display: 'flex' }}>
          <span>Preview</span>
        </div>
      )}
      <div className="card-header">
        <div className="header-photo">
          {data.photo ? <img src={data.photo} alt="Candidate" /> : <><i className="fas fa-camera" /><span>AFFIX<br />PHOTO</span></>}
        </div>
        <div className="header-center">
          <h1>Hidayat Academy</h1>
          <div className="sub">Islamic Entrance Exam · 1448 / 2026</div>
          <div className="roll-badge">Roll No. <strong>{data.rollNumber}</strong></div>
        </div>
        <div className="header-qr">
          <div className="qr-frame">
            <QRCodeSVG
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify?token=${encodeURIComponent(verifyToken || '')}`}
              size={96}
              level="H"
              bgColor="#ffffff"
              fgColor="#0d2418"
            />
          </div>
          <div className="qr-label"><i className="fas fa-shield-halved" /> Scan to Verify</div>
        </div>
      </div>
      <div className="card-body">
        <div className="bismillah-line"><i className="fas fa-mosque" /> بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ <i className="fas fa-mosque" /></div>
        <div className="info-grid">
          <div className="info-item"><span className="label">Full Name</span><span className="value">{data.fullName || '—'}</span></div>
          <div className="info-item"><span className="label">Father / Guardian</span><span className="value">{data.fatherName || '—'}</span></div>
          <div className="info-item"><span className="label">Application No.</span><span className="value small">{data.applicationNo}</span></div>
          <div className="info-item"><span className="label">Date of Birth</span><span className="value">{data.dob}</span></div>
          <div className="info-item"><span className="label">Gender</span><span className="value">{data.gender}</span></div>
          <div className="info-item"><span className="label">Mobile</span><span className="value small">{data.phone}</span></div>
          <div className="info-item"><span className="label">Qur&apos;an Memorization</span><span className="value">{data.memorized}</span></div>
          <div className="info-item"><span className="label">Tajweed Level</span><span className="value">{data.tajweed}</span></div>
          <div className="info-item"><span className="label">Exam Language</span><span className="value">{data.examLanguage}</span></div>
          <div className="info-item"><span className="label">Aadhaar (masked)</span><span className="value small">{data.aadhaarMasked}</span></div>
        </div>
        <div className="highlight-box">
          <div className="exam-center">
            <i className="fas fa-location-dot" />
            <div>
              <span>{data.examCenter} · {data.examSlot}</span>
              <div className="seat-badge"><i className="fas fa-chair" /> Room {data.room} · Seat {data.seat}</div>
              <div className="report-hint"><i className="fas fa-clock" /> Report 30 min before start</div>
            </div>
          </div>
          <div className="exam-date">
            <i className="fas fa-calendar-day" />
            <div className="date-block">
              <span className="date-main">{formatExamDate(data.examDate)}</span>
              <span className="date-time"><i className="fas fa-clock" /> <span>{data.examTime}</span></span>
            </div>
          </div>
        </div>
        <div className="signature-bottom">
          <div className="verify-note"><i className="fas fa-shield-halved" /><span>Digitally signed. Scan the QR to verify authenticity online.</span></div>
          <div className="signature-area">
            <div className="auth">Authorised Signatory</div>
            <div className="signature-line" />
            <div>Hidayat Academy</div>
          </div>
        </div>
        <div className="instructions">
          <h4><i className="fas fa-list-check" /> Important Instructions</h4>
          <ul>
            <li><i className="fas fa-circle-check" /> Bring this admit card &amp; valid photo ID.</li>
            <li><i className="fas fa-circle-check" /> Report 30 minutes before exam time.</li>
            <li><i className="fas fa-circle-check" /> No electronic devices allowed.</li>
            <li><i className="fas fa-circle-check" /> Written &amp; oral recitation components.</li>
            <li><i className="fas fa-circle-check" /> Use blue/black ballpoint pen only.</li>
            <li><i className="fas fa-circle-check" /> Results within two weeks.</li>
          </ul>
        </div>
      </div>
      <div className="card-footer">
        <div className="footer-note"><i className="fas fa-star-and-crescent" /><span>www.hidayatacademy.org · admissions@hidayatacademy.org</span></div>
        <div className="arabic">وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ</div>
      </div>
    </div>
  );
}

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [toast, setToast] = useState(null);
  const [draftBanner, setDraftBanner] = useState(null);
  const [admitCard, setAdmitCard] = useState(null);
  const [paymentScreen, setPaymentScreen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [appData, setAppData] = useState(null);
  const [verifyToken, setVerifyToken] = useState(null);
  const [formValues, setFormValues] = useState({});
  const formStartTime = useRef(null);
  const isDirty = useRef(false);
  const toastTimer = useRef(null);

  const saveDraft = useCallback(() => {
    if (!isDirty.current) return;
    const draft = { _ts: Date.now() };
    ['fullName','fatherName','dob','nationality','aadhaar','email','phone','address','city','pincode','memorized','tajweed','examDate','examCenter','examSlot','notes'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) draft[id] = el.value;
    });
    draft.gender = document.querySelector('input[name="gender"]:checked')?.value || '';
    draft.examLanguage = document.querySelector('input[name="examLanguage"]:checked')?.value || '';
    draft.interests = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .filter((c) => c.value)
      .map((c) => c.value);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      isDirty.current = false;
    } catch (error) {
      console.error('Unable to save the application draft.', error);
    }
  }, []);

  useEffect(() => {
    formStartTime.current = Date.now();
    let initialValues = {};
    const examDateEl = document.getElementById('examDate');
    if (examDateEl && !examDateEl.value) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      examDateEl.value = d.toISOString().split('T')[0];
      examDateEl.min = new Date().toISOString().split('T')[0];
      initialValues.examDate = examDateEl.value;
    }
    const dobEl = document.getElementById('dob');
    if (dobEl) dobEl.max = new Date().toISOString().split('T')[0];

    let restoredDraft = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Date.now() - d._ts < 7 * 24 * 60 * 60 * 1000) restoredDraft = { ts: d._ts, data: d };
      }
    } catch (error) {
      console.error('Unable to load the saved application draft.', error);
    }

    const frame = window.requestAnimationFrame(() => {
      if (Object.keys(initialValues).length) {
        setFormValues((previous) => ({ ...initialValues, ...previous }));
      }
      if (restoredDraft) setDraftBanner(restoredDraft);
    });
    const id = setInterval(saveDraft, 10000);
    return () => {
      window.cancelAnimationFrame(frame);
      clearInterval(id);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [saveDraft]);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const applyDraft = () => {
    if (!draftBanner) return;
    const d = draftBanner.data;
    setFormValues((previous) => ({ ...previous, ...d }));
    ['fullName','fatherName','dob','nationality','aadhaar','email','phone','address','city','pincode','memorized','tajweed','examDate','examCenter','examSlot','notes'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && d[id] !== undefined) el.value = d[id];
    });
    if (d.gender) {
      const r = document.querySelector(`input[name="gender"][value="${d.gender}"]`);
      if (r) r.checked = true;
    }
    if (d.examLanguage) {
      const r = document.querySelector(`input[name="examLanguage"][value="${d.examLanguage}"]`);
      if (r) r.checked = true;
    }
    (d.interests || []).forEach((v) => {
      const cb = Array.from(document.querySelectorAll('input[type="checkbox"]')).find((c) => c.value === v);
      if (cb) cb.checked = true;
    });
    setDraftBanner(null);
    showToast('Draft restored');
  };

  const updateCenterHint = () => {
    const center = document.getElementById('examCenter')?.value;
    const slot = document.getElementById('examSlot')?.value;
    const centerHint = document.getElementById('centerHint');
    const centerMeter = document.getElementById('centerMeter');
    const slotHint = document.getElementById('slotHint');
    const slotMeter = document.getElementById('slotMeter');
    if (!center) {
      if (centerHint) centerHint.textContent = 'Each center has limited seats. Choose early.';
      if (centerMeter) centerMeter.style.width = '0%';
      return;
    }
    const cap = CENTERS[center];
    if (!cap) return;
    const seed = simpleHash(center);
    const used = parseInt(seed.slice(0, 4), 16) % cap.capacity;
    const left = cap.capacity - used;
    const pct = left / cap.capacity;
    if (centerHint) {
      centerHint.textContent = pct < 0.15 ? `⚠ Only ${left} seats left!` : `${left} of ${cap.capacity} seats available.`;
      centerHint.className = pct < 0.15 ? 'capacity-hint danger' : pct < 0.4 ? 'capacity-hint warn' : 'capacity-hint';
    }
    if (centerMeter) {
      centerMeter.style.width = pct * 100 + '%';
      centerMeter.className = pct < 0.15 ? 'seat-fill low' : 'seat-fill';
    }
    if (slot && slotHint && slotMeter) {
      const slotTotal = slot === 'Morning' ? cap.morning : cap.afternoon;
      const slotSeed = simpleHash(center + slot);
      const slotUsed = parseInt(slotSeed.slice(0, 4), 16) % slotTotal;
      const slotLeft = slotTotal - slotUsed;
      slotHint.textContent = `${slot} slot: ${slotLeft} / ${slotTotal} seats remaining.`;
      slotMeter.style.width = (slotLeft / slotTotal) * 100 + '%';
    }
  };

  const validateStep = (s) => {
    let valid = true;
    const setErr = (id, msg) => {
      const err = document.getElementById('err-' + id);
      if (err) {
        err.textContent = msg;
        err.classList.add('show');
      }
      valid = false;
    };
    document.querySelectorAll('.field-error').forEach((e) => e.classList.remove('show'));

    if (s === 1) {
      const fullName = document.getElementById('fullName').value.trim();
      if (!fullName || fullName.length < 3) setErr('fullName', 'Enter your full name (min 3 chars).');
      if (!document.getElementById('fatherName').value.trim()) setErr('fatherName', "Father's name is required.");
      const dob = document.getElementById('dob').value;
      if (!dob) setErr('dob', 'Date of birth is required.');
      else {
        const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000);
        if (age < 12) setErr('dob', 'You must be at least 12 years old.');
      }
      if (!document.querySelector('input[name="gender"]:checked')) setErr('gender', 'Please select gender.');
      if (!document.getElementById('nationality').value) setErr('nationality', 'Please select nationality.');
      const aadhaar = document.getElementById('aadhaar').value.trim();
      if (!aadhaar) setErr('aadhaar', 'Aadhaar number is required.');
      else if (!validateAadhaar(aadhaar)) setErr('aadhaar', 'Invalid Aadhaar (checksum failed).');
      if (!photo) setErr('photo', 'Please upload a passport-size photo.');
    }
    if (s === 2) {
      const email = document.getElementById('email').value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('email', 'Enter a valid email address.');
      const phone = document.getElementById('phone').value.replace(/\D/g, '').replace(/^91/, '');
      if (!phone || !/^[6-9]\d{9}$/.test(phone)) setErr('phone', 'Enter a valid 10-digit mobile number.');
    }
    if (s === 3) {
      if (!document.getElementById('memorized').value) setErr('memorized', 'Select memorization level.');
      if (!document.getElementById('tajweed').value) setErr('tajweed', 'Select Tajweed level.');
      if (!document.getElementById('examDate').value) setErr('examDate', 'Select exam date.');
      if (!document.getElementById('examSlot').value) setErr('examSlot', 'Select a slot.');
      if (!document.getElementById('examCenter').value) setErr('examCenter', 'Select an exam center.');
      if (!document.querySelector('input[name="examLanguage"]:checked')) setErr('examLanguage', 'Select exam language.');
    }
    if (!valid) showToast('Please fix the highlighted fields.', 'err');
    return valid;
  };

  const goToStep = (s) => {
    if (s < 1 || s > TOTAL_STEPS) return;
    setStep(s);
    if (s === 3) setTimeout(updateCenterHint, 100);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please upload JPG/PNG.', 'err');
    if (file.size > 2 * 1024 * 1024) return showToast('File too large (max 2MB).', 'err');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target.result);
      showToast('Photo uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (event) => {
    isDirty.current = true;
    const { target } = event;
    const key = target.name || target.id;
    if (!key) return;

    if (target.type === 'radio' && !target.checked) return;
    setFormValues((previous) => ({
      ...previous,
      [key]: target.type === 'checkbox' ? target.checked : target.value,
    }));
  };

  const buildAppData = () => {
    const aadhaar = (formValues.aadhaar || '').replace(/\s/g, '');
    const phone = (formValues.phone || '').replace(/\D/g, '').replace(/^91/, '');
    const slot = formValues.examSlot || '';
    const counter = parseInt(localStorage.getItem('hidayat-app-counter') || '0', 10) + 1;
    return {
      fullName: (formValues.fullName || '').trim(),
      fatherName: (formValues.fatherName || '').trim(),
      dob: formValues.dob || '',
      gender: formValues.gender || '—',
      nationality: formValues.nationality || '',
      aadhaarMasked: aadhaar.slice(0, 4) + ' **** **** ' + aadhaar.slice(-4),
      aadhaarHash: simpleHash(aadhaar),
      email: (formValues.email || '').trim(),
      phone,
      city: (formValues.city || '').trim(),
      pincode: (formValues.pincode || '').trim(),
      address: (formValues.address || '').trim(),
      memorized: formValues.memorized || '',
      tajweed: formValues.tajweed || '',
      examDate: formValues.examDate || '',
      examSlot: slot,
      examTime: SLOT_TIMES[slot] || '',
      examCenter: formValues.examCenter || '',
      examLanguage: formValues.examLanguage || 'English',
      interests: Array.isArray(formValues.interests) ? formValues.interests : [],
      notes: (formValues.notes || '').trim(),
      photo,
      applicationNo: '2026' + String(counter).padStart(6, '0'),
      rollNumber: generateRollNumber(),
      room: 1 + (parseInt(simpleHash(phone).slice(0, 2), 16) % 8),
      seat: 1 + (parseInt(simpleHash(phone).slice(2, 4), 16) % 40),
      status: 'pending_payment',
      createdAt: Date.now(),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formStartTime.current || Date.now() - formStartTime.current < MIN_FORM_TIME) return showToast('Please take your time.', 'err');
    if (!document.getElementById('dataConsent').checked) return showToast('Please accept Privacy Policy.', 'err');
    if (!document.getElementById('declaration').checked) return showToast('Please confirm declaration.', 'err');
    setAppData(buildAppData());
    setPaymentScreen(true);
  };

  const finishVerifiedPayment = (paymentId, admitCardToken) => {
    const paid = {
      ...appData,
      status: 'active',
      paidAt: Date.now(),
      paymentId,
      paymentAmount: 5000,
      paymentCurrency: 'INR',
    };

    let storageFailed = false;
    try {
      localStorage.setItem(APP_PREFIX + paid.rollNumber, JSON.stringify(paid));
      localStorage.setItem('hidayat-app-counter', String(parseInt(paid.applicationNo.slice(4), 10)));
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('Verified application could not be saved in this browser:', error);
      storageFailed = true;
    }

    setVerifyToken(admitCardToken);
    setAdmitCard(paid);
    setPaymentScreen(false);
    showToast(
      storageFailed
        ? 'Payment verified. Keep this admit card open; browser storage is unavailable.'
        : 'Payment verified! Your admit card is ready.'
    );
  };

  const handlePayment = async () => {
    if (!appData || paymentProcessing) return;
    setPaymentError('');
    setPaymentProcessing(true);

    try {
      await loadRazorpayCheckout();
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationNumber: appData.applicationNo,
          customerName: appData.fullName,
          email: appData.email,
          phone: appData.phone,
          rollNumber: appData.rollNumber,
          examCenter: appData.examCenter,
          examDate: appData.examDate,
          examSlot: appData.examSlot,
          examTime: appData.examTime,
          room: appData.room,
          seat: appData.seat,
        }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || 'Could not start payment. Please try again.');

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Hidayat Academy',
        description: 'Islamic Entrance Exam application fee',
        order_id: order.orderId,
        prefill: {
          name: appData.fullName,
          email: appData.email,
          contact: appData.phone,
        },
        notes: { application_number: appData.applicationNo },
        theme: { color: '#1f5e3a' },
        handler: async (paymentResponse) => {
          setPaymentProcessing(true);
          setPaymentError('');
          try {
            const verificationResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentResponse),
            });
            const verification = await verificationResponse.json();
            if (
              !verificationResponse.ok ||
              verification.verified !== true ||
              typeof verification.admitCardToken !== 'string'
            ) {
              throw new Error(verification.error || 'Payment has not been verified.');
            }
            finishVerifiedPayment(verification.paymentId, verification.admitCardToken);
          } catch (error) {
            console.error('Payment verification failed:', error);
            setPaymentError(
              `${error.message} Do not pay again until the payment status is checked. Payment ID: ${paymentResponse.razorpay_payment_id || 'not provided'}`
            );
          } finally {
            setPaymentProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setPaymentProcessing(false),
        },
      });

      checkout.on('payment.failed', (event) => {
        setPaymentError(event.error?.description || 'Payment was not completed. You can try again.');
        setPaymentProcessing(false);
      });
      checkout.open();
      setPaymentProcessing(false);
    } catch (error) {
      console.error('Unable to start Razorpay Checkout:', error);
      setPaymentError(error.message || 'Unable to start payment. Please try again.');
      setPaymentProcessing(false);
    }
  };

  if (paymentScreen && appData) {
    return (
      <section className="section" id="apply">
        <div className="container">
          <div className="center-box" style={{ marginTop: '2rem' }}>
            <div className="icon-big">💳</div>
            <h2>Application Fee</h2>
            <p>Secure payment for your entrance exam application</p>
            <div className="amount-box">
              <div className="amount-label">Total Amount</div>
              <div className="amount-value">₹50</div>
              <div className="amount-hint">Non-refundable application fee</div>
            </div>
            <div className="summary-box">
              <div className="summary-row"><span>Application No.</span><span>{appData.applicationNo}</span></div>
              <div className="summary-row"><span>Roll No.</span><span>{appData.rollNumber}</span></div>
              <div className="summary-row"><span>Applicant</span><span>{appData.fullName}</span></div>
              <div className="summary-row"><span>Center</span><span>{appData.examCenter}</span></div>
              <div className="summary-row"><span>Slot</span><span>{appData.examSlot}</span></div>
            </div>
            {paymentError && <p className="payment-error" role="alert">{paymentError}</p>}
            <button className="btn-submit" onClick={handlePayment} disabled={paymentProcessing} style={{ width: '100%' }}>
              <i className="fas fa-lock" />
              {paymentProcessing ? 'Connecting to Razorpay…' : 'Pay ₹50 Securely with Razorpay'}
            </button>
            <button className="back-link" onClick={() => setPaymentScreen(false)} style={{ marginTop: '1rem' }}>
              ← Edit application
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (admitCard) {
    return (
      <section className="section" id="apply">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Success</span>
            <h2><i className="fas fa-circle-check" /> Your Admit Card</h2>
            <div className="underline" />
          </div>
          <div className="admit-card-preview show">
            <AdmitCard data={admitCard} watermark={false} verifyToken={verifyToken} />
            <div className="admit-card-actions">
              <button className="btn-action btn-print" onClick={() => window.print()}>
                <i className="fas fa-print" /> Print / Save PDF
              </button>
              <button className="btn-action btn-new" onClick={() => location.reload()}>
                <i className="fas fa-plus-circle" /> New Application
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" id="apply">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Admission Open</span>
          <h2><i className="fas fa-file-signature" /> Entrance Exam Application</h2>
          <div className="underline" />
        </div>

        <div className="form-wrapper">
          <div className="form-header">
            <h2><i className="fas fa-mosque" /> Hidayat Academy</h2>
            <p>Fields marked <span style={{ color: 'var(--danger)', fontWeight: 700 }}>*</span> are mandatory.</p>
          </div>

          {draftBanner && (
            <div className="restore-banner show">
              <i className="fas fa-rotate-left" />
              <span>We found a saved draft from <strong>{formatRelative(draftBanner.ts)}</strong>. Restore it?</span>
              <div className="rb-actions">
                <button onClick={applyDraft}>Restore</button>
                <button onClick={() => { localStorage.removeItem(DRAFT_KEY); setDraftBanner(null); }}>Start fresh</button>
              </div>
            </div>
          )}

          <div className="progress-line">
            <span>Step {step} of {TOTAL_STEPS} · {STEP_TITLES[step - 1]}</span>
            <span className="pct">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>

          <div className="form-steps">
            <div className="step-progress" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`form-step ${step === n ? 'active' : ''} ${n < step ? 'completed' : ''}`}>
                <div className="step-circle">
                  {n < step ? <i className="fas fa-check" /> : <span>{n}</span>}
                </div>
                <div className="step-label">{['Personal', 'Contact', 'Education', 'Review'][n - 1]}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} onChange={handleFormChange}>
            {step === 1 && (
              <div className="form-panel active">
                <div className="form-grid">
                  <div className="section-title"><i className="fas fa-user-circle" /> Personal Information</div><hr />
                  <div className="form-group">
                    <label><i className="fas fa-user" /> Full Name <span className="required-star">*</span></label>
                    <input type="text" id="fullName" placeholder="Muhammad Abdullah" required />
                    <div className="field-error" id="err-fullName" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-user-tie" /> Father Name <span className="required-star">*</span></label>
                    <input type="text" id="fatherName" placeholder="Abdul Karim" required />
                    <div className="field-error" id="err-fatherName" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-calendar-alt" /> Date of Birth <span className="required-star">*</span></label>
                    <input type="date" id="dob" required min="1925-01-01" />
                    <div className="field-error" id="err-dob" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-venus-mars" /> Gender <span className="required-star">*</span></label>
                    <div className="radio-group">
                      <label className="radio-option"><input type="radio" name="gender" value="male" /> Male</label>
                      <label className="radio-option"><input type="radio" name="gender" value="female" /> Female</label>
                    </div>
                    <div className="field-error" id="err-gender" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-globe" /> Nationality <span className="required-star">*</span></label>
                    <select id="nationality" required>
                      <option value="">Select nationality</option>
                      <option>Indian</option><option>American</option><option>Afghani</option>
                      <option>Saudi</option><option>Egyptian</option><option>Indonesian</option>
                      <option>Malaysian</option><option>Nigerian</option><option>Turkish</option><option>Other</option>
                    </select>
                    <div className="field-error" id="err-nationality" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-id-card" /> Aadhaar No. <span className="required-star">*</span></label>
                    <input type="text" id="aadhaar" placeholder="1234 5678 9012" required maxLength={14} />
                    <div className="field-error" id="err-aadhaar" />
                  </div>
                  <div className="form-group full-width">
                    <label><i className="fas fa-camera" /> Passport Photo <span className="required-star">*</span></label>
                    <label className="photo-drop" htmlFor="photoInput">
                      <input type="file" id="photoInput" accept="image/*" onChange={(e) => e.target.files?.[0] && handlePhotoFile(e.target.files[0])} />
                      <div className="photo-preview">
                        {photo ? <img src={photo} alt="Preview" /> : <i className="fas fa-cloud-arrow-up" />}
                      </div>
                      <div className="photo-drop-text">
                        <strong>Click to upload</strong> or drag &amp; drop<br />
                        <span>JPG/PNG · max 2MB</span>
                      </div>
                    </label>
                    <div className="field-error" id="err-photo" />
                  </div>
                </div>
                <div className="form-nav">
                  <button type="button" className="btn-nav btn-nav-prev" disabled><i className="fas fa-arrow-left" /> Previous</button>
                  <button type="button" className="btn-nav btn-nav-next" onClick={() => validateStep(1) && goToStep(2)}>
                    Next <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-panel active">
                <div className="form-grid">
                  <div className="section-title"><i className="fas fa-address-book" /> Contact &amp; Address</div><hr />
                  <div className="form-group">
                    <label><i className="fas fa-envelope" /> Email <span className="required-star">*</span></label>
                    <input type="email" id="email" required />
                    <div className="field-error" id="err-email" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-phone" /> Mobile <span className="required-star">*</span></label>
                    <input type="tel" id="phone" required />
                    <div className="field-error" id="err-phone" />
                  </div>
                  <div className="form-group full-width">
                    <label><i className="fas fa-home" /> Address</label>
                    <textarea id="address" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-city" /> City</label>
                    <input type="text" id="city" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-map-pin" /> PIN Code</label>
                    <input type="text" id="pincode" maxLength={6} />
                  </div>
                </div>
                <div className="form-nav">
                  <button type="button" className="btn-nav btn-nav-prev" onClick={() => goToStep(1)}><i className="fas fa-arrow-left" /> Previous</button>
                  <button type="button" className="btn-nav btn-nav-next" onClick={() => validateStep(2) && goToStep(3)}>
                    Next <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-panel active">
                <div className="form-grid">
                  <div className="section-title"><i className="fas fa-quran" /> Islamic Education</div><hr />
                  <div className="form-group">
                    <label><i className="fas fa-book" /> Qur&apos;an Memorization <span className="required-star">*</span></label>
                    <select id="memorized" required>
                      <option value="">Select Juz</option>
                      <option value="0-5">0 – 5 Juz</option>
                      <option value="6-10">6 – 10 Juz</option>
                      <option value="11-15">11 – 15 Juz</option>
                      <option value="16-20">16 – 20 Juz</option>
                      <option value="21-25">21 – 25 Juz</option>
                      <option value="26-30">26 – 30 Juz (Hafiz)</option>
                    </select>
                    <div className="field-error" id="err-memorized" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-check-circle" /> Tajweed Level <span className="required-star">*</span></label>
                    <select id="tajweed" required>
                      <option value="">Select level</option>
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Ijazah</option>
                    </select>
                    <div className="field-error" id="err-tajweed" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-calendar-day" /> Exam Date <span className="required-star">*</span></label>
                    <input type="date" id="examDate" required />
                    <div className="field-error" id="err-examDate" />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-clock" /> Slot <span className="required-star">*</span></label>
                    <select id="examSlot" required onChange={updateCenterHint}>
                      <option value="">Select slot</option>
                      <option>Morning</option>
                      <option>Afternoon</option>
                    </select>
                    <div className="capacity-hint" id="slotHint">Seats after selecting center.</div>
                    <div className="seat-meter"><div className="seat-fill" id="slotMeter" style={{ width: 0 }} /></div>
                    <div className="field-error" id="err-examSlot" />
                  </div>
                  <div className="form-group full-width">
                    <label><i className="fas fa-location-dot" /> Exam Center <span className="required-star">*</span></label>
                    <select id="examCenter" required onChange={updateCenterHint}>
                      <option value="">Select center</option>
                      <option value="Sirsaganj">Sirsaganj (Firozabad)</option>
                      <option value="Karhel">Karhel (Delhi)</option>
                      <option value="Shikohabad">Shikohabad (Mumbai)</option>
                      <option value="Firozabad">Firozabad (Hyderabad)</option>
                      <option value="Mainpuri">Mainpuri (Lucknow)</option>
                    </select>
                    <div className="capacity-hint" id="centerHint">Each center has limited seats.</div>
                    <div className="seat-meter"><div className="seat-fill" id="centerMeter" style={{ width: 0 }} /></div>
                    <div className="field-error" id="err-examCenter" />
                  </div>
                  <div className="form-group full-width">
                    <label><i className="fas fa-language" /> Exam Language <span className="required-star">*</span></label>
                    <div className="radio-group">
                      <label className="radio-option"><input type="radio" name="examLanguage" value="English" /> English</label>
                      <label className="radio-option"><input type="radio" name="examLanguage" value="Hindi" /> हिन्दी</label>
                    </div>
                    <div className="field-error" id="err-examLanguage" />
                  </div>
                  <div className="form-group full-width">
                    <label><i className="fas fa-pencil-alt" /> Notes</label>
                    <textarea id="notes" maxLength={500} />
                  </div>
                </div>
                <div className="form-nav">
                  <button type="button" className="btn-nav btn-nav-prev" onClick={() => goToStep(2)}><i className="fas fa-arrow-left" /> Previous</button>
                  <button type="button" className="btn-nav btn-nav-next" onClick={() => validateStep(3) && goToStep(4)}>
                    Review <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="form-panel active">
                <div className="form-grid">
                  <div className="section-title"><i className="fas fa-clipboard-check" /> Review &amp; Submit</div><hr />
                  <div style={{ gridColumn: '1 / -1', background: 'var(--green-pale)', borderRadius: 16, padding: '1.2rem' }}>
                    <h4 style={{ fontFamily: 'Merriweather, serif', color: 'var(--green-dark)', marginBottom: '.7rem' }}>
                      Please verify your details above. Once paid, changes are not allowed.
                    </h4>
                  </div>
                  <div className="form-group full-width">
                    <div className="consent-row">
                      <input type="checkbox" id="dataConsent" required />
                      <span>I consent to processing my personal data (including Aadhaar). <span className="required-star">*</span></span>
                    </div>
                    <div className="consent-row">
                      <input type="checkbox" id="declaration" required />
                      <span>I declare that the information is accurate. <span className="required-star">*</span></span>
                    </div>
                  </div>
                  <button type="submit" className="btn-submit">
                    <i className="fas fa-paper-plane" /> Continue to Payment
                  </button>
                </div>
                <div className="form-nav">
                  <button type="button" className="btn-nav btn-nav-prev" onClick={() => goToStep(3)}><i className="fas fa-arrow-left" /> Previous</button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {toast && (
        <div className={`toast show ${toast.type === 'err' ? 'error' : ''}`}>
          <i className={`fas ${toast.type === 'err' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} />
          <span>{toast.msg}</span>
        </div>
      )}
    </section>
  );
}