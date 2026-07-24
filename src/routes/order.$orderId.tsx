import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	CheckCircle2,
	ChevronRight,
	MapPin,
	PackageCheck,
	ShoppingBag,
	Truck,
} from "lucide-react";
import { useState } from "react";
import {
	getMyOrderDetails,
	resendMyOrderEmail,
} from "../features/analytics/analytics.functions";
import { getSessionAccess } from "../lib/auth";

export const Route = createFileRoute("/order/$orderId")({
	beforeLoad: async () => {
		const access = await getSessionAccess();
		if (!access.userId) throw redirect({ to: "/auth" });
	},
	loader: ({ params }) =>
		getMyOrderDetails({ data: { orderId: params.orderId } }),
	component: DeliveryPage,
	head: () => ({
		meta: [
			{ title: "Delivery details — Molino Pastello" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
});

const formatMoney = (cents: number) =>
	new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
		cents / 100,
	);

function DeliveryPage() {
	const order = Route.useLoaderData();
	const [emailState, setEmailState] = useState<
		"idle" | "sending" | "sent" | "error"
	>("idle");
	const [emailError, setEmailError] = useState("");
	const placed = new Date(order.createdAt);
	const arrival = new Date(placed);
	arrival.setDate(arrival.getDate() + (order.status === "processing" ? 2 : 4));
	const stages = [
		"Order confirmed",
		"Packed with care",
		"On its way",
		"Delivered",
	];
	const currentStage =
		order.status === "fulfilled" ? 3 : order.status === "processing" ? 1 : 0;
	const resend = async () => {
		setEmailState("sending");
		setEmailError("");
		try {
			await resendMyOrderEmail({ data: { orderId: order.id } });
			setEmailState("sent");
		} catch (error) {
			setEmailState("error");
			setEmailError(
				error instanceof Error
					? error.message
					: "We couldn't send that receipt right now.",
			);
		}
	};
	return (
		<main className="min-h-screen bg-[#fff8e9] px-5 py-12 text-[#64391f] sm:py-16">
			<div className="mx-auto max-w-3xl">
				<a
					href="/dashboard#orders"
					className="inline-flex items-center gap-1 text-sm font-bold text-[#a84716] no-underline"
				>
					<ChevronRight className="rotate-180" size={16} /> Your orders
				</a>
				<section className="mt-6 overflow-hidden rounded-[2rem] bg-[#64391f] p-7 text-white shadow-[0_18px_45px_rgba(100,57,31,.18)] sm:p-10">
					<div className="flex flex-wrap items-start justify-between gap-5">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f9cb8b]">
								Delivery tracking
							</p>
							<h1 className="mt-3 font-serif text-4xl font-bold">
								Your pasta is on its way.
							</h1>
							<p className="mt-3 text-sm text-[#f6d9b1]">
								Order {order.orderNumber} · {order.itemCount} artisan packs
							</p>
						</div>
						<span className="grid size-12 place-items-center rounded-2xl bg-[#f66a16]">
							<Truck size={23} />
						</span>
					</div>
					<div className="mt-8 rounded-2xl bg-white/10 p-5">
						<p className="text-xs text-[#f6d9b1]">Estimated arrival</p>
						<p className="mt-1 font-serif text-2xl font-bold">
							{new Intl.DateTimeFormat("en-IN", {
								weekday: "long",
								day: "numeric",
								month: "long",
							}).format(arrival)}
						</p>
						<p className="mt-2 text-xs text-[#f6d9b1]">
							Standard delivery: 3–5 business days after confirmation.
						</p>
					</div>
				</section>
				<section className="mt-7 rounded-[1.75rem] bg-white p-7 shadow-[0_10px_28px_rgba(100,57,31,.07)]">
					<div className="flex items-center gap-3">
						<PackageCheck className="text-[#a84716]" />
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
								Live order status
							</p>
							<h2 className="font-serif text-2xl font-bold capitalize">
								{order.status}
							</h2>
						</div>
					</div>
					<ol className="mt-7 grid gap-5 sm:grid-cols-4">
						{stages.map((stage, index) => (
							<li key={stage} className="flex items-center gap-3 sm:block">
								<span
									className={`grid size-8 place-items-center rounded-full ${index <= currentStage ? "bg-[#f66a16] text-white" : "bg-[#f3e8cc] text-[#96745c]"}`}
								>
									{index < currentStage ? (
										<CheckCircle2 size={16} />
									) : (
										index + 1
									)}
								</span>
								<p
									className={`mt-0 text-sm font-bold sm:mt-3 ${index <= currentStage ? "text-[#64391f]" : "text-[#96745c]"}`}
								>
									{stage}
								</p>
							</li>
						))}
					</ol>
				</section>
				<div className="mt-7 grid gap-7 sm:grid-cols-2">
					<section className="rounded-[1.75rem] border border-[#e0cfae] bg-white/70 p-6">
						<ShoppingBag className="text-[#a84716]" />
						<h2 className="mt-4 font-serif text-2xl font-bold">
							Order details
						</h2>
						<ul className="mt-4 space-y-2 text-sm text-[#70452d]">
							{order.items.map((item) => (
								<li key={`${item.name}-${item.quantity}`}>
									{item.quantity} × {item.name}
								</li>
							))}
						</ul>
						<p className="mt-5 border-t border-[#eadfc9] pt-4 font-serif text-xl font-bold">
							Total {formatMoney(order.totalCents)}
						</p>
					</section>
					<section className="rounded-[1.75rem] border border-[#e0cfae] bg-white/70 p-6">
						<MapPin className="text-[#a84716]" />
						<h2 className="mt-4 font-serif text-2xl font-bold">
							Delivering to
						</h2>
						<p className="mt-4 text-sm leading-6 text-[#70452d]">
							{order.deliveryAddress ??
								"Your delivery address will be confirmed shortly."}
						</p>
					</section>
				</div>
				<div className="mt-7 rounded-[1.75rem] border border-[#e0cfae] bg-white/70 p-6">
					<p className="text-sm leading-6 text-[#70452d]">
						Need the receipt again? We’ll send the Molino Pastello order email
						to the address used at checkout.
					</p>
					<button
						type="button"
						disabled={emailState === "sending" || emailState === "sent"}
						onClick={() => void resend()}
						className="mt-4 rounded-full border-2 border-[#f66a16] !bg-[#f66a16] px-5 py-3 text-xs font-bold uppercase tracking-wider !text-white transition hover:!bg-[#a84716] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{emailState === "sending"
							? "Sending…"
							: emailState === "sent"
								? "Receipt sent"
								: "Email my receipt again"}
					</button>
					{emailState === "sent" && (
						<p className="mt-3 text-sm font-semibold text-[#56611c]">
							Receipt request accepted. Check the Resend account owner inbox
							while testing locally.
						</p>
					)}
					{emailState === "error" && (
						<p className="mt-3 text-sm font-semibold text-[#a84716]">
							{emailError}
						</p>
					)}
				</div>
			</div>
		</main>
	);
}
