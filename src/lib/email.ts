// ─── E-posta Gönderim İskeleti ──────────────────────────────────────────────
//
// Önerilen çözümler (öncelik sırasıyla):
//   1. Resend       → https://resend.com           |  npm install resend
//   2. Nodemailer   → https://nodemailer.com        |  npm install nodemailer
//   3. Brevo (eski Sendinblue) → https://brevo.com  |  npm install @getbrevo/brevo
//
// .env dosyasına eklenecekler (seçilen sağlayıcıya göre birini kullanın):
//
//   # Resend (en kolay kurulum):
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//
//   # Nodemailer SMTP:
//   SMTP_HOST=smtp.gmail.com        # ya da mail sunucunuz
//   SMTP_PORT=587
//   SMTP_USER=info@adalyasolar.com
//   SMTP_PASS=uygulama-sifresi
//   SMTP_FROM="Adalya Solar <info@adalyasolar.com>"
// ───────────────────────────────────────────────────────────────────────────

export interface OrderConfirmationData {
  to: string;
  customerName: string;
  orderId: number;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  shippingAddress: string;
}

export interface PasswordChangedData {
  to: string;
  customerName: string;
  changedAt: string;   // örn: "4 Mayıs 2026, 14:32"
}

export interface PasswordResetData {
  to: string;
  customerName: string;
  resetUrl: string;       // ön yüzde /sifre-sifirla?token=xxx sayfası
  expiresInMinutes: number;
}

export interface ShipmentData {
  to: string;
  customerName: string;
  orderId: number;
  trackingCode: string;
  cargoCompany: string;   // 'Aras' | 'Yurtiçi' | 'PTT' | 'MNG' | ...
  estimatedDelivery?: string;
}

export interface FlashSaleData {
  to: string;
  customerName: string;
  productName: string;
  productSlug: string;
  flashPrice: number;
  originalPrice: number;
  endsAt: string; // ISO string
}

// ─── Sipariş Onayı ─────────────────────────────────────────────────────────
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  const html = buildOrderHtml(data);
  await sendMail({
    to: data.to,
    subject: `Siparişiniz Alındı #${data.orderId} — Adalya Solar`,
    html,
  });
}

// ─── Kargo Bildirimi ───────────────────────────────────────────────────────
export async function sendShipmentNotification(data: ShipmentData): Promise<void> {
  const html = buildShipmentHtml(data);
  await sendMail({
    to: data.to,
    subject: `Siparişiniz Kargoya Verildi #${data.orderId} — Adalya Solar`,
    html,
  });
}

// ─── Şifre Değişiklik Bildirimi ────────────────────────────────────────────
export async function sendPasswordChanged(data: PasswordChangedData): Promise<void> {
  await sendMail({
    to: data.to,
    subject: 'Şifreniz Değiştirildi — Adalya Solar',
    html: buildPasswordChangedHtml(data),
  });
}

// ─── Flash İndirim Bildirimi ───────────────────────────────────────────────
export async function sendFlashSaleNotification(data: FlashSaleData): Promise<void> {
  await sendMail({
    to: data.to,
    subject: `⚡ Flash İndirim: ${data.productName} — Adalya Solar`,
    html: buildFlashSaleHtml(data),
  });
}

// ─── Şifre Sıfırlama ───────────────────────────────────────────────────────
export async function sendPasswordReset(data: PasswordResetData): Promise<void> {
  const html = buildPasswordResetHtml(data);
  await sendMail({
    to: data.to,
    subject: 'Şifre Sıfırlama — Adalya Solar',
    html,
  });
}

// ─── Düşük Seviye Gönderim (buraya sağlayıcıyı bağlayın) ──────────────────
async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // ── SEÇENEK 1: Resend ──────────────────────────────────────────────────
  // npm install resend
  //
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Adalya Solar <info@adalyasolar.com>',
  //   to,
  //   subject,
  //   html,
  // });

  // ── SEÇENEK 2: Nodemailer SMTP ─────────────────────────────────────────
  // npm install nodemailer @types/nodemailer
  //
  // const nodemailer = await import('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host:   process.env.SMTP_HOST,
  //   port:   Number(process.env.SMTP_PORT ?? 587),
  //   secure: process.env.SMTP_PORT === '465',
  //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // });
  // await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });

  void to; void subject; void html;
}

// ─── HTML Şablonları ────────────────────────────────────────────────────────
function wrap(body: string): string {
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .card{background:#fff;max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden}
    .header{background:#1B3A6B;padding:24px;text-align:center}
    .header h1{color:#fff;margin:0;font-size:18px;font-weight:700}
    .header span{color:#f97316;font-weight:700}
    .body{padding:28px}
    h2{color:#1B3A6B;font-size:16px;margin-top:0}
    table{width:100%;border-collapse:collapse;margin:16px 0;font-size:14px}
    th{background:#f9fafb;padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase}
    td{padding:10px 12px;border-bottom:1px solid #f3f4f6}
    .total{background:#1B3A6B;color:#fff;font-weight:700;font-size:15px}
    .total td{border:none;padding:12px}
    .footer{text-align:center;padding:16px;font-size:11px;color:#9ca3af}
    .btn{display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px}
  </style></head><body><div class="card">${body}<div class="footer">Adalya Solar Enerji · adalyasolar.com</div></div></body></html>`;
}

function buildOrderHtml(d: OrderConfirmationData): string {
  const rows = d.items.map(i =>
    `<tr><td>${i.name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">${(i.unitPrice * i.quantity).toLocaleString('tr-TR')} ₺</td></tr>`
  ).join('');

  return wrap(`
    <div class="header"><h1>Adalya <span>Solar</span></h1></div>
    <div class="body">
      <h2>Siparişiniz Alındı 🎉</h2>
      <p>Merhaba <strong>${d.customerName}</strong>,</p>
      <p>Siparişiniz başarıyla alındı. En kısa sürede hazırlayıp kargoya vereceğiz.</p>
      <p style="background:#f0fdf4;border-left:3px solid #22c55e;padding:10px 14px;border-radius:4px;font-weight:700">
        Sipariş Numarası: #${d.orderId}
      </p>
      <table>
        <thead><tr><th>Ürün</th><th style="text-align:center">Adet</th><th style="text-align:right">Tutar</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="total"><td colspan="2">Genel Toplam</td><td style="text-align:right">${d.total.toLocaleString('tr-TR')} ₺</td></tr></tfoot>
      </table>
      <p><strong>Teslimat Adresi:</strong><br>${d.shippingAddress}</p>
      <p style="margin-top:20px">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adalyasolar.com'}/siparis-takip?id=${d.orderId}" class="btn">
          Siparişimi Takip Et
        </a>
      </p>
    </div>`);
}

function buildShipmentHtml(d: ShipmentData): string {
  return wrap(`
    <div class="header"><h1>Adalya <span>Solar</span></h1></div>
    <div class="body">
      <h2>Siparişiniz Kargoya Verildi 🚚</h2>
      <p>Merhaba <strong>${d.customerName}</strong>,</p>
      <p><strong>#${d.orderId}</strong> numaralı siparişiniz <strong>${d.cargoCompany}</strong> kargo ile yola çıktı.</p>
      <p style="background:#eff6ff;border-left:3px solid #3b82f6;padding:10px 14px;border-radius:4px">
        <strong>Takip Kodu:</strong> ${d.trackingCode}<br>
        ${d.estimatedDelivery ? `<strong>Tahmini Teslim:</strong> ${d.estimatedDelivery}` : ''}
      </p>
      <p style="margin-top:20px">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adalyasolar.com'}/siparis-takip?id=${d.orderId}" class="btn">
          Siparişimi Takip Et
        </a>
      </p>
    </div>`);
}

function buildPasswordChangedHtml(d: PasswordChangedData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adalyasolar.com';
  return wrap(`
    <div class="header"><h1>Adalya <span>Solar</span></h1></div>
    <div class="body">
      <h2>Şifreniz Değiştirildi 🔒</h2>
      <p>Merhaba <strong>${d.customerName}</strong>,</p>
      <p>Hesabınızın şifresi <strong>${d.changedAt}</strong> tarihinde başarıyla değiştirildi.</p>
      <p style="background:#fef9c3;border-left:3px solid #eab308;padding:10px 14px;border-radius:4px;font-size:13px">
        Bu işlemi siz yapmadıysanız hesabınızın güvenliği risk altında olabilir.
        Lütfen hemen bizimle iletişime geçin.
      </p>
      <p style="margin-top:20px">
        <a href="${siteUrl}/iletisim" class="btn">Bize Ulaşın</a>
      </p>
    </div>`);
}

function buildFlashSaleHtml(d: FlashSaleData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adalyasolar.com';
  const discount = Math.round(((d.originalPrice - d.flashPrice) / d.originalPrice) * 100);
  const endsAt = new Date(d.endsAt).toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul',
  });
  return wrap(`
    <div class="header" style="background:#dc2626"><h1>⚡ Flash <span style="color:#fff">İndirim!</span></h1></div>
    <div class="body">
      <h2 style="color:#dc2626">Favori Ürününüzde Flash İndirim!</h2>
      <p>Merhaba <strong>${d.customerName}</strong>,</p>
      <p>Favorilerinize eklediğiniz <strong>${d.productName}</strong> ürününde sınırlı süreli flash indirim başladı!</p>
      <div style="background:#fef2f2;border:2px solid #dc2626;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
        <p style="font-size:13px;color:#6b7280;margin:0 0 6px">Normal Fiyat: <s>${d.originalPrice.toLocaleString('tr-TR')} ₺</s></p>
        <p style="font-size:32px;font-weight:900;color:#dc2626;margin:0">%${discount} İndirim</p>
        <p style="font-size:28px;font-weight:800;color:#1B3A6B;margin:4px 0 0">${d.flashPrice.toLocaleString('tr-TR')} ₺</p>
      </div>
      <p style="background:#fef9c3;border-left:3px solid #eab308;padding:10px 14px;border-radius:4px;font-size:13px">
        ⏰ Bu fırsat <strong>${endsAt}</strong> tarihine kadar geçerlidir. Kaçırmayın!
      </p>
      <p style="margin-top:20px;text-align:center">
        <a href="${siteUrl}/urunler/${d.productSlug}" class="btn" style="background:#dc2626">
          ⚡ Hemen Satın Al
        </a>
      </p>
    </div>`);
}

function buildPasswordResetHtml(d: PasswordResetData): string {
  return wrap(`
    <div class="header"><h1>Adalya <span>Solar</span></h1></div>
    <div class="body">
      <h2>Şifre Sıfırlama</h2>
      <p>Merhaba <strong>${d.customerName}</strong>,</p>
      <p>Hesabınız için bir şifre sıfırlama isteği aldık. Aşağıdaki butona tıklayarak şifrenizi sıfırlayabilirsiniz.</p>
      <p>Bu bağlantı <strong>${d.expiresInMinutes} dakika</strong> boyunca geçerlidir.</p>
      <p style="margin:24px 0">
        <a href="${d.resetUrl}" class="btn">Şifremi Sıfırla</a>
      </p>
      <p style="font-size:12px;color:#9ca3af">
        Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
      </p>
    </div>`);
}
