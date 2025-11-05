import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;   // base64 string
    encoding?: "base64";
    contentType?: string;
  }>;
};

function ensureArray(v?: string | string[]) {
  if (!v) return undefined;
  return Array.isArray(v) ? v : [v];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Payload>;
    if (!body.subject) {
      return NextResponse.json({ error: "subject is required" }, { status: 400 });
    }
    if (!body.text && !body.html) {
      return NextResponse.json({ error: "text or html is required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE) === "true", // true = 465
    //   auth: {
    //     user: process.env.SMTP_USER!,
    //     pass: process.env.SMTP_PASS!,
    //   },
      tls: {
        // องค์กรที่มี SSL inspection / self-signed
        rejectUnauthorized: !(String(process.env.SMTP_TLS_REJECT_UNAUTH) === "false"),
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ensureArray(body.to) ?? undefined,
      cc: ensureArray(body.cc) ?? undefined,
      bcc: ensureArray(body.bcc) ?? undefined,
      subject: body.subject!,
      text: body.text,
      html: body.html,
      attachments:
        body.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          encoding: a.encoding ?? "base64",
          contentType: a.contentType,
        })) ?? undefined,
    });

    return NextResponse.json(
      { ok: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("send-email error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
