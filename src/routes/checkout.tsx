import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, LockKeyhole, Truck } from "lucide-react";
import { useState } from "react";
import { pastaProducts } from "../lib/store-data";
export const Route = createFileRoute("/checkout")({
	component: CheckoutPage,
	head: () => ({
		meta: [
			{ title: "Checkout — Molino Pastello" },
			{ name: "robots", content: "noindex, nofollow" },
			{ name: "description", content: "Secure Molino Pastello checkout." },
		],
	}),
});
function CheckoutPage() {
	const [method, setMethod] = useState("standard");
	const [paid, setPaid] = useState(false);
	const items = [pastaProducts[0], pastaProducts[1], pastaProducts[4]];
	return (
		<main className="min-h-screen bg-[#fff8e9] py-11">
			<div className="mx-auto max-w-[1120px] px-5">
				<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
					Secure checkout
				</p>
				<h1 className="mt-3 font-serif text-5xl font-bold">Checkout</h1>
				<p className="mt-2 text-sm text-[#70452d]">
					Complete your order in just a few steps.
				</p>
				<ol className="mt-7 flex max-w-xl items-center justify-between text-xs font-bold text-[#70452d]">
					<li className="flex items-center gap-2 text-[#a84716]">
						<span className="grid h-7 w-7 place-items-center rounded-full bg-[#f66a16] text-white">
							1
						</span>
						Information
					</li>
					<li className="hidden sm:block h-px flex-1 bg-[#dfcfac] mx-4" />
					<li className="hidden sm:flex items-center gap-2">
						<span className="grid h-7 w-7 place-items-center rounded-full border border-[#dfcfac]">
							2
						</span>
						Shipping
					</li>
					<li className="hidden sm:block h-px flex-1 bg-[#dfcfac] mx-4" />
					<li className="hidden sm:flex items-center gap-2">
						<span className="grid h-7 w-7 place-items-center rounded-full border border-[#dfcfac]">
							3
						</span>
						Payment
					</li>
				</ol>
				<div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setPaid(true);
						}}
						className="space-y-5"
					>
						<Panel
							title="Contact details"
							subtitle="Where should we send your order updates?"
						>
							<Input
								label="Email address"
								type="email"
								placeholder="e.g. marco@pastello.com"
							/>
							<Input
								label="Phone number (optional)"
								placeholder="e.g. +1 (555) 123–4567"
							/>
						</Panel>
						<Panel
							title="Shipping address"
							subtitle="Where should we deliver your order?"
						>
							<div className="grid gap-4 sm:grid-cols-2">
								<Input label="Full name" placeholder="e.g. Marco Bianchi" />
								<Input label="Address line 1" placeholder="Via del Mulino 14" />
							</div>
							<Input
								label="Address line 2 (optional)"
								placeholder="Apartment, suite, unit"
							/>
							<div className="grid gap-4 sm:grid-cols-2">
								<Input label="City" placeholder="Perugia" />
								<Input label="Postal code" placeholder="06121" />
							</div>
						</Panel>
						<Panel
							title="Delivery method"
							subtitle="Choose how you’d like to receive your order."
						>
							<label
								className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${method === "standard" ? "border-[#f66a16] bg-[#fffaf0]" : "border-[#dfcfac]"}`}
							>
								<span className="flex gap-3">
									<input
										type="radio"
										checked={method === "standard"}
										onChange={() => setMethod("standard")}
									/>
									<Truck size={20} />
									<span>
										<strong className="block text-sm">Standard delivery</strong>
										<span className="text-xs text-[#70452d]">
											3–5 business days
										</span>
									</span>
								</span>
								<strong className="text-xs text-[#66752a]">FREE</strong>
							</label>
							<label
								className={`mt-2 flex cursor-pointer items-center justify-between rounded-xl border p-4 ${method === "express" ? "border-[#f66a16] bg-[#fffaf0]" : "border-[#dfcfac]"}`}
							>
								<span className="flex gap-3">
									<input
										type="radio"
										checked={method === "express"}
										onChange={() => setMethod("express")}
									/>
									<Truck size={20} />
									<span>
										<strong className="block text-sm">Express delivery</strong>
										<span className="text-xs text-[#70452d]">
											1–2 business days
										</span>
									</span>
								</span>
								<strong className="text-xs">$8.90</strong>
							</label>
						</Panel>
						<Panel
							title="Payment"
							subtitle="All transactions are secure and encrypted."
						>
							<Input label="Card number" placeholder="1234 1234 1234 1234" />
							<div className="grid gap-4 sm:grid-cols-2">
								<Input label="Expiry date" placeholder="MM / YY" />
								<Input label="CVC" placeholder="123" />
							</div>
							<Input label="Name on card" placeholder="e.g. Marco Bianchi" />
						</Panel>
					</form>
					<aside className="h-fit rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(100,57,31,.08)]">
						<h2 className="font-serif text-2xl font-bold">Order summary</h2>
						<div className="mt-5 space-y-4 border-y border-[#eadfc9] py-5">
							{items.map((item) => (
								<div key={item.id} className="flex items-center gap-3">
									<div className="relative">
										<img
											src={item.image}
											alt=""
											className="h-14 w-14 rounded-lg object-cover"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-serif text-sm font-bold">{item.name}</p>
										<p className="text-[10px] text-[#70452d]">
											500g · bronze die
										</p>
									</div>
									<strong className="text-sm">${item.price.toFixed(2)}</strong>
								</div>
							))}
						</div>
						<dl className="mt-5 space-y-3 text-sm">
							<div className="flex justify-between">
								<dt>Subtotal</dt>
								<dd>$38.00</dd>
							</div>
							<div className="flex justify-between">
								<dt>Shipping</dt>
								<dd className="font-bold text-[#66752a]">
									{method === "standard" ? "FREE" : "$8.90"}
								</dd>
							</div>
							<div className="flex justify-between border-t border-[#eadfc9] pt-4 font-serif text-2xl">
								<dt>Estimated total</dt>
								<dd className="text-[#f05f12]">
									${method === "standard" ? "39.52" : "48.42"}
								</dd>
							</div>
						</dl>
						<button
							type="button"
							onClick={() => setPaid(true)}
							className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f66a16] py-4 text-xs font-bold uppercase tracking-wider text-white"
						>
							<LockKeyhole size={15} />
							Place order
						</button>
						{paid && (
							<p
								aria-live="polite"
								className="mt-4 rounded-xl bg-[#edf1d7] p-3 text-center text-sm text-[#56611c]"
							>
								Order placed — grazie mille!
							</p>
						)}
						<p className="mt-5 flex gap-2 text-xs leading-5 text-[#70452d]">
							<LockKeyhole className="shrink-0" size={15} />
							Secure SSL encrypted checkout
						</p>
						<p className="mt-2 flex gap-2 text-xs leading-5 text-[#70452d]">
							<CreditCard className="shrink-0" size={15} />
							Free shipping on orders over $50
						</p>
					</aside>
				</div>
			</div>
		</main>
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
	placeholder,
	type = "text",
}: {
	label: string;
	placeholder: string;
	type?: string;
}) {
	return (
		<label className="block text-xs font-bold text-[#64391f]">
			{label}
			<input
				required
				type={type}
				placeholder={placeholder}
				className="mt-2 w-full rounded-lg border border-[#dfcfac] px-3 py-3 text-sm font-normal outline-none focus:border-[#f66a16]"
			/>
		</label>
	);
}
