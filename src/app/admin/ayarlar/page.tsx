'use client';

import { useState, useEffect } from 'react';
import { Settings, Mail, FileText, Save, CheckCircle, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { revalidateAfterSettingsChange } from '@/lib/revalidate';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

type Tab = 'site' | 'smtp' | 'sozlesmeler' | 'guvenlik';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
}

async function fetchSettings(): Promise<Record<string, string>> {
  const token = getToken();
  const res = await fetch(`${BASE}/api/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return {};
  return res.json();
}

async function saveSettings(data: Record<string, string>): Promise<void> {
  const token = getToken();
  await fetch(`${BASE}/api/admin/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export default function AdminAyarlarPage() {
  const [activeTab, setActiveTab] = useState<Tab>('site');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [secSettings, setSecSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchSettings(),
      api.admin.security.getSettings().catch(() => ({})),
    ]).then(([s, sec]) => {
      setSettings(s);
      setSecSettings(sec);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));
  const get = (key: string) => settings[key] ?? '';

  const setSec = (key: string, value: string) => setSecSettings((prev) => ({ ...prev, [key]: value }));
  const getSec = (key: string, def: string) => secSettings[key] ?? def;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'guvenlik') {
        await api.admin.security.saveSettings(secSettings);
      } else {
        await saveSettings(settings);
        if (activeTab === 'site' || activeTab === 'sozlesmeler') {
          await revalidateAfterSettingsChange();
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'site', label: 'Site Ayarları', icon: <Settings size={16} /> },
    { id: 'smtp', label: 'SMTP Ayarları', icon: <Mail size={16} /> },
    { id: 'sozlesmeler', label: 'Sözleşme Metinleri', icon: <FileText size={16} /> },
    { id: 'guvenlik', label: 'Güvenlik', icon: <Shield size={16} /> },
  ];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Ayarlar</h1>
          <p className="text-sm text-gray-500 mt-1">Site, e-posta, yasal metin ve güvenlik ayarları</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Kaydedildi!' : saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === t.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 rounded-xl h-12 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Site Ayarları */}
          {activeTab === 'site' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">Genel Bilgiler</h3>
                <Field label="Site Adı" value={get('site.title')} onChange={(v) => set('site.title', v)} placeholder="Adalya Solar Enerji" />
                <Field label="Telefon" value={get('site.phone')} onChange={(v) => set('site.phone', v)} placeholder="0850 346 78 90" />
                <Field label="WhatsApp Numarası" value={get('site.whatsapp')} onChange={(v) => set('site.whatsapp', v)} placeholder="905551234567" hint="Ülke koduyla birlikte rakam olarak yazın (örn: 905551234567). Boş bırakılırsa WhatsApp butonu gizlenir." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Genel E-posta" value={get('site.email')} onChange={(v) => set('site.email', v)} placeholder="info@adalyasolar.com" type="email" />
                  <Field label="Kurumsal E-posta" value={get('site.corporate_email')} onChange={(v) => set('site.corporate_email', v)} placeholder="kurumsal@adalyasolar.com" type="email" hint="Kurumsal teklif sayfasında görünür. Boş bırakılırsa genel e-posta kullanılır." />
                </div>
                <Field label="Adres" value={get('site.address')} onChange={(v) => set('site.address', v)} placeholder="Atatürk Mah. Güneş Cad. No:24, Antalya" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">Sosyal Medya</h3>
                <Field label="Facebook URL" value={get('social.facebook')} onChange={(v) => set('social.facebook', v)} placeholder="https://facebook.com/adalyasolar" />
                <Field label="Instagram URL" value={get('social.instagram')} onChange={(v) => set('social.instagram', v)} placeholder="https://instagram.com/adalyasolar" />
                <Field label="YouTube URL" value={get('social.youtube')} onChange={(v) => set('social.youtube', v)} placeholder="https://youtube.com/@adalyasolar" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">Canlı Destek</h3>
                <Field
                  label="Tawk.to Property ID"
                  value={get('tawkto.propertyId')}
                  onChange={(v) => set('tawkto.propertyId', v)}
                  placeholder="64a1b2c3d4e5f6a7b8c9d0e1"
                  hint="Tawk.to'dan kopyalanan Property ID. Boş bırakılırsa canlı destek butonu görünmez."
                />
                <Field
                  label="Tawk.to Widget ID"
                  value={get('tawkto.widgetId')}
                  onChange={(v) => set('tawkto.widgetId', v)}
                  placeholder="1h2i3j4k5"
                  hint="Property ayarlarından alınan Widget ID (genellikle '1default' veya alfanümerik)."
                />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">Kargo Ayarları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Kargo Ücreti (₺)" value={get('shipping.cost')} onChange={(v) => set('shipping.cost', v)} placeholder="99" hint="Ücretsiz kargo eşiği aşılmadığında uygulanır." />
                  <Field label="Ücretsiz Kargo Eşiği (₺)" value={get('shipping.freeAbove')} onChange={(v) => set('shipping.freeAbove', v)} placeholder="500" hint="Bu tutarın üzerindeki siparişlere kargo ücretsizdir." />
                </div>
              </div>
            </div>
          )}

          {/* SMTP Ayarları */}
          {activeTab === 'smtp' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-[#1B3A6B]">E-posta Sunucusu</h3>
              <p className="text-xs text-gray-400">Bu ayarlar newsletter ve bildirim e-postalarında kullanılır.</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="SMTP Sunucu" value={get('smtp.host')} onChange={(v) => set('smtp.host', v)} placeholder="smtp.gmail.com" />
                <Field label="Port" value={get('smtp.port')} onChange={(v) => set('smtp.port', v)} placeholder="587" />
              </div>
              <Field label="Kullanıcı Adı" value={get('smtp.user')} onChange={(v) => set('smtp.user', v)} placeholder="info@adalyasolar.com" />
              <Field label="Şifre" value={get('smtp.password')} onChange={(v) => set('smtp.password', v)} placeholder="••••••••" type="password" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gönderici E-posta" value={get('smtp.fromEmail')} onChange={(v) => set('smtp.fromEmail', v)} placeholder="noreply@adalyasolar.com" />
                <Field label="Gönderici Adı" value={get('smtp.fromName')} onChange={(v) => set('smtp.fromName', v)} placeholder="Adalya Solar Enerji" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                Gmail kullanıyorsanız: Uygulama şifresi oluşturun, port 587 ve TLS kullanın.
              </div>
            </div>
          )}

          {/* Sözleşme Metinleri */}
          {activeTab === 'sozlesmeler' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">Bu metinler ilgili sayfalarda gösterilir. Boş bırakılırsa varsayılan içerik kullanılır.</p>
              <TextArea label="Gizlilik Politikası" value={get('policy.privacy')} onChange={(v) => set('policy.privacy', v)} placeholder="Gizlilik politikası metnini buraya yazın..." rows={12} />
              <TextArea label="Kullanım Koşulları" value={get('policy.terms')} onChange={(v) => set('policy.terms', v)} placeholder="Kullanım koşulları metnini buraya yazın..." rows={12} />
              <TextArea label="İade Politikası" value={get('policy.returns')} onChange={(v) => set('policy.returns', v)} placeholder="İade politikası metnini buraya yazın..." rows={12} />
            </div>
          )}

          {/* Güvenlik Ayarları */}
          {activeTab === 'guvenlik' && (
            <div className="space-y-4">
              {/* Şifre Değişikliği Kısıtlamaları */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-orange-500" />
                  <h3 className="font-bold text-[#1B3A6B]">Şifre Değişikliği Kısıtlamaları</h3>
                </div>
                <p className="text-xs text-gray-400">
                  Kullanıcı kısa sürede çok fazla şifre değiştirirse hesabı geçici olarak kilitlenir.
                  Kilit açılınca kullanıcıya e-posta gönderilir (SMTP yapılandırılmışsa).
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <NumberField
                    label="İzin Verilen Değişiklik Sayısı"
                    hint="Bu süre içinde kaç kez"
                    value={getSec('security.rapidChangeLimit', '2')}
                    onChange={(v) => setSec('security.rapidChangeLimit', v)}
                    min={1} max={20}
                  />
                  <NumberField
                    label="Kontrol Penceresi (dakika)"
                    hint="Kaç dakika içinde sayılsın"
                    value={getSec('security.rapidChangeWindowMinutes', '60')}
                    onChange={(v) => setSec('security.rapidChangeWindowMinutes', v)}
                    min={5} max={1440}
                  />
                  <NumberField
                    label="Kilit Süresi (dakika)"
                    hint="Kaç dakika kilitli kalsın"
                    value={getSec('security.passwordLockoutMinutes', '30')}
                    onChange={(v) => setSec('security.passwordLockoutMinutes', v)}
                    min={1} max={10080}
                  />
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                  Örnek: Limit=2, Pencere=60, Kilit=30 → 60 dakika içinde 2 kereden fazla şifre değiştirilirse hesap 30 dakika kilitlenir.
                </div>
              </div>

              {/* Sipariş Oluşturma Spam Koruması */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-blue-500" />
                  <h3 className="font-bold text-[#1B3A6B]">Sipariş Oluşturma Spam Koruması</h3>
                </div>
                <p className="text-xs text-gray-400">
                  Kullanıcı 1 saat içinde çok fazla yeni sipariş oluşturursa geçici olarak engellenir. İptal edilen siparişler de bu sayıya dahildir.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="Saatlik Sipariş Oluşturma Limiti"
                    hint="1 saatte en fazla kaç sipariş oluşturulabilir"
                    value={getSec('security.orderSpamLimitPerHour', '5')}
                    onChange={(v) => setSec('security.orderSpamLimitPerHour', v)}
                    min={1} max={100}
                  />
                  <NumberField
                    label="Engelleme Süresi (dakika)"
                    hint="Limit aşılınca kaç dakika engel"
                    value={getSec('security.orderSpamBanMinutes', '30')}
                    onChange={(v) => setSec('security.orderSpamBanMinutes', v)}
                    min={1} max={10080}
                  />
                </div>
              </div>

              {/* Sipariş İptal Spam Koruması */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-red-500" />
                  <h3 className="font-bold text-[#1B3A6B]">Sipariş İptal Koruması</h3>
                </div>
                <p className="text-xs text-gray-400">
                  Kullanıcı 1 saat içinde çok fazla sipariş iptal ederse yeni sipariş oluşturması geçici olarak engellenir.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="Saatlik İptal Limiti"
                    hint="1 saatte en fazla kaç sipariş iptal edilebilir"
                    value={getSec('security.cancelSpamLimitPerHour', '5')}
                    onChange={(v) => setSec('security.cancelSpamLimitPerHour', v)}
                    min={1} max={50}
                  />
                  <NumberField
                    label="Engelleme Süresi (dakika)"
                    hint="Limit aşılınca kaç dakika yeni sipariş engeli"
                    value={getSec('security.cancelSpamBanMinutes', '30')}
                    onChange={(v) => setSec('security.cancelSpamBanMinutes', v)}
                    min={1} max={10080}
                  />
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                  Örnek: Limit=5, Kilit=30 → 1 saat içinde 5 kereden fazla sipariş iptal edilirse kullanıcı 30 dakika yeni sipariş oluşturamaz.
                </div>
              </div>

              {/* E-posta Bildirimleri Bilgi */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h4 className="font-bold text-blue-800 text-sm mb-2">E-posta Bildirimleri</h4>
                <ul className="text-xs text-blue-700 space-y-1.5">
                  <li>• <strong>Şifre değişikliği:</strong> Kullanıcıya otomatik bildirim gönderilir.</li>
                  <li>• <strong>Hesap kilitlendi:</strong> Kilit uygulandığında kullanıcıya bildirim gönderilir.</li>
                  <li>• Bildirimlerin çalışması için SMTP Ayarları sekmesinden e-posta sunucusunu yapılandırın.</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function NumberField({ label, hint, value, onChange, min, max }: {
  label: string; hint: string; value: string; onChange: (v: string) => void; min: number; max: number;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-0.5">{label}</label>
      <p className="text-xs text-gray-400 mb-1">{hint}</p>
      <input
        type="number" min={min} max={max} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 8 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <label className="text-sm font-bold text-[#1B3A6B] block mb-3">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-y font-mono" />
    </div>
  );
}
