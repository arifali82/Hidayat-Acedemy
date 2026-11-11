import Link from 'next/link';
import { formatExamDate } from '@/lib/utils';
import { verifyAdmitCardToken } from '@/lib/admit-card-token';

export default async function VerifyAdmitCardPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : '';
  const result = verifyAdmitCardToken(token, process.env.ADMIT_CARD_SIGNING_SECRET);

  return (
    <main className="verification-page">
      <section className="verification-panel">
        <div className={`verification-status ${result.valid ? 'verified' : 'unverified'}`}>
          <i className={`fas ${result.valid ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
          {result.valid ? 'Verified admit card' : 'Verification failed'}
        </div>
        <h1>Exam Center Verification</h1>
        {result.valid ? (
          <>
            <p className="verification-message">
              This card has a valid Hidayat Academy signature and was issued after payment confirmation.
            </p>
            <dl className="verification-details">
              <div><dt>Candidate</dt><dd>{result.card.fullName}</dd></div>
              <div><dt>Roll number</dt><dd>{result.card.rollNumber}</dd></div>
              <div><dt>Application number</dt><dd>{result.card.applicationNo}</dd></div>
              <div><dt>Exam center</dt><dd>{result.card.examCenter}</dd></div>
              <div><dt>Exam date</dt><dd>{formatExamDate(result.card.examDate)}</dd></div>
              <div><dt>Session</dt><dd>{result.card.examSlot} · {result.card.examTime}</dd></div>
              <div><dt>Room / seat</dt><dd>{result.card.room} / {result.card.seat}</dd></div>
            </dl>
            <p className="verification-note">Check the candidate&apos;s photo ID before admission.</p>
          </>
        ) : (
          <p className="verification-message" role="alert">
            {result.reason === 'unavailable'
              ? 'The verification service is not configured. Contact Hidayat Academy admissions.'
              : result.reason === 'expired'
                ? 'This QR code has expired. Contact Hidayat Academy admissions to confirm the exam status.'
                : 'This QR code is invalid or has been altered. Do not admit the candidate using this code.'}
          </p>
        )}
        <Link className="verification-home" href="/">Hidayat Academy</Link>
      </section>
    </main>
  );
}
