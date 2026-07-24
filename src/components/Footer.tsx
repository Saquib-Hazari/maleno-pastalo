import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

export default function Footer() {
	const footerRef = useRef<HTMLElement>(null);
	const logoRef = useRef<HTMLDivElement>(null);
	const wordmarkRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		gsap.registerPlugin(ScrollTrigger);
		const context = gsap.context(() => {
			gsap.fromTo(
				logoRef.current,
				{ autoAlpha: 0, y: 22, rotate: -3 },
				{
					autoAlpha: 1,
					y: 0,
					rotate: 0,
					duration: 0.7,
					ease: "power3.out",
					scrollTrigger: {
						trigger: footerRef.current,
						start: "top 88%",
						once: true,
					},
				},
			);
			gsap.fromTo(
				wordmarkRef.current,
				{ autoAlpha: 0, y: 28, letterSpacing: "0.18em" },
				{
					autoAlpha: 1,
					y: 0,
					letterSpacing: "0.04em",
					duration: 1.05,
					delay: 0.12,
					ease: "power3.out",
					scrollTrigger: {
						trigger: footerRef.current,
						start: "top 88%",
						once: true,
					},
				},
			);
		}, footerRef);
		return () => context.revert();
	}, []);

	return (
		<footer
			ref={footerRef}
			className="overflow-hidden bg-[#64391f] px-5 pb-7 pt-12 text-[#fff5df]"
		>
			<div className="mx-auto grid max-w-[1120px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<div
						ref={logoRef}
						className="inline-flex rounded-xl bg-[#fff8e9] px-2 py-1 shadow-sm"
					>
						<img
							src="/images/brand/molino-wordmark-horizontal.png"
							alt="Molino Pastello"
							className="h-14 w-44 object-contain object-center"
						/>
					</div>
					<p className="mt-3 max-w-xs text-xs leading-5 text-[#fff5df]/65">
						Crafting the world&apos;s finest flour and pasta with the patience,
						care, and warmth of an Italian kitchen.
					</p>
				</div>
				<FooterGroup
					title="Shop"
					items={[
						["Home", "/"],
						["Our Collection", "/shop"],
						["My account", "/dashboard"],
						["Sign in", "/auth"],
						["Gift Cards", "/#newsletter"],
						["Bulk Orders", "/#newsletter"],
					]}
				/>
				<FooterGroup
					title="Experience"
					items={[
						["About Molino", "/about"],
						["The Story", "/about"],
						["Recipes Journal", "/recipes"],
						["Chef’s Corner", "/#reviews"],
					]}
				/>
				<FooterGroup
					title="Contact"
					items={[
						["Via della Mola, 16", "/#story"],
						["hello@molinopastello.com", "mailto:hello@molinopastello.com"],
						["+39 075 123 4567", "tel:+390751234567"],
					]}
				/>
			</div>
			<p
				ref={wordmarkRef}
				aria-hidden="true"
				className="mt-12 w-full select-none whitespace-nowrap text-center font-serif text-[14vw] font-bold leading-[.64] text-[#fff5df]/[.075] sm:text-[9rem] lg:text-[13rem]"
			>
				PASTELLO
			</p>
			<div className="mx-auto mt-10 flex max-w-[1120px] flex-col gap-3 border-t border-white/15 pt-5 text-[9px] font-bold uppercase tracking-wider text-[#fff5df] sm:flex-row sm:justify-between">
				<span>© 2026 Molino Pastello. All rights reserved.</span>
				<span className="flex flex-wrap gap-x-2 gap-y-1">
					<a
						className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc79f]"
						href="/legal#privacy"
					>
						Privacy Policy
					</a>
					<span aria-hidden="true">·</span>
					<a
						className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc79f]"
						href="/legal#terms"
					>
						Terms of Service
					</a>
					<span aria-hidden="true">·</span>
					<a
						className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc79f]"
						href="/legal#accessibility"
					>
						Accessibility
					</a>
				</span>
			</div>
		</footer>
	);
}
function FooterGroup({
	title,
	items,
}: {
	title: string;
	items: [string, string][];
}) {
	return (
		<div>
			<h2 className="text-[10px] font-bold uppercase tracking-wider text-[#ffc79f]">
				{title}
			</h2>
			<ul className="mt-4 space-y-2 text-xs text-[#fff5df]/70">
				{items.map(([label, href]) => (
					<li key={label}>
						<a
							className="inline-flex origin-left transition duration-200 hover:translate-x-1 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc79f]"
							href={href}
						>
							{label}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
