import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import {
	CheckCircle2,
	CreditCard,
	LoaderCircle,
	LockKeyhole,
	LogIn,
	Truck,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getStorefrontProducts } from "../features/catalog/catalog.functions";
import {
	createRazorpayCheckout,
	verifyRazorpayCheckout,
} from "../features/payments/payment.functions";
import {
	getMyProfile,
	saveMyProfile,
} from "../features/profile/profile.functions";

type RazorpayResponse = {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
};

declare global {
	interface Window {
		Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
	}
}

export const Route = createFileRoute("/checkout")({
	validateSearch: (search: Record<string, unknown>) => {
		const variantId = Number(search.variantId);
		const quantity = Number(search.quantity);
		return {
			variantId: Number.isInteger(variantId) && variantId > 0 ? variantId : 2,
			quantity:
				Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, 10) : 1,
		};
	},
	loader: () => getStorefrontProducts(),
	component: CheckoutPage,
	head: () => ({
		meta: [
			{ title: "Checkout — Molino Pastello" },
			{ name: "robots", content: "noindex, nofollow" },
			{ name: "description", content: "Secure Molino Pastello checkout." },
		],
	}),
});

function loadRazorpay() {
	if (window.Razorpay) return Promise.resolve(true);
	return new Promise<boolean>((resolve) => {
		const existing = document.querySelector<HTMLScriptElement>(
			"script[data-razorpay-checkout]",
		);
		if (existing) {
			existing.addEventListener(
				"load",
				() => resolve(Boolean(window.Razorpay)),
				{ once: true },
			);
			existing.addEventListener("error", () => resolve(false), { once: true });
			return;
		}
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.dataset.razorpayCheckout = "true";
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

function rupees(cents: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(cents / 100);
}

function CheckoutPage() {
	const { isSignedIn } = useUser();
	const products = Route.useLoaderData();
	const selected = Route.useSearch();
	const formRef = useRef<HTMLFormElement>(null);
	const [method, setMethod] = useState<"standard" | "express">("standard");
	const [state, setState] = useState<"idle" | "opening" | "paid">("idle");
	const [message, setMessage] = useState("");
	const [signInPromptOpen, setSignInPromptOpen] = useState(false);
	const items = useMemo(() => {
		const product = products.find(
			(item) => item.variantId === selected.variantId,
		);
		return product ? [{ ...product, quantity: selected.quantity }] : [];
	}, [products, selected.quantity, selected.variantId]);
	const subtotalCents = items.reduce(
		(total, item) => total + Math.round(item.price * 100) * item.quantity,
		0,
	);
	const shippingCents = method === "express" ? 890 : 0;
	const totalCents = subtotalCents + shippingCents;
	useEffect(() => {
		let active = true;
		if (!isSignedIn) return;
		void getMyProfile()
			.then((profile) => {
				if (!active || !formRef.current) return;
				const fields: Record<string, string> = {
					fullName: [profile.firstName, profile.lastName]
						.filter(Boolean)
						.join(" "),
					email: profile.email,
					phoneNumber: profile.phoneNumber ?? "",
					addressLine1: profile.addressLine1,
					city: profile.city,
					state: profile.state,
					postalCode: profile.postalCode,
					country: profile.country || "India",
				};
				for (const [name, value] of Object.entries(fields)) {
					const field = formRef.current.elements.namedItem(name);
					if (field instanceof HTMLInputElement && !field.value)
						field.value = value;
				}
			})
			.catch(() => undefined);
		return () => {
			active = false;
		};
	}, [isSignedIn]);

	const beginPayment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setMessage("");
		if (!isSignedIn) {
			setSignInPromptOpen(true);
			return;
		}
		if (!items.length) {
			setMessage("Your basket is empty. Please select a pasta from the shop.");
			return;
		}
		setState("opening");
		try {
			const form = new FormData(event.currentTarget);
			if (isSignedIn) {
				const nameParts = String(form.get("fullName") ?? "")
					.trim()
					.split(/\s+/);
				if (nameParts.length < 2) {
					throw new Error(
						"Please enter your first and last name so we can save your delivery profile.",
					);
				}
				await saveMyProfile({
					data: {
						firstName: nameParts[0],
						lastName: nameParts.slice(1).join(" "),
						addressLine1: String(form.get("addressLine1") ?? ""),
						city: String(form.get("city") ?? ""),
						state: String(form.get("state") ?? ""),
						postalCode: String(form.get("postalCode") ?? ""),
						country: String(form.get("country") ?? "India"),
					},
				});
			}
			const checkout = await createRazorpayCheckout({
				data: {
					email: String(form.get("email") ?? ""),
					fullName: String(form.get("fullName") ?? ""),
					phoneNumber: String(form.get("phoneNumber") ?? ""),
					addressLine1: String(form.get("addressLine1") ?? ""),
					city: String(form.get("city") ?? ""),
					state: String(form.get("state") ?? ""),
					postalCode: String(form.get("postalCode") ?? ""),
					country: String(form.get("country") ?? "India"),
					shippingMethod: method,
					items: items.map((item) => ({
						variantId: item.variantId,
						quantity: item.quantity,
					})),
				},
			});
			if (!(await loadRazorpay()) || !window.Razorpay)
				throw new Error(
					"Razorpay checkout could not load. Please check your connection and try again.",
				);
			const customerName = String(form.get("fullName") ?? "");
			const customerEmail = String(form.get("email") ?? "");
			const customerPhone = String(form.get("phoneNumber") ?? "");
			const razorpay = new window.Razorpay({
				key: checkout.keyId,
				amount: checkout.amount,
				currency: checkout.currency,
				name: "Molino Pastello",
				description: `Order ${checkout.orderNumber}`,
				order_id: checkout.providerOrderId,
				prefill: {
					name: customerName,
					email: customerEmail,
					contact: customerPhone,
				},
				theme: { color: "#f66a16" },
				handler: async (response: RazorpayResponse) => {
					try {
						const verified = await verifyRazorpayCheckout({
							data: {
								razorpayOrderId: response.razorpay_order_id,
								razorpayPaymentId: response.razorpay_payment_id,
								razorpaySignature: response.razorpay_signature,
							},
						});
						setState("paid");
						setMessage("Payment verified — opening your delivery details…");
						window.location.assign(`/order/${verified.orderId}`);
					} catch (error) {
						setState("idle");
						setMessage(
							error instanceof Error
								? error.message
								: "Payment verification failed. Please contact us before trying again.",
						);
					}
				},
				modal: { ondismiss: () => setState("idle") },
			});
			razorpay.open();
		} catch (error) {
			setState("idle");
			setMessage(
				error instanceof Error
					? error.message
					: "We could not begin the payment. Please try again.",
			);
		}
	};

	return (
		<main className="min-h-screen bg-[#fff8e9] py-11">
			<div className="mx-auto max-w-[1120px] px-5">
				<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
					Secure checkout
				</p>
				<h1 className="mt-3 font-serif text-5xl font-bold">Checkout</h1>
				<p className="mt-2 text-sm text-[#70452d]">
					A live Razorpay test checkout, secured by server-side payment
					verification.
				</p>
				<ol className="mt-7 flex max-w-xl items-center justify-between text-xs font-bold text-[#70452d]">
					<li className="flex items-center gap-2 text-[#a84716]">
						<span className="grid h-7 w-7 place-items-center rounded-full bg-[#f66a16] text-white">
							1
						</span>
						Information
					</li>
					<li className="mx-4 hidden h-px flex-1 bg-[#dfcfac] sm:block" />
					<li className="hidden items-center gap-2 sm:flex">
						<span className="grid h-7 w-7 place-items-center rounded-full border border-[#dfcfac]">
							2
						</span>
						Shipping
					</li>
					<li className="mx-4 hidden h-px flex-1 bg-[#dfcfac] sm:block" />
					<li className="hidden items-center gap-2 sm:flex">
						<span className="grid h-7 w-7 place-items-center rounded-full border border-[#dfcfac]">
							3
						</span>
						Payment
					</li>
				</ol>
				<div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
					<form
						id="checkout-details"
						ref={formRef}
						onSubmit={beginPayment}
						className="space-y-5"
					>
						{isSignedIn && (
							<p className="rounded-2xl border border-[#d9c6a8] bg-[#fffaf0] px-4 py-3 text-xs leading-5 text-[#70452d]">
								Your signed-in delivery profile is prefilled here. Any address
								changes are saved securely for your next checkout.
							</p>
						)}
						<Panel
							title="Contact details"
							subtitle="Where should we send your order updates?"
						>
							<Input
								label="Email address"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
							/>
							<Input
								label="Phone number (optional)"
								name="phoneNumber"
								type="tel"
								autoComplete="tel"
								placeholder="+91 98765 43210"
							/>
						</Panel>
						<Panel
							title="Shipping address"
							subtitle="Where should we deliver your order?"
						>
							<div className="grid gap-4 sm:grid-cols-2">
								<Input
									label="Full name"
									name="fullName"
									autoComplete="name"
									placeholder="Marco Bianchi"
								/>
								<Input
									label="Address"
									name="addressLine1"
									autoComplete="street-address"
									placeholder="Via del Mulino 14"
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<Input
									label="City"
									name="city"
									autoComplete="address-level2"
									placeholder="Mumbai"
								/>
								<Input
									label="State"
									name="state"
									autoComplete="address-level1"
									placeholder="Maharashtra"
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<Input
									label="Postal code"
									name="postalCode"
									autoComplete="postal-code"
									placeholder="400001"
								/>
								<Input
									label="Country"
									name="country"
									autoComplete="country-name"
									defaultValue="India"
								/>
							</div>
						</Panel>
						<Panel
							title="Delivery method"
							subtitle="Choose how you’d like to receive your order."
						>
							<DeliveryOption
								selected={method === "standard"}
								onChange={() => setMethod("standard")}
								title="Standard delivery"
								detail="3–5 business days"
								price="FREE"
							/>
							<DeliveryOption
								selected={method === "express"}
								onChange={() => setMethod("express")}
								title="Express delivery"
								detail="1–2 business days"
								price={rupees(890)}
							/>
						</Panel>
					</form>
					<aside className="h-fit rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(100,57,31,.08)]">
						<h2 className="font-serif text-2xl font-bold">Order summary</h2>
						<div className="mt-5 space-y-4 border-y border-[#eadfc9] py-5">
							{items.map((item) => (
								<div key={item.variantId} className="flex items-center gap-3">
									<img
										src={item.image}
										alt=""
										className="h-14 w-14 rounded-lg object-contain"
									/>
									<div className="min-w-0 flex-1">
										<p className="font-serif text-sm font-bold">{item.name}</p>
										<p className="text-[10px] text-[#70452d]">{item.detail}</p>
									</div>
									<strong className="text-sm">
										{rupees(Math.round(item.price * 100))}
									</strong>
								</div>
							))}
						</div>
						<dl className="mt-5 space-y-3 text-sm">
							<div className="flex justify-between">
								<dt>Subtotal</dt>
								<dd>{rupees(subtotalCents)}</dd>
							</div>
							<div className="flex justify-between">
								<dt>Shipping</dt>
								<dd className="font-bold text-[#66752a]">
									{shippingCents ? rupees(shippingCents) : "FREE"}
								</dd>
							</div>
							<div className="flex justify-between border-t border-[#eadfc9] pt-4 font-serif text-2xl">
								<dt>Total</dt>
								<dd className="text-[#f05f12]">{rupees(totalCents)}</dd>
							</div>
						</dl>
						<button
							type="submit"
							form="checkout-details"
							disabled={state === "opening" || state === "paid"}
							className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#f66a16] !bg-[#f66a16] py-4 text-xs font-bold uppercase tracking-wider !text-white shadow-[0_10px_22px_rgba(246,106,22,.28)] transition hover:-translate-y-0.5 hover:!bg-[#a84716] hover:shadow-[0_14px_28px_rgba(168,71,22,.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60"
						>
							{state === "opening" ? (
								<LoaderCircle className="animate-spin" size={15} />
							) : state === "paid" ? (
								<CheckCircle2 size={16} />
							) : (
								<LockKeyhole size={15} />
							)}
							{state === "opening"
								? "Opening Razorpay…"
								: state === "paid"
									? "Payment confirmed"
									: `Pay ${rupees(totalCents)}`}
						</button>
						{message && (
							<p
								aria-live="polite"
								className={`mt-4 rounded-xl p-3 text-center text-sm ${state === "paid" ? "bg-[#edf1d7] text-[#56611c]" : "bg-[#fff0e6] text-[#a84716]"}`}
							>
								{message}
							</p>
						)}
						<p className="mt-5 flex gap-2 text-xs leading-5 text-[#70452d]">
							<LockKeyhole className="shrink-0" size={15} />
							Razorpay test mode · server-verified payment
						</p>
						<p className="mt-2 flex gap-2 text-xs leading-5 text-[#70452d]">
							<CreditCard className="shrink-0" size={15} />
							UPI, cards and net banking available in the Razorpay modal
						</p>
					</aside>
				</div>
			</div>
			{signInPromptOpen && (
				<div
					className="fixed inset-0 z-50 grid place-items-center bg-[#432613]/45 p-5 backdrop-blur-sm"
					role="presentation"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget)
							setSignInPromptOpen(false);
					}}
				>
					<section
						role="dialog"
						aria-modal="true"
						aria-labelledby="checkout-sign-in-title"
						className="w-full max-w-md rounded-[2rem] border border-[#f2d7aa] bg-[#fffdf8] p-7 text-center shadow-2xl motion-safe:animate-[fade-in_.2s_ease-out]"
					>
						<div className="flex justify-end">
							<button
								type="button"
								onClick={() => setSignInPromptOpen(false)}
								aria-label="Close sign-in prompt"
								className="-mr-2 -mt-2 grid size-9 place-items-center rounded-full text-[#70452d] transition hover:bg-[#f3e8cc]"
							>
								<X size={18} />
							</button>
						</div>
						<div className="mx-auto -mt-2 grid size-14 place-items-center rounded-2xl bg-[#fff0d7] text-[#a84716]">
							<LockKeyhole size={25} />
						</div>
						<p className="mt-5 text-[10px] font-bold uppercase tracking-[.18em] text-[#a84716]">
							Your order, securely saved
						</p>
						<h2
							id="checkout-sign-in-title"
							className="mt-2 font-serif text-3xl font-bold text-[#64391f]"
						>
							Please sign in to checkout
						</h2>
						<p className="mt-3 text-sm leading-6 text-[#70452d]">
							Sign in or create an account to save your delivery details, view
							orders, and continue securely to payment.
						</p>
						<a
							href={`/auth?returnTo=${encodeURIComponent(`/checkout?variantId=${selected.variantId}&quantity=${selected.quantity}`)}`}
							className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f66a16] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white no-underline shadow-[0_10px_22px_rgba(246,106,22,.28)] transition hover:-translate-y-0.5 hover:bg-[#a84716]"
						>
							<LogIn size={16} /> Sign in to continue
						</a>
						<button
							type="button"
							onClick={() => setSignInPromptOpen(false)}
							className="mt-3 text-xs font-bold text-[#70452d] underline underline-offset-4 transition hover:text-[#a84716]"
						>
							Keep browsing
						</button>
					</section>
				</div>
			)}
		</main>
	);
}

function DeliveryOption({
	selected,
	onChange,
	title,
	detail,
	price,
}: {
	selected: boolean;
	onChange: () => void;
	title: string;
	detail: string;
	price: string;
}) {
	return (
		<label
			className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${selected ? "border-[#f66a16] bg-[#fffaf0]" : "border-[#dfcfac] hover:border-[#d6bf9a]"}`}
		>
			<span className="flex gap-3">
				<input type="radio" checked={selected} onChange={onChange} />
				<Truck size={20} />
				<span>
					<strong className="block text-sm">{title}</strong>
					<span className="text-xs text-[#70452d]">{detail}</span>
				</span>
			</span>
			<strong
				className={price === "FREE" ? "text-xs text-[#66752a]" : "text-xs"}
			>
				{price}
			</strong>
		</label>
	);
}

function Panel({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-[1.5rem] bg-white p-6 shadow-[0_8px_24px_rgba(100,57,31,.06)]">
			<h2 className="font-serif text-2xl font-bold">{title}</h2>
			<p className="mt-1 text-xs text-[#70452d]">{subtitle}</p>
			<div className="mt-5 space-y-4">{children}</div>
		</section>
	);
}

function Input({
	label,
	name,
	placeholder,
	type = "text",
	autoComplete,
	defaultValue,
}: {
	label: string;
	name: string;
	placeholder?: string;
	type?: string;
	autoComplete?: string;
	defaultValue?: string;
}) {
	return (
		<label className="block text-xs font-bold text-[#64391f]">
			{label}
			<input
				required={name !== "phoneNumber"}
				name={name}
				type={type}
				autoComplete={autoComplete}
				defaultValue={defaultValue}
				placeholder={placeholder}
				className="mt-2 w-full rounded-lg border border-[#dfcfac] px-3 py-3 text-sm font-normal outline-none transition focus:border-[#f66a16] focus:ring-2 focus:ring-[#f66a16]/15"
			/>
		</label>
	);
}
