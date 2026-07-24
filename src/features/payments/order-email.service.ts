import { PaymentRepository } from "./payment.repository";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

function escapeHtml(value: string) {
	return value.replace(
		/[&<>'"]/g,
		(character) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"'": "&#39;",
				'"': "&quot;",
			})[character] ?? character,
	);
}

function money(cents: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(cents / 100);
}

function publicUrl(path: string) {
	const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
		/\/$/,
		"",
	);
	return path.startsWith("http") ? path : `${baseUrl}${path}`;
}

/** Renders a client-safe, responsive email using broadly supported email CSS. */
function confirmationHtml(input: {
	orderNumber: string;
	recipientName: string;
	totalCents: number;
	address: string;
	trackUrl: string;
	items: Array<{ name: string; quantity: number; imageUrl: string | null }>;
}) {
	const itemRows = input.items
		.map(
			(item) =>
				`<tr><td style="padding:14px 0;border-bottom:1px solid #eadfc9"><img src="${escapeHtml(publicUrl(item.imageUrl ?? "/images/brand/molino-package-seal.png"))}" width="58" height="58" alt="${escapeHtml(item.name)}" style="display:block;width:58px;height:58px;object-fit:contain;background:#f3e8cc;border-radius:12px"></td><td style="padding:14px 12px;border-bottom:1px solid #eadfc9;color:#64391f;font-family:Arial,sans-serif;font-size:14px;font-weight:700">${escapeHtml(item.name)}<br><span style="color:#70452d;font-size:12px;font-weight:400">Quantity ${item.quantity}</span></td></tr>`,
		)
		.join("");
	return `<!doctype html><html><body style="margin:0;background:#fff8e9;color:#64391f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8e9;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border-radius:24px;overflow:hidden"><tr><td style="background:#64391f;padding:34px 36px;color:#fff8e9"><img src="${publicUrl("/images/brand/molino-wordmark-horizontal.png")}" width="190" alt="Molino Pastello" style="display:block;width:190px;max-width:100%;height:auto;border-radius:10px;background:#fff8e9;padding:7px 10px"><p style="margin:18px 0 0;color:#f9cb8b;font:700 10px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase">Molino Pastello</p><h1 style="margin:13px 0 0;font:700 36px Georgia,serif">Grazie mille, ${escapeHtml(input.recipientName)}.</h1><p style="margin:12px 0 0;color:#f6d9b1;font:14px/22px Arial,sans-serif">Your artisan pasta is being prepared with care.</p></td></tr><tr><td style="padding:34px 36px"><p style="margin:0;color:#a84716;font:700 10px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase">Order confirmed</p><p style="margin:8px 0 24px;font:700 22px Georgia,serif;color:#64391f">${escapeHtml(input.orderNumber)}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemRows}</table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px"><tr><td style="font:700 18px Georgia,serif;color:#64391f">Total paid</td><td align="right" style="font:700 20px Georgia,serif;color:#f05f12">${money(input.totalCents)}</td></tr></table><div style="margin-top:26px;padding:18px;background:#f3e8cc;border-radius:16px"><p style="margin:0 0 6px;color:#a84716;font:700 10px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase">Delivering to</p><p style="margin:0;color:#70452d;font:14px/21px Arial,sans-serif">${escapeHtml(input.address)}</p></div><p style="margin:28px 0 0"><a href="${escapeHtml(input.trackUrl)}" style="display:inline-block;background:#f66a16;border:2px solid #f66a16;border-radius:999px;padding:14px 22px;color:#fff;text-decoration:none;font:700 12px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase">Track your order</a></p><p style="margin:24px 0 0;color:#96745c;font:12px/19px Arial,sans-serif">You can return to your delivery page at any time to view the latest order status.</p></td></tr></table></td></tr></table></body></html>`;
}

export class OrderEmailService {
	constructor(private readonly repository = new PaymentRepository()) {}

	async sendConfirmation(orderId: string) {
		const apiKey = process.env.RESEND_API_KEY;
		const configuredFrom = process.env.EMAIL_FROM;
		const testRecipient = process.env.EMAIL_TO?.trim();
		const from =
			!configuredFrom || configuredFrom.includes("your-domain.com")
				? "Molino Pastello <onboarding@resend.dev>"
				: configuredFrom;
		if (!apiKey) {
			throw new Error(
				"Receipt email is not configured yet. Add RESEND_API_KEY and restart the server.",
			);
		}
		if (!from) {
			throw new Error(
				"Receipt email sender is not configured. Add EMAIL_FROM and restart the server.",
			);
		}
		const rows = await this.repository.getOrderEmailData(orderId);
		if (!rows.length)
			throw new Error("Could not prepare the order confirmation email.");
		const first = rows[0];
		const recipient = testRecipient || first.email;
		const address = [
			first.addressLine1,
			first.city,
			first.state,
			first.postalCode,
			first.country,
		]
			.filter(Boolean)
			.join(", ");
		const response = await fetch(RESEND_EMAILS_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				// EMAIL_TO is only for local Resend test mode. Remove it when a
				// verified domain is configured so each customer receives their own receipt.
				to: [recipient],
				subject: `Your Molino Pastello order ${first.orderNumber} is confirmed`,
				html: confirmationHtml({
					orderNumber: first.orderNumber,
					recipientName: first.recipientName ?? "friend",
					totalCents: first.totalCents,
					address,
					trackUrl: publicUrl(`/order/${orderId}`),
					items: rows.map((row) => ({
						name: row.productName ?? "Molino Pastello pasta",
						quantity: row.quantity,
						imageUrl: row.imageUrl,
					})),
				}),
			}),
		});
		if (!response.ok) {
			throw new Error(
				from.includes("onboarding@resend.dev")
					? "We couldn't send the receipt in test mode. Please try again shortly."
					: "We couldn't send the receipt right now. Please try again shortly.",
			);
		}
	}
}
