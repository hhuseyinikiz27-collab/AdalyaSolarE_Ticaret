// ─── Kargo Takip Entegrasyon İskeleti ─────────────────────────────────────
//
// Desteklenen firmalar (öncelik sırasıyla):
//   • Aras Kargo    → SOAP API  |  env: ARAS_API_USERNAME, ARAS_API_PASSWORD
//   • Yurtiçi Kargo → REST API  |  env: YURTICI_USERNAME, YURTICI_PASSWORD
//   • PTT Kargo     → REST API  |  env gerekmez (açık endpoint)
//   • MNG Kargo     → REST API  |  env: MNG_API_KEY
//   • Sürat Kargo   → REST API  |  env: SURAT_USERNAME, SURAT_PASSWORD
//
// Kargo firması ile anlaşıldığında:
//   1. İlgili firmanın bloğunun yorumunu kaldırın
//   2. .env'e gerekli değişkenleri ekleyin
//   3. Başka hiçbir yere dokunmanıza gerek yok
// ──────────────────────────────────────────────────────────────────────────

export interface CargoEvent {
  date: string;       // "2026-05-11"
  time: string;       // "14:30"
  location: string;   // "İstanbul Dağıtım Merkezi"
  description: string;
}

export interface CargoTrackResult {
  trackingCode: string;
  cargoCompany: string;
  statusCode: string;       // 'in-transit' | 'out-for-delivery' | 'delivered' | 'failed'
  statusLabel: string;      // Türkçe durum etiketi
  estimatedDelivery?: string;
  events: CargoEvent[];
}

// ─── Otomatik Firma Seçimi ─────────────────────────────────────────────────
export async function trackCargo(
  trackingCode: string,
  cargoCompany: string
): Promise<CargoTrackResult | null> {
  const c = cargoCompany.toLowerCase();
  if (c.includes('aras'))                              return trackAras(trackingCode);
  if (c.includes('yurtiçi') || c.includes('yurtici')) return trackYurtici(trackingCode);
  if (c.includes('ptt'))                               return trackPTT(trackingCode);
  if (c.includes('mng'))                               return trackMNG(trackingCode);
  if (c.includes('sürat') || c.includes('surat'))      return trackSurat(trackingCode);
  return null;
}

// ─── Aras Kargo ────────────────────────────────────────────────────────────
// Döküman: https://customerservices.araskargo.com.tr/ArasCargoCustomerIntegrationService
async function trackAras(trackingCode: string): Promise<CargoTrackResult | null> {
  const username = process.env.ARAS_API_USERNAME;
  const password = process.env.ARAS_API_PASSWORD;
  if (!username || !password) return null;

  // const soapBody = `<?xml version="1.0" encoding="utf-8"?>
  // <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  //                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  //                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  //   <soap:Body>
  //     <GetQueryShipmentDetailByBarcode xmlns="http://tempuri.org/">
  //       <UserName>${username}</UserName>
  //       <Password>${password}</Password>
  //       <BarCode>${trackingCode}</BarCode>
  //     </GetQueryShipmentDetailByBarcode>
  //   </soap:Body>
  // </soap:Envelope>`;
  //
  // const res = await fetch(
  //   'https://customerservices.araskargo.com.tr/ArasCargoCustomerIntegrationService/ArasCargoIntegrationService.svc',
  //   { method: 'POST', headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '""' }, body: soapBody }
  // );
  // const xml = await res.text();
  // return parseArasXml(xml, trackingCode);

  void trackingCode;
  throw new Error('Aras Kargo entegrasyonu henüz yapılandırılmamıştır.');
}

// ─── Yurtiçi Kargo ─────────────────────────────────────────────────────────
// Döküman: https://ws.yurticikargo.com/WebServices/GondericiIslemleri
async function trackYurtici(trackingCode: string): Promise<CargoTrackResult | null> {
  const username = process.env.YURTICI_USERNAME;
  const password = process.env.YURTICI_PASSWORD;
  if (!username || !password) return null;

  // const res = await fetch('https://ws.yurticikargo.com/WebServices/GondericiIslemleri/ShipmentTracking', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ username, password, trackingNumber: trackingCode }),
  // });
  // const data = await res.json();
  // return parseYurticiResponse(data, trackingCode);

  void trackingCode;
  throw new Error('Yurtiçi Kargo entegrasyonu henüz yapılandırılmamıştır.');
}

// ─── PTT Kargo ─────────────────────────────────────────────────────────────
// Açık endpoint, API key gerektirmez
async function trackPTT(trackingCode: string): Promise<CargoTrackResult | null> {
  // const res = await fetch(
  //   `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(trackingCode)}`
  // );
  // const data = await res.json();
  // return parsePTTResponse(data, trackingCode);

  void trackingCode;
  throw new Error('PTT Kargo entegrasyonu henüz yapılandırılmamıştır.');
}

// ─── MNG Kargo ─────────────────────────────────────────────────────────────
// Döküman: https://service.mngkargo.com.tr
async function trackMNG(trackingCode: string): Promise<CargoTrackResult | null> {
  const apiKey = process.env.MNG_API_KEY;
  if (!apiKey) return null;

  // const res = await fetch('https://service.mngkargo.com.tr/tservis/TrackingQuery', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
  //   body: JSON.stringify({ trackingNumber: trackingCode }),
  // });
  // const data = await res.json();
  // return parseMNGResponse(data, trackingCode);

  void trackingCode;
  throw new Error('MNG Kargo entegrasyonu henüz yapılandırılmamıştır.');
}

// ─── Sürat Kargo ───────────────────────────────────────────────────────────
async function trackSurat(trackingCode: string): Promise<CargoTrackResult | null> {
  const username = process.env.SURAT_USERNAME;
  const password = process.env.SURAT_PASSWORD;
  if (!username || !password) return null;

  // const res = await fetch('https://ws.suratkargo.com.tr/KargoTakip/service.asmx/KargoTakip', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: new URLSearchParams({ kullanici: username, sifre: password, barcode: trackingCode }),
  // });
  // const xml = await res.text();
  // return parseSuratXml(xml, trackingCode);

  void trackingCode;
  throw new Error('Sürat Kargo entegrasyonu henüz yapılandırılmamıştır.');
}
