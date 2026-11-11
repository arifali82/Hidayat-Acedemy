import { hasAdmitCardSigningSecret, isValidAdmitCardDetails } from '@/lib/admit-card-token';

const APPLICATION_FEE_PAISE = 5000;

export const runtime = 'nodejs';

export async function POST(request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const signingSecret = process.env.ADMIT_CARD_SIGNING_SECRET;

  if (!keyId || !keySecret || !hasAdmitCardSigningSecret(signingSecret)) {
    return Response.json(
      {
        error: 'Razorpay checkout is not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and ADMIT_CARD_SIGNING_SECRET in the deployment environment or .env.local for local development.',
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid payment request.' }, { status: 400 });
  }

  const {
    applicationNumber,
    rollNumber,
    customerName,
    email,
    phone,
    examCenter,
    examDate,
    examSlot,
    examTime,
    room,
    seat,
  } = body ?? {};
  const normalizedPhone = typeof phone === 'string' ? phone.replace(/\D/g, '').replace(/^91/, '') : '';
  const admitCardDetails = {
    applicationNo: applicationNumber,
    rollNumber,
    fullName: customerName,
    examCenter,
    examDate,
    examSlot,
    examTime,
    room: Number(room),
    seat: Number(seat),
  };
  const examDateIsFuture =
    typeof examDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(examDate) &&
    examDate >= new Date().toISOString().slice(0, 10);

  if (
    !isValidAdmitCardDetails(admitCardDetails) ||
    !examDateIsFuture ||
    typeof email !== 'string' ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[6-9]\d{9}$/.test(normalizedPhone)
  ) {
    return Response.json({ error: 'Application details are incomplete or invalid.' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: APPLICATION_FEE_PAISE,
        currency: 'INR',
        receipt: applicationNumber,
        notes: {
          application_number: applicationNumber,
          roll_number: rollNumber,
          applicant_name: customerName.trim(),
          exam_center: examCenter,
          exam_date: examDate,
          exam_slot: examSlot,
          exam_time: examTime,
          room: String(admitCardDetails.room),
          seat: String(admitCardDetails.seat),
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    const order = await response.json();
    if (!response.ok || order.amount !== APPLICATION_FEE_PAISE || order.currency !== 'INR' || !order.id) {
      console.error('Razorpay order creation failed:', order.error?.code || response.status);
      return Response.json({ error: 'Razorpay could not create the payment order. Please try again.' }, { status: 502 });
    }

    return Response.json({
      keyId,
      orderId: order.id,
      amount: APPLICATION_FEE_PAISE,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Razorpay order request failed:', error);
    return Response.json({ error: 'Could not connect to Razorpay. Please try again.' }, { status: 502 });
  }
}
