import { createHmac, timingSafeEqual } from 'node:crypto';
import { createAdmitCardToken, hasAdmitCardSigningSecret, isValidAdmitCardDetails } from '@/lib/admit-card-token';

const APPLICATION_FEE_PAISE = 5000;
const RAZORPAY_API = 'https://api.razorpay.com/v1';

export const runtime = 'nodejs';

export async function POST(request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const signingSecret = process.env.ADMIT_CARD_SIGNING_SECRET;

  if (!keyId || !keySecret || !hasAdmitCardSigningSecret(signingSecret)) {
    return Response.json(
      { error: 'Payment verification is not configured. Set the Razorpay and admit-card signing secrets in the deployment environment or .env.local for local development.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid payment verification request.' }, { status: 400 });
  }

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body ?? {};
  if (
    typeof orderId !== 'string' ||
    !/^order_[A-Za-z0-9]+$/.test(orderId) ||
    typeof paymentId !== 'string' ||
    !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
    typeof signature !== 'string' ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return Response.json({ error: 'Payment details are missing or invalid.' }, { status: 400 });
  }

  const expectedSignature = createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const receivedSignature = Buffer.from(signature, 'hex');

  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(receivedSignature, expectedSignature)) {
    return Response.json({ error: 'Razorpay could not verify this payment.' }, { status: 400 });
  }

  const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

  try {
    let response = await fetch(`${RAZORPAY_API}/payments/${paymentId}`, {
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(15000),
    });
    let payment = await response.json();

    if (!response.ok) {
      console.error('Razorpay payment lookup failed:', payment.error?.code || response.status);
      return Response.json({ error: 'Could not confirm payment status with Razorpay.' }, { status: 502 });
    }

    if (payment.order_id !== orderId || payment.amount !== APPLICATION_FEE_PAISE || payment.currency !== 'INR') {
      return Response.json({ error: 'Payment details do not match the application fee.' }, { status: 400 });
    }

    if (payment.status === 'authorized') {
      response = await fetch(`${RAZORPAY_API}/payments/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: APPLICATION_FEE_PAISE, currency: 'INR' }),
        signal: AbortSignal.timeout(15000),
      });
      payment = await response.json();

      if (!response.ok) {
        console.error('Razorpay payment capture failed:', payment.error?.code || response.status);
        return Response.json(
          { error: 'Payment was authorized but could not be captured. Contact admissions before trying again.' },
          { status: 502 }
        );
      }
    }

    if (
      payment.order_id !== orderId ||
      payment.amount !== APPLICATION_FEE_PAISE ||
      payment.currency !== 'INR' ||
      payment.status !== 'captured' ||
      payment.captured !== true
    ) {
      return Response.json(
        { error: 'Razorpay has not confirmed a captured ₹50 payment. Contact admissions before trying again.' },
        { status: 409 }
      );
    }

    const orderResponse = await fetch(`${RAZORPAY_API}/orders/${orderId}`, {
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(15000),
    });
    const order = await orderResponse.json();
    if (!orderResponse.ok) {
      console.error('Razorpay order lookup failed:', order.error?.code || orderResponse.status);
      return Response.json(
        { error: 'Payment was captured, but the application could not be confirmed. Contact admissions before retrying.' },
        { status: 502 }
      );
    }

    const notes = order.notes ?? {};
    const admitCardDetails = {
      applicationNo: notes.application_number,
      rollNumber: notes.roll_number,
      fullName: notes.applicant_name,
      examCenter: notes.exam_center,
      examDate: notes.exam_date,
      examSlot: notes.exam_slot,
      examTime: notes.exam_time,
      room: Number(notes.room),
      seat: Number(notes.seat),
    };

    if (
      order.id !== orderId ||
      order.amount !== APPLICATION_FEE_PAISE ||
      order.currency !== 'INR' ||
      order.receipt !== admitCardDetails.applicationNo ||
      !isValidAdmitCardDetails(admitCardDetails)
    ) {
      console.error('Captured Razorpay payment has invalid application order details:', orderId);
      return Response.json(
        { error: 'Payment was captured, but the application details could not be confirmed. Contact admissions before retrying.' },
        { status: 409 }
      );
    }

    const admitCardToken = createAdmitCardToken(admitCardDetails, payment.id, signingSecret);

    return Response.json({
      verified: true,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      admitCardToken,
    });
  } catch (error) {
    console.error('Razorpay payment verification request failed:', error);
    return Response.json(
      { error: 'Could not finish payment verification. Do not pay again until the payment status is checked with admissions.' },
      { status: 502 }
    );
  }
}
