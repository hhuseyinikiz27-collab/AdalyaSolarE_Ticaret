// ─── Ödeme Entegrasyon İskeleti ────────────────────────────────────────────
//
// Desteklenen sağlayıcılar:
//   • İyzico  → https://docs.iyzico.com  |  npm install iyzipay
//   • PayTR   → https://dev.paytr.com    |  REST API, npm gerekmez
//
// .env dosyasına eklenecekler:
//   IYZICO_API_KEY=sandbox-xxxx
//   IYZICO_SECRET_KEY=sandbox-xxxx
//   IYZICO_BASE_URL=https://sandbox.iyzipay.com   # prod: https://api.iyzipay.com
//   PAYTR_MERCHANT_ID=xxxx
//   PAYTR_MERCHANT_KEY=xxxx
//   PAYTR_MERCHANT_SALT=xxxx
// ───────────────────────────────────────────────────────────────────────────

export interface PaymentItem {
  name: string;
  price: number;    // TL
  quantity: number;
}

export interface PaymentRequest {
  orderId: number;
  amount: number;   // toplam TL
  currency?: string;
  customer: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    ip: string;
  };
  billingAddress: {
    fullName: string;
    address: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  items: PaymentItem[];
  callbackUrl: string;    // İyzico: POST callback | PayTR: sunucu bildirimi + başarısızlık URL
  successUrl?: string;    // PayTR: merchant_ok_url (ödeme sonrası kullanıcı yönlenme)
}

export interface PaymentResult {
  success: boolean;
  checkoutFormContent?: string;   // İyzico: HTML form içeriği
  paymentPageUrl?: string;        // PayTR: iframe URL'i
  token?: string;
  errorMessage?: string;
}

// ─── İyzico ────────────────────────────────────────────────────────────────
export async function createIyzicoPayment(req: PaymentRequest): Promise<PaymentResult> {
  // 1. Kurulum:  npm install iyzipay
  // 2. Aşağıdaki yorumu kaldırıp doldurun:

  // const Iyzipay = require('iyzipay');
  // const iyzipay = new Iyzipay({
  //   apiKey:    process.env.IYZICO_API_KEY!,
  //   secretKey: process.env.IYZICO_SECRET_KEY!,
  //   uri:       process.env.IYZICO_BASE_URL!,
  // });
  //
  // const request = {
  //   locale: 'tr',
  //   conversationId: String(req.orderId),
  //   price: String(req.amount),
  //   paidPrice: String(req.amount),
  //   currency: req.currency ?? 'TRY',
  //   basketId: String(req.orderId),
  //   paymentGroup: 'PRODUCT',
  //   callbackUrl: req.callbackUrl,
  //   enabledInstallments: [1, 2, 3, 6, 9, 12],
  //   buyer: {
  //     id: String(req.orderId),
  //     name: req.customer.name,
  //     surname: req.customer.surname,
  //     email: req.customer.email,
  //     identityNumber: '11111111111',
  //     registrationAddress: req.billingAddress.address,
  //     ip: req.customer.ip,
  //     city: req.billingAddress.city,
  //     country: req.billingAddress.country,
  //   },
  //   billingAddress: {
  //     contactName: req.billingAddress.fullName,
  //     city: req.billingAddress.city,
  //     country: req.billingAddress.country,
  //     address: req.billingAddress.address,
  //   },
  //   basketItems: req.items.map((item, i) => ({
  //     id: String(i),
  //     name: item.name,
  //     category1: 'Solar Ürünleri',
  //     itemType: 'PHYSICAL',
  //     price: String(item.price * item.quantity),
  //   })),
  // };
  //
  // return new Promise((resolve) => {
  //   iyzipay.checkoutFormInitialize.create(request, (err: unknown, result: { status: string; checkoutFormContent?: string; errorMessage?: string }) => {
  //     if (err || result.status !== 'success') {
  //       resolve({ success: false, errorMessage: result?.errorMessage ?? 'Ödeme başlatılamadı.' });
  //     } else {
  //       resolve({ success: true, checkoutFormContent: result.checkoutFormContent });
  //     }
  //   });
  // });

  throw new Error('İyzico entegrasyonu henüz yapılandırılmamıştır.');
}

// ─── PayTR ─────────────────────────────────────────────────────────────────
export async function createPayTRToken(req: PaymentRequest): Promise<PaymentResult> {
  // PayTR REST API — npm paketi gerekmez, doğrudan fetch kullanılır.
  // Döküman: https://dev.paytr.com/iframe-api
  //
  // const crypto = await import('crypto');
  //
  // const merchantId   = process.env.PAYTR_MERCHANT_ID!;
  // const merchantKey  = process.env.PAYTR_MERCHANT_KEY!;
  // const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;
  //
  // const userBasket = Buffer.from(JSON.stringify(
  //   req.items.map(i => [i.name, String(i.price), i.quantity])
  // )).toString('base64');
  //
  // const amountKurus = Math.round(req.amount * 100);
  //
  // const hashStr = `${merchantId}${req.customer.ip}${req.orderId}${req.customer.email}${amountKurus}${userBasket}0TRY${req.callbackUrl}${merchantSalt}`;
  // const token = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64');
  //
  // const body = new URLSearchParams({
  //   merchant_id:    merchantId,
  //   user_ip:        req.customer.ip,
  //   merchant_oid:   String(req.orderId),
  //   email:          req.customer.email,
  //   payment_amount: String(amountKurus),
  //   user_basket:    userBasket,
  //   no_installment: '0',
  //   max_installment:'12',
  //   currency:       'TL',
  //   merchant_ok_url:  req.successUrl ?? req.callbackUrl,  // kullanıcı başarı yönlendirmesi
  //   merchant_fail_url:req.callbackUrl,                   // kullanıcı başarısızlık yönlendirmesi
  //   paytr_token:    token,
  // });
  //
  // const res = await fetch('https://www.paytr.com/odeme/api/get-token', { method: 'POST', body });
  // const data = await res.json();
  // if (data.status !== 'success') return { success: false, errorMessage: data.reason };
  // return { success: true, token: data.token, paymentPageUrl: `https://www.paytr.com/odeme/guvenli/${data.token}` };

  throw new Error('PayTR entegrasyonu henüz yapılandırılmamıştır.');
}

// ─── Otomatik Provider Seçimi ──────────────────────────────────────────────
// Hangi env değişkeni varsa o provider kullanılır.
// Hiçbiri yoksa demo mod: sipariş oluşturulur ama gerçek ödeme alınmaz.
export async function createPayment(req: PaymentRequest): Promise<PaymentResult> {
  if (process.env.IYZICO_API_KEY) return createIyzicoPayment(req);
  if (process.env.PAYTR_MERCHANT_ID) return createPayTRToken(req);
  // Demo mod — entegrasyon eklenince burası otomatik devre dışı kalır
  return { success: true };
}
