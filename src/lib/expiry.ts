import type { StoreMaterial } from '@/contexts/DataContext';

export const daysLeft = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00').getTime();
  const now = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00').getTime();
  return Math.round((d - now) / 86400000);
};

export interface ExpiryAlerts {
  expired: StoreMaterial[];
  dueSoon: StoreMaterial[];
  lostAmount: number;
  riskAmount: number;
}

export const getExpiryAlerts = (materials: StoreMaterial[], withinDays = 7): ExpiryAlerts => {
  const expired = materials.filter(m => daysLeft(m.expiredDate) < 0);
  const dueSoon = materials.filter(m => {
    const d = daysLeft(m.expiredDate);
    return d >= 0 && d <= withinDays;
  });
  const value = (m: StoreMaterial) => m.totalPrice || m.quantity * m.pricePerUnit;
  return {
    expired,
    dueSoon,
    lostAmount: expired.reduce((s, m) => s + value(m), 0),
    riskAmount: dueSoon.reduce((s, m) => s + value(m), 0),
  };
};

/** Short alert ring using the Web Audio API (no asset needed). */
export const playAlertRing = (times = 2) => {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    for (let i = 0; i < times; i++) {
      const start = ctx.currentTime + i * 0.45;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, start);
      osc.frequency.setValueAtTime(660, start + 0.15);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    }
    setTimeout(() => ctx.close(), times * 500 + 400);
  } catch {
    /* audio not available */
  }
};
