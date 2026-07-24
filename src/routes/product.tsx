import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, Minus, Plus, Star, Truck } from "lucide-react";
import { useState } from "react";
import { pastaProducts } from "../lib/store-data";

const productReviews = [
	{
		name: "Lucia Ferraro",
		role: "Verified buyer · Florence",
		quote:
			"The ridges make every sauce cling beautifully. It has that proper al dente bite I look for in a good penne.",
		date: "2 weeks ago",
	},
	{
		name: "Chef Marco Valenti",
		role: "Verified buyer · Villa Rossa",
		quote:
			"A remarkably reliable shape for service. It holds its texture, looks beautiful on the plate, and tastes wonderfully clean.",
		date: "1 month ago",
	},
	{
		name: "Amelia Costa",
		role: "Verified buyer · London",
		quote:
			"My family’s new favourite for baked pasta. Beautiful packaging and even better pasta inside.",
		date: "2 months ago",
	},
];

export const Route = createFileRoute("/product")({
	component: ProductPage,
	head: () => ({
		meta: [
			{ title: "Organic Penne Rigate — Molino Pastello" },
			{
				name: "description",
				content:
					"Organic Penne Rigate, bronze-die extruded and slow dried in Italy.",
			},
		],
	}),
});
function ProductPage() {
	const [weight, setWeight] = useState("500g");
	const [quantity, setQuantity] = useState(1);
	const [open, setOpen] = useState("Ingredients");
	const product = pastaProducts[1];
	const [selectedImage, setSelectedImage] = useState(product.image);
	return (
		<main className="bg-[#fff8e9] pb-20">
			<div className="mx-auto max-w-[1200px] px-5 py-8">
				<p className="text-xs text-[#70452d]">
					<a className="text-[#70452d]" href="/">
						Home
					</a>{" "}
					<span className="mx-2">›</span>{" "}
					<a className="text-[#70452d]" href="/shop">
						Shop
					</a>{" "}
					<span className="mx-2">›</span> Organic Penne Rigate
				</p>
				<div className="mt-7 grid gap-9 lg:grid-cols-2">
					<section>
						<div className="relative rounded-[1.5rem] bg-[#f1d7a8] p-5">
							<img
								src={selectedImage}
								alt="Organic Penne Rigate package"
								className="aspect-square w-full rounded-xl object-contain transition duration-500"
							/>
						</div>
						<div className="mt-4 flex gap-3">
							{[
								product.image,
								"/images/products/molino-spaghetti-package-v2.webp",
								"/images/products/molino-fusilli-package-v2.webp",
							].map((image, index) => (
								<button
									type="button"
									key={image}
									onClick={() => setSelectedImage(image)}
									aria-label={`Show product image ${index + 1}`}
									aria-pressed={selectedImage === image}
									className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${selectedImage === image ? "border-[#f66a16] shadow-sm" : "border-transparent hover:border-[#d9bd91]"}`}
								>
									<img
										src={image}
										alt=""
										className="h-full w-full object-contain"
									/>
								</button>
							))}
						</div>
					</section>
					<section className="lg:py-5">
						<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a84716]">
							Organic collection
						</p>
						<div className="mt-3 flex items-start justify-between gap-4">
							<h1 className="font-serif text-5xl font-bold leading-[.96] text-[#64391f] sm:text-6xl">
								Organic Penne Rigate
							</h1>
							<strong className="shrink-0 font-serif text-2xl text-[#f05f12]">
								$14.00
							</strong>
						</div>
						<p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#96745c]">
							500g · rigid texture
						</p>
						<p className="mt-7 max-w-xl text-sm leading-7 text-[#70452d]">
							Crafted from organic durum wheat and bronze-die extruded for a
							ridged texture that holds sauce beautifully in every bite.
						</p>
						<div className="mt-7 border-t border-[#e6d5b5] pt-6">
							<p className="text-sm font-bold">Weight</p>
							<div className="mt-3 flex gap-3">
								{["500g", "1kg", "2kg"].map((item) => (
									<button
										type="button"
										key={item}
										onClick={() => setWeight(item)}
										className={`rounded-full border px-5 py-2.5 text-xs font-bold ${weight === item ? "border-[#f66a16] text-[#a84716]" : "border-[#dfcfac] text-[#70452d]"}`}
									>
										{item}
									</button>
								))}
							</div>
						</div>
						<div className="mt-6">
							<p className="text-sm font-bold">Quantity</p>
							<div className="mt-3 flex w-fit items-center rounded-full border border-[#dfcfac] bg-white">
								<button
									type="button"
									aria-label="Decrease quantity"
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									className="p-3"
								>
									<Minus size={16} />
								</button>
								<span className="w-9 text-center text-sm font-bold">
									{quantity}
								</span>
								<button
									type="button"
									aria-label="Increase quantity"
									onClick={() => setQuantity(quantity + 1)}
									className="p-3"
								>
									<Plus size={16} />
								</button>
							</div>
						</div>
						<button
							type="button"
							onClick={() =>
								window.dispatchEvent(
									new CustomEvent("pastalo:cart", { detail: quantity }),
								)
							}
							className="mt-7 w-full rounded-full bg-[#f66a16] px-5 py-4 text-xs font-bold uppercase tracking-[.16em] text-white"
						>
							Add to basket
						</button>
						<a
							href={`/checkout?variantId=2&quantity=${quantity}`}
							className="mt-3 block w-full rounded-full border border-[#70452d] px-5 py-4 text-center text-xs font-bold uppercase tracking-[.16em] text-[#64391f] no-underline"
						>
							Buy now
						</a>
						<div className="mt-7 grid gap-4 sm:grid-cols-2">
							<p className="flex gap-3 text-xs leading-5 text-[#70452d]">
								<Check className="shrink-0 text-[#6d7b2c]" size={18} />
								Organic & natural
								<br />
								Certified organic durum wheat.
							</p>
							<p className="flex gap-3 text-xs leading-5 text-[#70452d]">
								<Truck className="shrink-0 text-[#a84716]" size={18} />
								Fast delivery
								<br />
								Free shipping over $49.
							</p>
						</div>
					</section>
				</div>
				<section className="mt-14 grid gap-8 rounded-[1.75rem] border border-[#e3d1ae] bg-white/60 p-6 lg:grid-cols-[.6fr_1fr]">
					<div className="space-y-5">
						<p className="text-sm">
							<strong className="font-serif text-xl">
								Bronze die extruded
							</strong>
							<br />
							<span className="text-[#70452d]">
								Rough texture for better sauce grip.
							</span>
						</p>
						<p className="text-sm">
							<strong className="font-serif text-xl">Slow dried</strong>
							<br />
							<span className="text-[#70452d]">
								48-hour drying at low temperature.
							</span>
						</p>
						<p className="text-sm">
							<strong className="font-serif text-xl">Product of Italy</strong>
							<br />
							<span className="text-[#70452d]">
								Proudly crafted in the heart of Italy.
							</span>
						</p>
					</div>
					<div>
						{[
							"Ingredients",
							"Allergen information",
							"Nutritional information",
							"Cooking guidelines",
							"Sustainability",
						].map((title) => (
							<div key={title} className="border-b border-[#eadfc9]">
								<button
									type="button"
									onClick={() => setOpen(open === title ? "" : title)}
									aria-expanded={open === title}
									aria-controls={`product-detail-${title.toLowerCase().replaceAll(" ", "-")}`}
									className="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-[#64391f]"
								>
									{title}
									<ChevronDown
										className={`transition-transform duration-300 ${open === title ? "rotate-180" : ""}`}
										size={17}
									/>
								</button>
								<div
									id={`product-detail-${title.toLowerCase().replaceAll(" ", "-")}`}
									aria-hidden={open !== title}
									className={`grid transition-[grid-template-rows] duration-300 ease-out ${open === title ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
								>
									<div className="overflow-hidden">
										<p className="pb-4 text-sm leading-6 text-[#70452d]">
											Organic durum wheat semolina, water. Made with patience in
											Umbria, Italy.
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
				<section
					className="mt-14 border-t border-[#e3d1ae] pt-12"
					aria-labelledby="reviews-heading"
				>
					<div className="flex flex-wrap items-end justify-between gap-5">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
								From our table to yours
							</p>
							<h2
								id="reviews-heading"
								className="mt-2 font-serif text-4xl font-bold"
							>
								Loved by pasta people
							</h2>
						</div>
						<div className="rounded-2xl bg-[#64391f] px-5 py-3 text-white">
							<div
								className="flex items-center gap-1 text-[#f9b562]"
								aria-label="Rated 4.9 out of 5"
							>
								{Array.from({ length: 5 }).map((_, index) => (
									<Star key={index} size={14} fill="currentColor" />
								))}
							</div>
							<p className="mt-1 text-xs font-bold">4.9 / 5 from 124 reviews</p>
						</div>
					</div>
					<div className="mt-7 grid gap-4 md:grid-cols-3">
						{productReviews.map((review) => (
							<article
								key={review.name}
								className="rounded-3xl border border-[#e5d4b6] bg-white/70 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(100,57,31,.08)]"
							>
								<div
									className="flex items-center gap-1 text-[#f05f12]"
									aria-label="5 out of 5 stars"
								>
									{Array.from({ length: 5 }).map((_, index) => (
										<Star key={index} size={13} fill="currentColor" />
									))}
								</div>
								<p className="mt-4 font-serif text-lg italic leading-7 text-[#64391f]">
									“{review.quote}”
								</p>
								<footer className="mt-5 border-t border-[#eadfc9] pt-4">
									<p className="text-xs font-bold text-[#64391f]">
										{review.name}
									</p>
									<p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#96745c]">
										{review.role} · {review.date}
									</p>
								</footer>
							</article>
						))}
					</div>
				</section>
				<section className="mt-14">
					<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
						You may also love
					</p>
					<h2 className="mt-2 font-serif text-4xl font-bold">
						More pasta to explore
					</h2>
					<div className="mt-6 grid gap-5 sm:grid-cols-3">
						{pastaProducts
							.filter((item) => item.id !== product.id)
							.slice(0, 3)
							.map((item) => (
								<a
									href="/product"
									key={item.id}
									className="rounded-3xl border border-[#e4d2b2] bg-[#fffdf8] p-3 no-underline"
								>
									<img
										src={item.image}
										alt=""
										className="aspect-[4/3] w-full rounded-2xl object-cover"
									/>
									<h3 className="mt-3 font-serif text-xl font-bold text-[#64391f]">
										{item.name}
									</h3>
									<p className="mt-2 text-sm text-[#f05f12]">
										${item.price.toFixed(2)}
									</p>
								</a>
							))}
					</div>
				</section>
			</div>
		</main>
	);
}
