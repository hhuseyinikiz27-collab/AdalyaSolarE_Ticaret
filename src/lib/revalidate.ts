'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateAfterCategoryChange() {
  revalidatePath('/', 'layout');
  revalidatePath('/urunler');
}

export async function revalidateAfterProductChange() {
  revalidatePath('/');
  revalidatePath('/urunler');
}

export async function revalidateAfterCampaignChange() {
  revalidatePath('/kampanyalar');
}

export async function revalidateAfterSettingsChange() {
  revalidatePath('/', 'layout');
  revalidatePath('/iletisim');
  revalidatePath('/kurumsal');
}
