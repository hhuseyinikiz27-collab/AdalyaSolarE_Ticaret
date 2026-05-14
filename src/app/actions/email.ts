'use server';

import { sendPasswordChanged, sendOrderConfirmation, sendShipmentNotification, sendFlashSaleNotification, FlashSaleData } from '@/lib/email';

export async function notifyPasswordChanged(data: {
  to: string;
  customerName: string;
}) {
  const changedAt = new Date().toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  });
  await sendPasswordChanged({ ...data, changedAt });
}

export async function notifyOrderConfirmation(data: Parameters<typeof sendOrderConfirmation>[0]) {
  await sendOrderConfirmation(data);
}

export async function notifyShipment(data: Parameters<typeof sendShipmentNotification>[0]) {
  await sendShipmentNotification(data);
}

export async function notifyFlashSaleUsers(users: { name: string; email: string }[], flashData: Omit<FlashSaleData, 'to' | 'customerName'>) {
  await Promise.allSettled(
    users.map(u => sendFlashSaleNotification({ ...flashData, to: u.email, customerName: u.name }))
  );
}
