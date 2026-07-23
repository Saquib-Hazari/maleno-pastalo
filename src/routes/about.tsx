import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Leaf, PackageCheck, Wheat } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

export const Route = createFileRoute("/about")({
	component: About,
	head: () => ({
		meta: [
			{ title: "Our Italian way — Molino Pastello" },
			{
				name: "description",
				content:
					"Discover the Molino Pastello way: thoughtfully sourced Italian wheat, bronze-die pasta and considered packaging.",
			},
			{ property: "og:title", content: "Our Italian way — Molino Pastello" },
			{
				property: "og:description",
				content:
					"From exceptional wheat to the final packet, every Molino Pastello detail is made with care.",
			},
		],
	}),
});

const principles = [
	{
		title: "Bronze die extrusion",
		text: "Traditional bronze dies give every shape its gentle roughness, so a simple sauce has somewhere beautiful to cling.",
		image: "/images/products/molino-fusilli-package-v2.webp",
	},
	{
		title: "48-hour slow drying",
		text: "We dry at low temperatures and give the dough time to develop the texture that makes an everyday dinner memorable.",
		image: "/images/home/heritage-mill.png",
	},
	{
		title: "100% Italian durum",
		text: "Carefully selected durum wheat creates our warm golden colour, clean flavour and satisfying al dente bite.",
		image: "/images/products/molino-spaghetti-package-v2.webp",
	},
];

const faqs = [
	[
		"How long does slow drying take?",
		"Each shape is dried slowly at a low temperature for up to 48 hours, protecting its flavour and resilient bite.",
	],
	[
		"Is Molino Pastello packaging recyclable?",
		"Our packs are designed to use less material and to protect the pasta well. Local recycling guidance should always be followed.",
	],
	[
		"Where is your pasta made?",
		"Our pasta is inspired by the Italian craft of patient milling, bronze-die extrusion and slow drying.",
	],
] as const;

function About() {
	const [openFaq, setOpenFaq] = useState(0);
	return (
		<main className="overflow-hidden bg-[#fff8e9] text-[#64391f]">
			<section className="pastalo-hero px-5 py-12 text-white sm:py-16 lg:py-20">
				<div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
					<div className="max-w-xl">
						<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#fff0cf]">
							The Molino Pastello way
						</p>
						<h1 className="mt-4 font-serif text-5xl font-bold leading-[.94] sm:text-6xl lg:text-7xl">
							Made the Italian way, every day.
						</h1>
						<p className="mt-6 max-w-md text-sm leading-6 text-white/90 sm:text-base">
							Thoughtfully sourced wheat, patient craftsmanship and a packet made
							to look as good in your pantry as the pasta tastes on your plate.
						</p>
						<a
							href="#our-packet"
							className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#64391f] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-white no-underline shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4f2d19]"
						>
							Meet the packet <ArrowRight size={14} />
						</a>
					</div>
					<div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-[2rem] bg-[#f3e8cc] p-3 shadow-[0_24px_60px_rgba(102,47,14,.28)]">
						<img
							src="/images/products/molino-penne-package-v2.webp"
							alt="Molino Pastello Penne package with the original Molino mark"
							className="mx-auto h-[410px] w-full rounded-[1.45rem] object-contain sm:h-[500px]"
						/>
					</div>
				</div>
			</section>

			<section className="px-5 py-16 sm:py-20">
				<div className="mx-auto max-w-[1120px]">
					<div className="mx-auto max-w-xl text-center">
						<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#94360c]">
							The science of soul
						</p>
						<h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
							An obsession with quality
						</h2>
					</div>
					<div className="mt-10 grid gap-6 sm:grid-cols-3">
						{principles.map((principle) => (
							<article
								key={principle.title}
								className="group rounded-3xl bg-white p-3 shadow-[0_12px_32px_rgba(100,57,31,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(100,57,31,.14)]"
							>
								<div className="overflow-hidden rounded-2xl bg-[#f3e8cc]">
									<img
										src={principle.image}
										alt=""
									className="h-48 w-full object-contain transition duration-500 group-hover:scale-[1.04]"
									/>
								</div>
								<div className="px-2 pb-3 pt-5">
									<h3 className="font-serif text-xl font-bold">{principle.title}</h3>
									<p className="mt-2 text-sm leading-6 text-[#70452d]">{principle.text}</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="bg-[#f3e8cc] px-5 py-16 sm:py-20">
				<div className="mx-auto max-w-[1120px]">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
						<div className="max-w-xl">
							<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#94360c]">The geometry of taste</p>
							<h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">A shape for every sauce.</h2>
						</div>
						<a href="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#7d3512] no-underline transition hover:text-[#f05f12]">Explore every shape <ArrowRight size={14} /></a>
					</div>
					<div className="mt-9 grid gap-4 grid-cols-2 lg:grid-cols-4">
						<PackageCard image="/images/products/molino-spaghetti-package-v2.webp" title="Long & silky" text="Spaghetti No. 5" />
						<PackageCard image="/images/products/molino-penne-package-v2.webp" title="Ridged & ready" text="Penne Rigate" />
						<PackageCard image="/images/products/molino-fusilli-package-v2.webp" title="Twisted & textured" text="Fusilli" />
						<PackageCard image="/images/products/molino-farfalle-package-v2.webp" title="Delicate & playful" text="Farfalle" />
					</div>
				</div>
			</section>

			<section id="our-packet" className="bg-[#55603f] px-5 py-16 text-[#fff8e9] sm:py-20">
				<div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ffe3b8]">
							Designed for the journey home
						</p>
						<h2 className="mt-4 max-w-md font-serif text-4xl font-bold leading-tight sm:text-5xl">
							Grown in harmony, packed with purpose.
						</h2>
						<p className="mt-5 max-w-md text-sm leading-6 text-[#fff8e9]/85">
							The original Molino package is built around one essential idea: keep
							the pasta protected, make every detail easy to understand, and let the
							craft show through.
						</p>
						<div className="mt-7 grid gap-4 sm:grid-cols-2">
							<Feature icon={<Wheat size={18} />} title="Italian wheat" text="Durum selected for texture and colour." />
							<Feature icon={<PackageCheck size={18} />} title="450g pack" text="A pantry-ready size with clear cooking cues." />
							<Feature icon={<Leaf size={18} />} title="Considered design" text="Made to protect pasta from mill to meal." />
						</div>
					</div>
					<figure className="rounded-[2rem] bg-[#edf1d7] p-3 shadow-[0_22px_48px_rgba(31,39,17,.25)]">
						<img
							src="/images/products/molino-spaghetti-package-v2.webp"
							alt="Molino Pastello spaghetti package"
							className="aspect-[1.6] w-full rounded-[1.4rem] object-contain object-center"
						/>
						<figcaption className="px-3 pb-2 pt-4 text-xs font-bold uppercase tracking-[.14em] text-[#55603f]">
							The Molino package system · clear, considered and pantry-ready
						</figcaption>
					</figure>
				</div>
			</section>

			<section className="bg-[#fff8e9] px-5 py-16 sm:py-20">
				<div className="mx-auto grid max-w-[1120px] items-center gap-9 lg:grid-cols-[1.05fr_.95fr]">
					<figure className="overflow-hidden rounded-[2rem] bg-[#f66a16] shadow-[0_20px_46px_rgba(100,57,31,.18)]">
						<img src="/images/about/molino-hospitality-banner-v2.webp" alt="Molino Pastello Penne package at a warm Italian restaurant table" className="aspect-[1.45] w-full object-cover transition duration-500 hover:scale-[1.025]" />
					</figure>
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#94360c]">Made for good tables</p>
						<h2 className="mt-3 max-w-md font-serif text-4xl font-bold leading-tight sm:text-5xl">A welcome sign for every kitchen.</h2>
						<p className="mt-5 max-w-md text-sm leading-6 text-[#70452d]">From a lively hotel breakfast to the little kitchen at home, our warm package system keeps the same promise: pasta with proper texture, clear cooking cues and a little Italian joy.</p>
						<a href="/recipes" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#64391f] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#64391f] no-underline transition hover:-translate-y-0.5 hover:bg-[#64391f] hover:text-white">Find your next recipe <ArrowRight size={14} /></a>
					</div>
				</div>
			</section>

			<section className="bg-[#64391f] px-5 py-16 text-[#fff8e9] sm:py-20">
				<div className="mx-auto max-w-[1120px]">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ffd8a3]">From our kitchen</p><h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Cook something wonderful.</h2></div>
						<a href="/recipes" className="text-[10px] font-bold uppercase tracking-[.14em] text-[#fff8e9] no-underline underline-offset-4 hover:underline">All recipes</a>
					</div>
					<div className="mt-9 grid gap-5 md:grid-cols-3">
						<RecipeCard image="/images/home/recipe-limone-new.png" title="Silky lemon spaghetti" detail="20-minute dinner" href="/recipes/spaghetti-al-limone" />
						<RecipeCard image="/images/home/recipe-pomodoro-new.png" title="Classic pomodoro" detail="The Sunday essential" href="/recipes/classic-pomodoro" />
						<RecipeCard image="/images/home/recipe-ragu-new.png" title="Slow Sunday ragù" detail="Made for sharing" href="/recipes/slow-sunday-ragu" />
					</div>
				</div>
			</section>

			<section className="px-5 py-16 sm:py-20">
				<div className="mx-auto w-full max-w-[680px]">
					<div className="text-center">
						<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#94360c]">Common questions</p>
						<h2 className="mt-3 font-serif text-4xl font-bold">Everything worth knowing</h2>
						<p className="mt-3 text-sm leading-6 text-[#70452d]">Straight answers from our kitchen to yours.</p>
					</div>
					<div className="mt-9 w-full space-y-3 text-left">
						{faqs.map(([question, answer], index) => {
							const id = `about-faq-${index}`;
							const isOpen = openFaq === index;
							return (
								<div key={question} className="rounded-2xl border border-[#eadfc9] bg-white px-5 shadow-[0_8px_22px_rgba(100,57,31,.06)]">
									<button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} aria-expanded={isOpen} aria-controls={id} className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold text-[#64391f]">
										{question}<ChevronDown className={`shrink-0 text-[#f66a16] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} size={18} />
									</button>
									<div id={id} aria-hidden={!isOpen} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
										<p className={`min-h-0 overflow-hidden text-sm leading-6 text-[#70452d] transition-[padding] duration-300 ${isOpen ? "pb-4" : "pb-0"}`}>{answer}</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<section className="bg-[#f3e8cc] px-5 py-14 text-center">
				<img src="/images/brand/molino-badge-original.png" alt="Molino Pastello" className="mx-auto size-20 object-contain" />
				<h2 className="mx-auto mt-4 max-w-xl font-serif text-4xl font-bold">A better plate starts with a better packet.</h2>
				<a href="/shop" className="mt-6 inline-flex rounded-full bg-[#64391f] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-white no-underline transition hover:-translate-y-0.5 hover:bg-[#4f2d19]">Shop the collection</a>
			</section>
		</main>
	);
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
	return <div className="flex gap-3 rounded-2xl bg-white/10 p-3"><span className="mt-0.5 text-[#ffe3b8]">{icon}</span><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-white">{text}</p></div></div>;
}

function PackageCard({ image, title, text }: { image: string; title: string; text: string }) {
	return <article className="group overflow-hidden rounded-2xl bg-white p-3 shadow-[0_10px_25px_rgba(100,57,31,.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(100,57,31,.16)]"><div className="overflow-hidden rounded-xl bg-[#f66a16]"><img src={image} alt={`${text} Molino Pastello package`} className="aspect-square w-full object-contain transition duration-500 group-hover:scale-[1.04]" /></div><div className="px-1 pb-1 pt-4"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#a84716]">{title}</p><h3 className="mt-1 font-serif text-lg font-bold">{text}</h3></div></article>;
}

function RecipeCard({ image, title, detail, href }: { image: string; title: string; detail: string; href: string }) {
	return <a href={href} className="group overflow-hidden rounded-2xl bg-[#fff8e9] text-[#64391f] no-underline transition duration-300 hover:-translate-y-1"><img src={image} alt="" className="aspect-[1.25] w-full object-cover transition duration-500 group-hover:scale-[1.04]" /><span className="block p-5"><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#a84716]">{detail}</span><span className="mt-2 block font-serif text-2xl font-bold leading-tight">{title}</span><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#94360c]">Open recipe <ArrowRight size={13} /></span></span></a>;
}
