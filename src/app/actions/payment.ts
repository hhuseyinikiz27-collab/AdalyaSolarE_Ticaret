'use server';

import { headers } from 'next/headers';
import { createPayment, PaymentRequest, PaymentResult } from '@/lib/payment';

export async function processPayment(
  orderId: number,
  req: Omit<PaymentRequest, 'orderId' | 'callbackUrl' | 'successUrl'>
): Promise<PaymentResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adalyasolar.com';
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    '0.0.0.0';

  return createPayment({
    ...req,
    orderId,
    customer: { ...req.customer, ip },
    callbackUrl: `${siteUrl}/api/odeme/callback?orderId=${orderId}`,
    successUrl:  `${siteUrl}/odeme/basarili?id=${orderId}`,
  });
}
