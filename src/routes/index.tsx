import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	Leaf,
	PackageCheck,
	Sprout,
	Wheat,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({ component: HomePage });

const products = [
	{
		name: "Traditional Spaghetti No. 5",
		detail: "500g · bronze die",
		price: "$12.00",
		image: "/images/products/molino-spaghetti-package-v2.webp",
	},
	{
		name: "Organic Penne Rigate",
		detail: "500g · ridged texture",
		price: "$14.00",
		image: "/images/products/molino-penne-package-v2.webp",
	},
	{
		name: "Hand-Twisted Fusilli",
		detail: "500g · slow dried",
		price: "$14.00",
		image: "/images/products/molino-fusilli-package-v2.webp",
	},
];

const recipes = [
	[
		"Spaghetti al Limone",
		"/images/home/recipe-limone-new.png",
		"/recipes/spaghetti-al-limone",
	],
	[
		"Pasta al Pomodoro",
		"/images/home/recipe-pomodoro-new.png",
		"/recipes/classic-pomodoro",
	],
	[
		"Garden Spaghetti",
		"/images/home/recipe-garden-new.png",
		"/recipes/garden-spaghetti",
	],
	[
		"Sunday Ragù",
		"/images/home/recipe-ragu-new.png",
		"/recipes/slow-sunday-ragu",
	],
];

const reviews = [
	{
		quote:
			"The texture of Molino Pastello’s bronze-cut pasta is unparalleled. It holds the sauce like no other commercial brand I’ve ever used in my kitchen.",
		name: "Chef Marco Valenti",
		attribution: "Michelin Star · Villa Rossa",
	},
	{
		quote:
			"Using this pasta transformed my home cooking. You can taste the quality of the grain and the heritage in every single bite. Truly extraordinary.",
		name: "Lucia Ferraro",
		attribution: "Culinary Blogger · The Pasta Table",
	},
	{
		quote:
			"It is the rare pantry staple that makes a weeknight dinner feel considered. The shape, the bite, the finish: all exactly right.",
		name: "Elena Rossi",
		attribution: "Food Editor · Tavola Journal",
	},
	{
		quote:
			"Molino Pastello has become the pasta I reach for in service. Its structure stays beautiful from the first plate to the last.",
		name: "Chef Daniel Moretti",
		attribution: "Executive Chef · Casa Verde",
	},
	{
		quote:
			"The packaging is lovely, but it is what is inside that made me a regular. Every sauce clings beautifully and the flavour is so clean.",
		name: "Sofia Bianchi",
		attribution: "Home Cook · Florence",
	},
	{
		quote:
			"There is a generosity to this pasta: a golden colour, a proper chew, and the confidence to stand up to the simplest tomato sauce.",
		name: "Gianni Esposito",
		attribution: "Sommelier & Restaurateur · Napoli",
	},
];

const reviewSlides = [
	reviews.slice(0, 2),
	reviews.slice(2, 4),
	reviews.slice(4, 6),
];

function HomePage() {
	const [basket, setBasket] = useState(0);
	const [notice, setNotice] = useState("");
	const [query, setQuery] = useState("");
	const [reviewIndex, setReviewIndex] = useState(0);
	const [reviewsPaused, setReviewsPaused] = useState(false);
	const [heroArtVisible, setHeroArtVisible] = useState(false);
	const heroArtRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const updateSearch = (event: Event) =>
			setQuery((event as CustomEvent<string>).detail);
		window.addEventListener("pastalo:search", updateSearch);
		return () => window.removeEventListener("pastalo:search", updateSearch);
	}, []);
	useEffect(() => {
		if (reviewsPaused) return;
		const timer = window.setInterval(
			() => setReviewIndex((current) => (current + 1) % reviewSlides.length),
			3800,
		);
		return () => window.clearInterval(timer);
	}, [reviewsPaused]);
	useEffect(() => {
		const heroArt = heroArtRef.current;
		if (!heroArt) return;
		const observer = new IntersectionObserver(
			([entry]) => setHeroArtVisible(entry.isIntersecting),
			{ threshold: 0.2 },
		);
		observer.observe(heroArt);
		return () => observer.disconnect();
	}, []);
	const visibleProducts = products.filter((product) =>
		`${product.name} ${product.detail}`
			.toLowerCase()
			.includes(query.toLowerCase()),
	);
	const addToBasket = (name: string) => {
		const next = basket + 1;
		setBasket(next);
		window.dispatchEvent(new CustomEvent("pastalo:cart", { detail: next }));
		setNotice(`${name} added to your basket.`);
	};

	return (
		<main>
			<section className="pastalo-hero px-5 py-12 sm:py-16 lg:py-20">
				<div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1fr_.9fr]">
					<div>
						<h1 className="max-w-[600px] font-serif text-5xl font-bold leading-[.98] tracking-[-.04em] text-white sm:text-6xl lg:text-7xl">
							Authentic
							<br />
							Italian Pasta,
							<br />
							<em className="font-medium">
								Crafted with
								<br />
								Passion.
							</em>
						</h1>
						<p className="mt-6 max-w-sm text-sm leading-6 text-white/90">
							Bringing the soul of the Italian countryside to your kitchen.
							Slow-dried, bronze-die extruded, and made from the finest organic
							durum wheat.
						</p>
						<div className="mt-7 flex flex-wrap gap-3">
							<a className="pastalo-button pastalo-button-dark" href="#shop">
								Shop the Collection <ArrowRight size={14} />
							</a>
							<a className="pastalo-button pastalo-button-light" href="#story">
								Our Story
							</a>
						</div>
					</div>
					<div
						ref={heroArtRef}
						className={`hero-product-scene relative mx-auto w-full max-w-[480px] ${heroArtVisible ? "is-visible" : ""}`}
					>
						<div className="hero-pasta-scatter" aria-hidden="true">
							<span className="hero-pasta hero-pasta--fusilli" />
							<span className="hero-pasta hero-pasta--farfalle" />
							<span className="hero-pasta hero-pasta--rigatoni" />
							<span className="hero-pasta hero-pasta--spaghetti" />
							<span className="hero-pasta hero-pasta--fusilli hero-pasta--small" />
							<span className="hero-pasta hero-pasta--farfalle hero-pasta--large" />
							<span className="hero-pasta hero-pasta--rigatoni hero-pasta--large-rigatoni" />
							<span className="hero-pasta hero-pasta--fusilli hero-pasta--edge" />
						</div>
						<div className="absolute -right-4 top-8 hidden text-8xl font-bold text-white/20 md:block">
							〰
						</div>
						<picture>
							<source
								media="(min-width: 640px)"
								srcSet="/images/home/hero-molino-three-packages-v2.webp"
							/>
							<img
								src="/images/home/hero-molino-three-packages-v2.webp"
								alt="Molino Pastello Penne, Fusilli and Spaghetti packages with Italian wheat and grains"
								className="relative z-10 h-[275px] w-full object-cover shadow-[11px_12px_0_rgba(121,61,24,.22)] sm:h-[370px]"
							/>
						</picture>
					</div>
				</div>
			</section>

			<section id="shop" className="bg-[#fff5df] px-5 py-16 sm:py-20">
				<div className="mx-auto max-w-[1120px]">
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div>
							<h2 className="font-serif text-3xl font-bold text-[#62391f] sm:text-4xl">
								The Signature Selection
							</h2>
							<p className="mt-1 text-xs text-[#70452d]">
								Meticulously crafted shapes for every culinary masterpiece.
							</p>
						</div>
						<div className="flex items-center gap-4">
							<p
								className="hidden text-[10px] font-bold uppercase tracking-wider text-[#94360c] sm:block"
								aria-live="polite"
							>
								{query
									? `${visibleProducts.length} matching varieties`
									: "Three signature varieties"}
							</p>
							<a
								href="/shop"
								className="inline-flex items-center gap-2 rounded-full bg-[#64391f] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.12em] text-white no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4f2d19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4701e]"
							>
								View all pasta <ArrowRight size={14} />
							</a>
						</div>
					</div>
					<div className="mt-9 grid gap-5 md:grid-cols-3">
						{visibleProducts.map((product) => (
							<article key={product.name} className="group">
								<div className="relative overflow-hidden rounded-xl bg-[#f5ecd9] p-3 sm:p-4">
									<picture>
										<source
											media="(min-width: 640px)"
											srcSet={product.image.replace(".png", "-desktop.png")}
										/>
										<img
											src={product.image.replace(
												"/images/home/",
												"/images/home/mobile/",
											)}
											alt={`${product.name} artisan pasta package`}
											className="h-56 w-full object-contain transition duration-300 group-hover:scale-[1.03]"
										/>
									</picture>
								</div>
								<div className="mt-3">
									<div className="flex items-start gap-3">
										<div>
										<h3 className="font-serif text-base font-bold text-[#64391f]">
											{product.name}
										</h3>
										<p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#70452d]">
											{product.detail}
										</p>
										</div>
										<span className="ml-auto shrink-0 font-serif text-sm font-bold text-[#94360c]">
											{product.price}
										</span>
									</div>
									<button
										type="button"
										onClick={() => addToBasket(product.name)}
										className="mt-4 inline-flex w-full items-center justify-center rounded-full border-2 border-solid border-[#64391f] bg-transparent px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#64391f] transition hover:-translate-y-0.5 hover:text-[#f05f12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4701e]"
										style={{ border: "2px solid #64391f", borderRadius: "9999px" }}
										onPointerEnter={(event) => {
											event.currentTarget.style.borderColor = "#f05f12";
										}}
										onPointerLeave={(event) => {
											event.currentTarget.style.borderColor = "#64391f";
										}}
									>
										Add to basket
									</button>
								</div>
							</article>
						))}
						{visibleProducts.length === 0 && (
							<p className="col-span-full rounded-xl border border-dashed border-[#d9c6a8] p-8 text-center text-sm text-[#70452d]">
								No pasta matches “{query}”.
							</p>
						)}
					</div>
				</div>
			</section>

			<section
				id="story"
				className="bg-[#55603f] px-5 py-14 text-[#fff6e4] sm:py-20"
			>
				<div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[.95fr_1.05fr]">
					<div className="relative mx-auto max-w-sm">
						<img
							src="/images/home/heritage-mill.png"
							alt="Historic Molino Pastello flour mill"
							className="h-[440px] w-full rounded-lg object-cover grayscale"
						/>
						<blockquote className="absolute -bottom-4 -right-3 max-w-[160px] rounded-lg bg-[#fff6e4] p-4 font-serif text-sm italic leading-5 text-[#64391f] shadow-lg">
							“The secret is in the time we give the dough to breathe.”
							<footer className="mt-2 font-sans text-[8px] not-italic font-bold uppercase tracking-wider">
								— Nonno Pastello
							</footer>
						</blockquote>
					</div>
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#fff5df]">
							Our Heritage
						</p>
						<h2 className="mt-4 max-w-md font-serif text-4xl font-bold leading-tight sm:text-5xl">
							Since 1924, A Legacy of Flour &amp; Water
						</h2>
						<p className="mt-6 max-w-md text-sm leading-6 text-[#fff6e4]/80">
							Molino Pastello began in a small stone mill in the heart of
							Umbria. Our founder believed that the finest pasta required only
							two things: the patience of a craftsman and the highest quality
							grains from our local fields.
						</p>
						<p className="mt-4 max-w-md text-sm leading-6 text-[#fff6e4]/80">
							Today, we continue that tradition. Every batch is extruded through
							traditional bronze dies to create a rough, porous surface that
							grips your sauce perfectly.
						</p>
						<a
							href="#process"
							className="pastalo-button mt-7 bg-[#64391f] text-white"
						>
							Discover Our Process <ArrowRight size={14} />
						</a>
					</div>
				</div>
			</section>

			<section
				id="process"
				className="bg-[#fff8e9] px-5 py-16 text-center sm:py-20"
			>
				<div className="mx-auto max-w-[1120px]">
					<h2 className="font-serif text-3xl font-bold text-[#64391f] sm:text-4xl">
						From Field to Fork
					</h2>
					<p className="mt-2 text-xs text-[#70452d]">
						We oversee every step of the journey to ensure the most exquisite
						pasta lands on your plate.
					</p>
					<div className="mt-10 grid gap-8 border-t border-[#e7d7bb] pt-8 sm:grid-cols-2 lg:grid-cols-4">
						<ProcessStep
							icon={<Sprout />}
							title="1. Pure Grains"
							text="Sourced from organic heirloom wheat varieties grown in nutrient-rich Italian soil."
						/>
						<ProcessStep
							icon={<Wheat />}
							title="2. Stone Milled"
							text="Carefully crushed to retain the whole germ and all its natural, nutty flavour."
						/>
						<ProcessStep
							icon={<Leaf />}
							title="3. Slow Drying"
							text="Patience is our key ingredient. Dried for 48 hours at low temperatures."
						/>
						<ProcessStep
							icon={<PackageCheck />}
							title="4. Hand Packed"
							text="Every bag is inspected and sealed by hand in our sustainable packaging."
						/>
					</div>
				</div>
			</section>

			<section
				id="reviews"
				className="bg-[#63391f] px-5 py-16 text-[#fff5df] sm:py-20"
			>
				<div className="mx-auto max-w-[920px]">
					<p className="text-center text-[10px] font-bold uppercase tracking-[.2em] text-[#ffc79f]">
						The Critic&apos;s Choice
					</p>
					<h2 className="mt-3 text-center font-serif text-3xl font-bold sm:text-4xl">
						What Our Chefs Say
					</h2>
					<div
						className="mt-9"
						onMouseEnter={() => setReviewsPaused(true)}
						onMouseLeave={() => setReviewsPaused(false)}
						onFocusCapture={() => setReviewsPaused(true)}
						onBlurCapture={() => setReviewsPaused(false)}
					>
						<div className="overflow-hidden" aria-roledescription="carousel">
							<div
								className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
								style={{ transform: `translateX(-${reviewIndex * 100}%)` }}
							>
								{reviewSlides.map((slide, index) => (
									<div
										key={`review-slide-${index + 1}`}
										className="grid w-full shrink-0 grid-cols-2 gap-4 px-1 sm:gap-10"
										aria-hidden={reviewIndex !== index}
									>
										{slide.map((review) => (
											<Testimonial key={review.name} {...review} />
										))}
									</div>
								))}
							</div>
						</div>
						<div
							className="mt-8 flex items-center justify-center gap-4"
							aria-label="Review slides"
						>
							<button
								type="button"
								onClick={() =>
									setReviewIndex(
										(current) =>
											(current - 1 + reviewSlides.length) % reviewSlides.length,
									)
								}
								aria-label="Show previous reviews"
								className="grid size-8 place-items-center rounded-full border border-[#fff5df]/35 text-[#fff5df] transition hover:border-[#f4701e] hover:bg-[#f4701e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fff5df]"
							>
								<ArrowLeft size={15} />
							</button>
							<div className="flex items-center gap-2">
								{reviewSlides.map((slide, index) => (
									<button
										type="button"
										key={`review-dot-${index + 1}`}
										onClick={() => setReviewIndex(index)}
										aria-label={`Show review pair ${index + 1}: ${slide.map((review) => review.name).join(" and ")}`}
										aria-current={reviewIndex === index ? "true" : undefined}
										className={`rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fff5df] ${reviewIndex === index ? "h-2.5 w-7 bg-[#f4701e]" : "size-2.5 bg-[#fff5df]/35 hover:bg-[#fff5df]/70"}`}
									/>
								))}
							</div>
							<button
								type="button"
								onClick={() =>
									setReviewIndex(
										(current) => (current + 1) % reviewSlides.length,
									)
								}
								aria-label="Show next reviews"
								className="grid size-8 place-items-center rounded-full border border-[#fff5df]/35 text-[#fff5df] transition hover:border-[#f4701e] hover:bg-[#f4701e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fff5df]"
							>
								<ArrowRight size={15} />
							</button>
						</div>
					</div>
				</div>
			</section>

			<section
				id="recipes"
				className="bg-[#fff8e9] px-5 py-16 text-center sm:py-20"
			>
				<div className="mx-auto max-w-[1120px]">
					<h2 className="font-serif text-3xl font-bold text-[#64391f] sm:text-4xl">
						From Our Kitchen to Yours
					</h2>
					<p className="mt-2 text-xs text-[#70452d]">
						Discover the passion behind every recipe.
					</p>
					<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
						{recipes.map(([name, image, href]) => (
							<a
								href={href}
								key={name}
								className="group relative overflow-hidden rounded-lg"
							>
								<img
									src={image}
									alt={name}
									className="aspect-square w-full object-cover"
								/>
								<span className="absolute inset-x-0 bottom-0 bg-[#64391f]/75 p-2 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
									{name}
								</span>
							</a>
						))}
					</div>
					<a
						href="/recipes"
						className="mt-8 inline-flex rounded-full border border-[#8a644a] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#64391f]"
					>
						Explore All Recipes
					</a>
				</div>
			</section>

			<section
				id="newsletter"
				className="bg-[#f66a16] px-5 py-16 text-center text-white sm:py-20"
			>
				<div className="mx-auto max-w-md">
					<span className="inline-grid size-10 place-items-center rounded-full bg-white/20">
						✦
					</span>
					<h2 className="mt-4 font-serif text-4xl font-bold">
						Join the Famiglia
					</h2>
					<p className="mt-3 text-sm text-[#3a1f10]">
						Receive exclusive recipes, early access to limited edition shapes,
						and a 15% discount on your first order.
					</p>
					<form
						className="mx-auto mt-6 flex max-w-sm flex-col gap-2 rounded-2xl border-2 border-white bg-white p-2 sm:flex-row sm:gap-0 sm:rounded-full sm:p-1"
						onSubmit={(event) => {
							event.preventDefault();
							setNotice("Grazie! You’re on the Famiglia list.");
						}}
					>
						<label className="sr-only" htmlFor="email">
							Email address
						</label>
						<input
							id="email"
							type="email"
							autoComplete="email"
							required
							placeholder="Your email address"
							className="min-w-0 flex-1 rounded-full px-4 py-3 text-sm text-[#64391f] outline-none sm:py-2"
						/>
						<button
							type="submit"
							className="newsletter-submit min-h-11 shrink-0 rounded-full px-6 py-3 text-[10px] font-bold uppercase tracking-wider shadow-sm sm:min-h-0 sm:px-4 sm:py-2"
						>
							Subscribe
						</button>
					</form>
					<p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-[#3a1f10]">
						We respect your privacy. Unsubscribe anytime.
					</p>
				</div>
			</section>
			<output className="sr-only" aria-live="polite">
				{notice}
			</output>
		</main>
	);
}

function ProcessStep({
	icon,
	title,
	text,
}: {
	icon: React.ReactNode;
	title: string;
	text: string;
}) {
	return (
		<article>
			<div className="mx-auto grid size-14 place-items-center rounded-full border border-[#f4701e] text-[#f4701e] shadow-[0_4px_0_#f4701e]/20">
				{icon}
			</div>
			<h3 className="mt-4 font-serif text-base font-bold text-[#64391f]">
				{title}
			</h3>
			<p className="mx-auto mt-2 max-w-[180px] text-xs leading-5 text-[#70452d]">
				{text}
			</p>
		</article>
	);
}
function Testimonial({
	quote,
	name,
	attribution,
}: {
	quote: string;
	name: string;
	attribution: string;
}) {
	return (
		<blockquote>
			<div className="text-sm tracking-[.18em] text-[#f4701e]">★★★★★</div>
			<p className="mt-3 font-serif text-sm italic leading-6 text-[#fff5df] sm:text-lg sm:leading-7">
				“{quote}”
			</p>
			<footer className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#f6c6a1]">
				{name}
				<span className="mt-1 block text-[9px] text-[#fff5df]">
					{attribution}
				</span>
			</footer>
		</blockquote>
	);
}
