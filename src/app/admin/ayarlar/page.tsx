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
    { id: 'site', label: 'Site Settings', icon: <Settings size={16} /> },
    { id: 'smtp', label: 'SMTP Settings', icon: <Mail size={16} /> },
    { id: 'sozlesmeler', label: 'Legal Texts', icon: <FileText size={16} /> },
    { id: 'guvenlik', label: 'Security', icon: <Shield size={16} /> },
  ];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Site, email, legal text and security settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
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
          {/* Site Settings */}
          {activeTab === 'site' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">General Information</h3>
                <Field label="Site Name" value={get('site.title')} onChange={(v) => set('site.title', v)} placeholder="Adalya Solar Energy" />
                <Field label="Phone" value={get('site.phone')} onChange={(v) => set('site.phone', v)} placeholder="0850 346 78 90" />
                <Field label="WhatsApp Number" value={get('site.whatsapp')} onChange={(v) => set('site.whatsapp', v)} placeholder="905551234567" hint="Enter digits with country code (e.g. 905551234567). Leave blank to hide the WhatsApp button." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="General Email" value={get('site.email')} onChange={(v) => set('site.email', v)} placeholder="info@adalyasolar.com" type="email" />
                  <Field label="Corporate Email" value={get('site.corporate_email')} onChange={(v) => set('site.corporate_email', v)} placeholder="corporate@adalyasolar.com" type="email" hint="Shown on the corporate quote page. If left blank, the general email is used." />
                </div>
                <Field label="Address" value={get('site.address')} onChange={(v) => set('site.address', v)} placeholder="Ataturk District, Sun Street No:24, Antalya" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">Social Media</h3>
                <Field label="Facebook URL" value={get('social.facebook')} onChange={(v) => set('social.facebook', v)} placeholder="https://facebook.com/adalyasolar" />
                <Field label="Instagram URL" value={get('social.instagram')} onChange={(v) => set('social.instagram', v)} placeholder="https://instagram.com/adalyasolar" />
                <Field label="YouTube URL" value={get('social.youtube')} onChange={(v) => set('social.youtube', v)} placeholder="https://youtube.com/@adalyasolar" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">Live Support</h3>
                <Field
                  label="Tawk.to Property ID"
                  value={get('tawkto.propertyId')}
                  onChange={(v) => set('tawkto.propertyId', v)}
                  placeholder="64a1b2c3d4e5f6a7b8c9d0e1"
                  hint="Property ID copied from Tawk.to. Leave blank to hide the live support button."
                />
                <Field
                  label="Tawk.to Widget ID"
                  value={get('tawkto.widgetId')}
                  onChange={(v) => set('tawkto.widgetId', v)}
                  placeholder="1h2i3j4k5"
                  hint="Widget ID from property settings (usually '1default' or alphanumeric)."
                />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-[#1B3A6B]">Shipping Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Shipping Cost (₺)" value={get('shipping.cost')} onChange={(v) => set('shipping.cost', v)} placeholder="99" hint="Applied when the free shipping threshold is not met." />
                  <Field label="Free Shipping Threshold (₺)" value={get('shipping.freeAbove')} onChange={(v) => set('shipping.freeAbove', v)} placeholder="500" hint="Orders above this amount qualify for free shipping." />
                </div>
              </div>
            </div>
          )}

          {/* SMTP Settings */}
          {activeTab === 'smtp' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-[#1B3A6B]">Email Server</h3>
              <p className="text-xs text-gray-400">These settings are used for newsletter and notification emails.</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="SMTP Host" value={get('smtp.host')} onChange={(v) => set('smtp.host', v)} placeholder="smtp.gmail.com" />
                <Field label="Port" value={get('smtp.port')} onChange={(v) => set('smtp.port', v)} placeholder="587" />
              </div>
              <Field label="Username" value={get('smtp.user')} onChange={(v) => set('smtp.user', v)} placeholder="info@adalyasolar.com" />
              <Field label="Password" value={get('smtp.password')} onChange={(v) => set('smtp.password', v)} placeholder="••••••••" type="password" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sender Email" value={get('smtp.fromEmail')} onChange={(v) => set('smtp.fromEmail', v)} placeholder="noreply@adalyasolar.com" />
                <Field label="Sender Name" value={get('smtp.fromName')} onChange={(v) => set('smtp.fromName', v)} placeholder="Adalya Solar Energy" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                If using Gmail: create an App Password, use port 587 and TLS.
              </div>
            </div>
          )}

          {/* Legal Texts */}
          {activeTab === 'sozlesmeler' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">These texts are displayed on the relevant pages. If left blank, default content is used.</p>
              <TextArea label="Privacy Policy" value={get('policy.privacy')} onChange={(v) => set('policy.privacy', v)} placeholder="Enter the privacy policy text here..." rows={12} />
              <TextArea label="Terms of Use" value={get('policy.terms')} onChange={(v) => set('policy.terms', v)} placeholder="Enter the terms of use text here..." rows={12} />
              <TextArea label="Return Policy" value={get('policy.returns')} onChange={(v) => set('policy.returns', v)} placeholder="Enter the return policy text here..." rows={12} />
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'guvenlik' && (
            <div className="space-y-4">
              {/* Password Change Restrictions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-orange-500" />
                  <h3 className="font-bold text-[#1B3A6B]">Password Change Restrictions</h3>
                </div>
                <p className="text-xs text-gray-400">
                  If a user changes their password too many times in a short period, their account is temporarily locked.
                  When unlocked, the user receives an email (if SMTP is configured).
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <NumberField
                    label="Allowed Changes"
                    hint="How many times within the window"
                    value={getSec('security.rapidChangeLimit', '2')}
                    onChange={(v) => setSec('security.rapidChangeLimit', v)}
                    min={1} max={20}
                  />
                  <NumberField
                    label="Check Window (minutes)"
                    hint="Over how many minutes to count"
                    value={getSec('security.rapidChangeWindowMinutes', '60')}
                    onChange={(v) => setSec('security.rapidChangeWindowMinutes', v)}
                    min={5} max={1440}
                  />
                  <NumberField
                    label="Lockout Duration (minutes)"
                    hint="How many minutes to stay locked"
                    value={getSec('security.passwordLockoutMinutes', '30')}
                    onChange={(v) => setSec('security.passwordLockoutMinutes', v)}
                    min={1} max={10080}
                  />
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                  Example: Limit=2, Window=60, Lockout=30 → If the password is changed more than 2 times within 60 minutes, the account is locked for 30 minutes.
                </div>
              </div>

              {/* Order Creation Spam Protection */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-blue-500" />
                  <h3 className="font-bold text-[#1B3A6B]">Order Creation Spam Protection</h3>
                </div>
                <p className="text-xs text-gray-400">
                  If a user creates too many new orders within 1 hour, they are temporarily blocked. Cancelled orders are also counted.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="Hourly Order Creation Limit"
                    hint="Maximum orders that can be created per hour"
                    value={getSec('security.orderSpamLimitPerHour', '5')}
                    onChange={(v) => setSec('security.orderSpamLimitPerHour', v)}
                    min={1} max={100}
                  />
                  <NumberField
                    label="Block Duration (minutes)"
                    hint="How many minutes to block when limit is exceeded"
                    value={getSec('security.orderSpamBanMinutes', '30')}
                    onChange={(v) => setSec('security.orderSpamBanMinutes', v)}
                    min={1} max={10080}
                  />
                </div>
              </div>

              {/* Order Cancellation Spam Protection */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-red-500" />
                  <h3 className="font-bold text-[#1B3A6B]">Order Cancellation Protection</h3>
                </div>
                <p className="text-xs text-gray-400">
                  If a user cancels too many orders within 1 hour, they are temporarily blocked from creating new orders.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="Hourly Cancellation Limit"
                    hint="Maximum orders that can be cancelled per hour"
                    value={getSec('security.cancelSpamLimitPerHour', '5')}
                    onChange={(v) => setSec('security.cancelSpamLimitPerHour', v)}
                    min={1} max={50}
                  />
                  <NumberField
                    label="Block Duration (minutes)"
                    hint="How many minutes to block new orders when limit is exceeded"
                    value={getSec('security.cancelSpamBanMinutes', '30')}
                    onChange={(v) => setSec('security.cancelSpamBanMinutes', v)}
                    min={1} max={10080}
                  />
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                  Example: Limit=5, Lockout=30 → If more than 5 orders are cancelled within 1 hour, the user cannot create new orders for 30 minutes.
                </div>
              </div>

              {/* Email Notifications Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h4 className="font-bold text-blue-800 text-sm mb-2">Email Notifications</h4>
                <ul className="text-xs text-blue-700 space-y-1.5">
                  <li>• <strong>Password change:</strong> An automatic notification is sent to the user.</li>
                  <li>• <strong>Account locked:</strong> A notification is sent to the user when a lockout is applied.</li>
                  <li>• For notifications to work, configure the email server from the SMTP Settings tab.</li>
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
