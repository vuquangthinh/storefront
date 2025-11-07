import { NextResponse } from 'next/server';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramMessage(text: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: body };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function verifyRecaptcha(token: string | undefined, ip: string | null): Promise<{ ok: boolean; score?: number; action?: string; error?: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5');
  if (!secret) {
    return { ok: false, error: 'Thiếu RECAPTCHA_SECRET_KEY' };
  }
  if (!token) {
    return { ok: false, error: 'Thiếu recaptchaToken' };
  }
  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  if (ip) params.append('remoteip', ip);

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();
    const success: boolean = Boolean(data.success);
    const score: number | undefined = typeof data.score === 'number' ? data.score : undefined;
    const action: string | undefined = typeof data.action === 'string' ? data.action : undefined;

    if (!success) {
      return { ok: false, error: 'reCAPTCHA không hợp lệ' };
    }
    if (typeof score === 'number' && score < minScore) {
      return { ok: false, score, action, error: `Điểm reCAPTCHA thấp (${score} < ${minScore})` };
    }
    if (action && action !== 'contact') {
      // Không chặn, nhưng cảnh báo sai action; vẫn ok để tránh false negative quá mức.
      return { ok: true, score, action };
    }
    return { ok: true, score, action };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : null;

    let name = '';
    let email = '';
    let subject = '';
    let message = '';
    let recaptchaToken: string | undefined;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = String(body?.name ?? '');
      email = String(body?.email ?? '');
      subject = String(body?.subject ?? '');
      message = String(body?.message ?? '');
      recaptchaToken = typeof body?.recaptchaToken === 'string' ? body.recaptchaToken : undefined;
    } else {
      const form = await req.formData();
      name = String(form.get('name') ?? '');
      email = String(form.get('email') ?? '');
      subject = String(form.get('subject') ?? '');
      message = String(form.get('message') ?? '');
      const tokenValue = form.get('recaptchaToken');
      recaptchaToken = typeof tokenValue === 'string' ? tokenValue : (tokenValue instanceof File ? undefined : undefined);
    }

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const recaptcha = await verifyRecaptcha(recaptchaToken, ip);
    if (!recaptcha.ok) {
      return NextResponse.json({ ok: false, error: recaptcha.error ?? 'Xác thực reCAPTCHA thất bại' }, { status: 400 });
    }

    const header = `<b>📩 Liên hệ mới</b>`;
    const ts = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const divider = '━━━━━━━━━━━━━━━━━━━━';
    const body = [
      `• <b>Họ tên:</b> ${escapeHtml(name)}`,
      `• <b>Email:</b> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`,
      subject ? `• <b>Chủ đề:</b> ${escapeHtml(subject)}` : '',
      `• <b>Nội dung:</b>`,
      `<pre>${escapeHtml(message)}</pre>`,
    ].filter(Boolean).join('\n');
    const text = `${header}\n${divider}\n${body}\n${divider}\n🕒 ${escapeHtml(ts)}`;

    const result = await sendTelegramMessage(text);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error ?? 'Gửi Telegram thất bại' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}