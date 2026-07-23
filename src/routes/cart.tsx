import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { pastaProducts } from "../lib/store-data";

export const Route = createFileRoute("/cart")({
	component: CartPage,
	head: () => ({
		meta: [
			{ title: "Your Basket — Molino Pastello" },
			{ name: "robots", content: "noindex, nofollow" },
			{
				name: "description",
				content: "Review your Molino Pastello pasta order and checkout.",
			},
		],
	}),
});

const initialItems = [
	{ ...pastaProducts[0], quantity: 2 },
	{ ...pastaProducts[1], quantity: 1 },
];

function CartPage() {
	const [items, setItems] = useState(initialItems);
	const [code, setCode] = useState("");
	const [message, setMessage] = useState("");
	const subtotal = useMemo(
		() => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
		[items],
	);
	const shipping = subtotal > 40 ? 0 : 8;
	const updateQuantity = (id: string, amount: number) =>
		setItems((current) =>
			current.flatMap((item) =>
				item.id === id
					? item.quantity + amount < 1
						? []
						: [{ ...item, quantity: item.quantity + amount }]
					: [item],
			),
		);
	return (
		<main className="min-h-screen bg-[#fff8e9] px-5 py-12 sm:py-16">
			<div className="mx-auto max-w-[1180px]">
				<p className="text-center text-[10px] font-bold uppercase tracking-[.24em] text-[#a84716]">
					Molino Pastello
				</p>
				<h1 className="mt-3 text-center font-serif text-5xl font-bold text-[#64391f] sm:text-6xl">
					Your Basket
				</h1>
				<p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-[#70452d]">
					A little piece of Italy, thoughtfully packed and ready for your
					kitchen.
				</p>
				<div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
					<section aria-label="Items in your basket" className="space-y-4">
						{items.length ? (
							items.map((item) => (
								<article
									key={item.id}
									className="flex gap-4 rounded-[1.5rem] bg-white p-4 shadow-[0_10px_30px_rgba(100,57,31,.08)] sm:gap-6 sm:p-5"
								>
									<img
										src={item.image}
										alt={`${item.name} package`}
										className="h-28 w-24 rounded-xl bg-[#f3e8cc] object-cover sm:h-32 sm:w-28"
									/>
									<div className="min-w-0 flex-1 py-1">
										<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
											Artisan pasta
										</p>
										<h2 className="mt-1 font-serif text-xl font-bold leading-tight text-[#64391f]">
											{item.name}
										</h2>
										<p className="mt-2 text-sm text-[#70452d]">{item.detail}</p>
										<div className="mt-4 flex items-center justify-between">
											<div className="flex items-center rounded-full border border-[#dfcfac] bg-[#fffaf0]">
												<button
													type="button"
													aria-label={`Remove one ${item.name}`}
													onClick={() => updateQuantity(item.id, -1)}
													className="p-2 text-[#64391f]"
												>
													<Minus size={15} />
												</button>
												<span className="w-7 text-center text-sm font-bold">
													{item.quantity}
												</span>
												<button
													type="button"
													aria-label={`Add one ${item.name}`}
													onClick={() => updateQuantity(item.id, 1)}
													className="p-2 text-[#64391f]"
												>
													<Plus size={15} />
												</button>
											</div>
											<button
												type="button"
												aria-label={`Remove ${item.name} from basket`}
												onClick={() =>
													setItems((current) =>
														current.filter((entry) => entry.id !== item.id),
													)
												}
												className="flex items-center gap-1 text-xs font-bold text-[#a84716]"
											>
												<Trash2 size={15} /> Remove
											</button>
										</div>
									</div>
									<strong className="whitespace-nowrap font-serif text-xl text-[#64391f]">
										${(item.price * item.quantity).toFixed(2)}
									</strong>
								</article>
							))
						) : (
							<div className="rounded-3xl border border-dashed border-[#cbb78d] p-10 text-center">
								<h2 className="font-serif text-2xl text-[#64391f]">
									Your basket is empty
								</h2>
								<a
									className="mt-4 inline-block rounded-full bg-[#f66a16] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white no-underline"
									href="/shop"
								>
									Explore pasta
								</a>
							</div>
						)}
					</section>
					<aside className="h-fit rounded-[1.5rem] bg-[#64391f] p-6 text-[#fff8e9] shadow-xl">
						<h2 className="font-serif text-2xl font-bold">Order summary</h2>
						<div className="mt-6 space-y-3 border-b border-white/20 pb-5 text-sm">
							<p className="flex justify-between">
								<span>Subtotal</span>
								<span>${subtotal.toFixed(2)}</span>
							</p>
							<p className="flex justify-between">
								<span>Delivery</span>
								<span>
									{shipping ? `$${shipping.toFixed(2)}` : "Complimentary"}
								</span>
							</p>
						</div>
						<p className="mt-5 flex justify-between font-serif text-2xl">
							<span>Total</span>
							<span>${(subtotal + shipping).toFixed(2)}</span>
						</p>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								setMessage(
									code.trim().toLowerCase() === "famiglia"
										? "Famiglia discount applied."
										: "Try code FAMIGLIA.",
								);
							}}
							className="mt-6"
						>
							<label className="sr-only" htmlFor="promo">
								Promo code
							</label>
							<div className="flex rounded-full bg-white p-1">
								<Tag className="m-2 text-[#a84716]" size={16} />
								<input
									id="promo"
									value={code}
									onChange={(event) => setCode(event.target.value)}
									placeholder="Promo code"
									className="min-w-0 flex-1 bg-transparent text-sm text-[#64391f] outline-none"
								/>
								<button
									type="submit"
									className="rounded-full bg-[#f66a16] px-4 text-[10px] font-bold uppercase tracking-wider text-white"
								>
									Apply
								</button>
							</div>
							{message && (
								<p aria-live="polite" className="mt-2 text-xs text-[#f9cb8b]">
									{message}
								</p>
							)}
						</form>
						<button
							type="button"
							disabled={!items.length}
							className="mt-5 w-full rounded-full bg-[#f66a16] px-5 py-4 text-xs font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#e6580b] disabled:cursor-not-allowed disabled:opacity-50"
						>
							Proceed to checkout
						</button>
						<p className="mt-4 text-center text-xs leading-5 text-[#f6d9b1]">
							Free delivery on orders over $40. Secure checkout.
						</p>
					</aside>
				</div>
				<section className="mt-16">
					<div className="flex items-end justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
								Complete the table
							</p>
							<h2 className="mt-2 font-serif text-3xl font-bold text-[#64391f]">
								You may also enjoy
							</h2>
						</div>
						<a href="/shop" className="text-sm font-bold text-[#a84716]">
							View all pasta
						</a>
					</div>
					<div className="mt-6 grid gap-5 sm:grid-cols-3">
						{pastaProducts.slice(2, 5).map((product) => (
							<a
								href="/shop"
								key={product.id}
								className="group overflow-hidden rounded-3xl bg-[#f3e8cc] p-4 no-underline"
							>
								<div className="relative">
									<img
										src={product.image}
										alt=""
										className="aspect-[4/3] w-full rounded-2xl object-cover transition duration-300 group-hover:scale-[1.02]"
									/>
								</div>
								<p className="mt-3 font-serif text-lg font-bold text-[#64391f]">
									{product.name}
								</p>
								<p className="mt-1 text-sm text-[#a84716]">
									${product.price.toFixed(2)}
								</p>
							</a>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}
