import { NextRequest, NextResponse } from 'next/server';
import { trackCargo } from '@/lib/cargo';

// GET /api/kargo/track?code=XXXX&company=Aras+Kargo
export async function GET(req: NextRequest) {
  const code    = req.nextUrl.searchParams.get('code')?.trim();
  const company = req.nextUrl.searchParams.get('company')?.trim();

  if (!code || !company) {
    return NextResponse.json({ error: 'Takip kodu ve kargo firması zorunludur.' }, { status: 400 });
  }

  try {
    const result = await trackCargo(code, company);
    if (!result) {
      return NextResponse.json(
        { error: 'Bu kargo firması için entegrasyon henüz yapılandırılmamıştır.' },
        { status: 503 }
      );
    }
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Kargo bilgisi alınamadı.';
    if (msg.includes('henüz yapılandırılmamıştır')) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    return NextResponse.json({ error: 'Kargo bilgisi alınamadı. Lütfen tekrar deneyin.' }, { status: 500 });
  }
}
