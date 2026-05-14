import { NextRequest, NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adalyasolar.com';

// POST — İyzico ve PayTR sunucu bildirimleri bu endpoint'e gelir.
// Sorgu parametresi: ?orderId=123
export async function POST(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    let paymentSuccess = false;

    // ── İyzico ────────────────────────────────────────────────────────────
    if (process.env.IYZICO_API_KEY) {
      // İyzico token'ı sunucu tarafında doğrula:
      //
      // const { Iyzipay } = await import('iyzipay');
      // const iyzipay = new Iyzipay({
      //   apiKey:    process.env.IYZICO_API_KEY,
      //   secretKey: process.env.IYZICO_SECRET_KEY!,
      //   uri:       process.env.IYZICO_BASE_URL!,
      // });
      // const token = params.get('token');
      // const result = await new Promise<{ status: string }>((resolve) =>
      //   iyzipay.checkoutForm.retrieve({ locale: 'tr', token }, (_: unknown, r: { status: string }) => resolve(r))
      // );
      // paymentSuccess = result.status === 'success';

      paymentSuccess = params.get('status') === 'success';
    }

    // ── PayTR ──────────────────────────────────────────────────────────────
    else if (process.env.PAYTR_MERCHANT_ID) {
      // PayTR hash doğrulaması (https://dev.paytr.com/iframe-api#callback):
      //
      // const crypto = await import('crypto');
      // const key    = process.env.PAYTR_MERCHANT_KEY!;
      // const salt   = process.env.PAYTR_MERCHANT_SALT!;
      // const oid    = params.get('merchant_oid')!;
      // const status = params.get('status')!;
      // const amount = params.get('total_amount')!;
      // const hash   = params.get('hash')!;
      // const expected = crypto.createHmac('sha256', key)
      //   .update(`${oid}${salt}${status}${amount}`)
      //   .digest('base64');
      // paymentSuccess = hash === expected && status === 'success';

      paymentSuccess = params.get('status') === 'success';
    }

    if (!paymentSuccess || !orderId) {
      return NextResponse.redirect(`${SITE_URL}/odeme?error=odeme-basarisiz`);
    }

    // Sipariş durumunu backend'de "ödendi" olarak güncelle:
    //
    // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/payment-confirm`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ confirmed: true }),
    // });

    // Sipariş onay e-postası gönder (sipariş bilgileri backend'den çekilir):
    //
    // const { sendOrderConfirmation } = await import('@/lib/email');
    // const order = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`).then(r => r.json());
    // await sendOrderConfirmation({
    //   to:              order.userEmail,
    //   customerName:    order.shippingFullName,
    //   orderId:         order.id,
    //   items:           order.items.map((i: { productName: string; quantity: number; unitPrice: number }) => ({
    //                      name: i.productName, quantity: i.quantity, unitPrice: i.unitPrice,
    //                    })),
    //   total:           order.total,
    //   shippingAddress: order.shippingAddress,
    // });

    return NextResponse.redirect(`${SITE_URL}/odeme/basarili?id=${orderId}`);
  } catch {
    return NextResponse.redirect(`${SITE_URL}/odeme?error=odeme-basarisiz`);
  }
}

// GET — bazı provider'lar ödeme sonrasında GET ile yönlendirir
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  const status  = req.nextUrl.searchParams.get('status');

  if (status === 'success' && orderId) {
    return NextResponse.redirect(`${SITE_URL}/odeme/basarili?id=${orderId}`);
  }
  return NextResponse.redirect(`${SITE_URL}/odeme?error=odeme-basarisiz`);
}
