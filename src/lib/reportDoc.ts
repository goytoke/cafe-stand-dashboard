import type { Order, Expense, StoreMaterial, FinanceTxn, Note, TodoItem, FundKey, TelegramConfig } from '@/contexts/DataContext';
import { getExpiryAlerts, daysLeft } from '@/lib/expiry';

export interface ReportSnapshot {
  date: string;
  orders: Order[];
  expenses: Expense[];
  materials: StoreMaterial[];
  txns: FinanceTxn[];
  notes: Note[];
  todos: TodoItem[];
  fundBalance: (f: FundKey) => number;
}

const etb = (n: number) => `${Math.round(n).toLocaleString()} ETB`;

const table = (headers: string[], rows: (string | number)[][]) => `
<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:11pt">
<tr style="background:#e8efe9">${headers.map(h => `<th align="left">${h}</th>`).join('')}</tr>
${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">No records</td></tr>`}
</table>`;

export const buildReport = (s: ReportSnapshot) => {
  const dayName = new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  const todayOrders = s.orders.filter(o => o.date === s.date);
  const todayExpenses = s.expenses.filter(e => e.date === s.date);
  const todaySales = todayOrders.reduce((a, o) => a + o.total, 0);
  const todayCost = todayExpenses.reduce((a, e) => a + e.price, 0);
  const grossProfit = todayOrders.reduce((a, o) => a + o.items.reduce((b, i) => b + i.product.profit * i.quantity, 0), 0);
  const todayDiscount = todayOrders.reduce((a, o) => a + (o.discount || 0), 0);
  const todayNet = grossProfit - todayDiscount - todayCost;
  const funds: FundKey[] = ['rent', 'saving', 'ingredient', 'other'];
  const balance = funds.reduce((a, f) => a + s.fundBalance(f), 0);
  const alerts = getExpiryAlerts(s.materials);
  const withdrawals = s.txns.filter(t => t.type === 'withdraw');

  const summary =
    `Date: ${s.date} (${dayName})\n` +
    `Today's Sales: ${etb(todaySales)} | Orders: ${todayOrders.length}\n` +
    `Today's Cost: ${etb(todayCost)} | Discount: ${etb(todayDiscount)}\n` +
    `Today's Net Profit: ${etb(todayNet)}\n` +
    `Balance (all funds): ${etb(balance)}\n` +
    `Expired items: ${alerts.expired.length} (lost ${etb(alerts.lostAmount)})\n` +
    `Due to expiry: ${alerts.dueSoon.length} (at risk ${etb(alerts.riskAmount)})`;

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>The Anfield Stand Report</title></head>
<body style="font-family:Arial,sans-serif;color:#1c1c1c">
<h1>The Anfield Stand — Business Report</h1>
<p><b>Date:</b> ${s.date} (${dayName})</p>

<h2>1. Summary</h2>
${table(['Metric', 'Value'], [
    ["Today's Sales", etb(todaySales)],
    ["Today's Orders", todayOrders.length],
    ['Gross Profit', etb(grossProfit)],
    ['Discount Given', etb(todayDiscount)],
    ["Today's Cost", etb(todayCost)],
    ["Today's Net Profit", etb(todayNet)],
    ['Balance (all funds)', etb(balance)],
  ])}

<h2>2. Today's Sales</h2>
${table(['Order', 'Items', 'Subtotal', 'Discount', 'Total', 'Payment'], todayOrders.map(o => [
    `#${o.id.substring(0, 8)}`,
    o.items.map(i => `${i.product.name} x${i.quantity}`).join(', '),
    etb(o.subtotal), etb(o.discount || 0), etb(o.total), o.paymentMethod,
  ]))}
<p><i>In theory: total sales of ${etb(todaySales)} came from ${todayOrders.length} orders, average ${etb(todayOrders.length ? todaySales / todayOrders.length : 0)} per order.</i></p>

<h2>3. Cost</h2>
${table(['Date', 'Reason', 'Qty', 'Amount', 'Fund', 'Taken By'], s.expenses.map(e => [
    e.date, e.reason, e.quantity, etb(e.price), e.fund, `${e.takenBy} (${e.role})`,
  ]))}
<p><i>In theory: cost today is ${etb(todayCost)}, which is ${todaySales ? Math.round((todayCost / todaySales) * 100) : 0}% of today's sales.</i></p>

<h2>4. Balance &amp; Finance</h2>
${table(['Fund', 'Balance'], funds.map(f => [f, etb(s.fundBalance(f))]))}
<h3>Withdrawals</h3>
${table(['Date', 'Fund', 'Amount', 'Reason', 'By'], withdrawals.map(t => [t.date, t.fund, etb(t.amount), t.reason, t.by]))}
<p><i>In theory: the last balance across all funds is ${etb(balance)} after ${withdrawals.length} withdrawals.</i></p>

<h2>5. Store Take-Outs / Inventory</h2>
${table(['Material', 'Quantity', 'Measurement', 'Value', 'Expiry'], s.materials.map(m => [
    m.name, m.quantity, m.measurement, etb(m.totalPrice || m.quantity * m.pricePerUnit), m.expiredDate,
  ]))}

<h2>6. Due to Expiry</h2>
${table(['Material', 'Quantity', 'Value', 'Expiry', 'Days Left'], alerts.dueSoon.map(m => [
    m.name, `${m.quantity} ${m.measurement}`, etb(m.totalPrice || m.quantity * m.pricePerUnit), m.expiredDate, daysLeft(m.expiredDate),
  ]))}
<p><i>In theory: ${etb(alerts.riskAmount)} is at risk if these items are not used in time.</i></p>

<h2>7. Expired Items</h2>
${table(['Material', 'Quantity', 'Lost Amount', 'Expired On'], alerts.expired.map(m => [
    m.name, `${m.quantity} ${m.measurement}`, etb(m.totalPrice || m.quantity * m.pricePerUnit), m.expiredDate,
  ]))}
<p><i>In theory: total loss from expired materials is ${etb(alerts.lostAmount)}.</i></p>

<h2>8. Notes</h2>
${table(['Date', 'From', 'To', 'Subject', 'Read'], s.notes.map(n => [n.date, n.from, n.to, n.subject, n.read ? 'Yes' : 'No']))}

<h2>9. To-Do List</h2>
${table(['Task', 'Due Date', 'Status'], s.todos.map(t => [t.title, t.dueDate, t.done ? 'Done' : 'Pending']))}
</body></html>`;

  return { html, summary, filename: `Anfield-Report-${s.date}.doc`, dayName };
};

export const downloadWordReport = (s: ReportSnapshot) => {
  const { html, filename } = buildReport(s);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const sendReportToTelegram = async (cfg: TelegramConfig, s: ReportSnapshot) => {
  if (!cfg.botToken || !cfg.chatId) throw new Error('Set the Telegram bot token and chat ID first');
  const { html, summary, filename, dayName } = buildReport(s);
  const form = new FormData();
  form.append('chat_id', cfg.chatId);
  form.append('caption', `The Anfield Stand — Report\n${s.date} (${dayName})\n\n${summary}`);
  form.append('document', new Blob(['\ufeff', html], { type: 'application/msword' }), filename);
  const res = await fetch(`https://api.telegram.org/bot${cfg.botToken}/sendDocument`, { method: 'POST', body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) throw new Error(json?.description || `Telegram error (${res.status})`);
  return json;
};
