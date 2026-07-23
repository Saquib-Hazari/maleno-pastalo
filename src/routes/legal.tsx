import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal")({
	component: LegalPage,
	head: () => ({
		meta: [
			{ title: "Legal information — Molino Pastello" },
			{
				name: "description",
				content: "Privacy, terms and accessibility information for Molino Pastello.",
			},
		],
	}),
});

function LegalPage() {
	return (
		<main className="min-h-screen bg-[#fff8e9] px-5 py-16 text-[#64391f] sm:py-20">
			<div className="mx-auto max-w-[760px]">
				<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a84716]">Molino Pastello</p>
				<h1 className="mt-3 font-serif text-5xl font-bold leading-[.96] sm:text-6xl">The details, clearly stated.</h1>
				<p className="mt-5 max-w-2xl text-sm leading-6 text-[#70452d]">This is a simple product demonstration, so no customer information is collected or stored by these static pages.</p>
				<div className="mt-12 space-y-10">
					<section id="privacy" className="scroll-mt-24 border-t border-[#e3d3b8] pt-8"><h2 className="font-serif text-3xl font-bold">Privacy policy</h2><p className="mt-3 text-sm leading-6 text-[#70452d]">We respect your privacy. Newsletter and account screens are interface demonstrations until a production data policy and database are connected.</p></section>
					<section id="terms" className="scroll-mt-24 border-t border-[#e3d3b8] pt-8"><h2 className="font-serif text-3xl font-bold">Terms of service</h2><p className="mt-3 text-sm leading-6 text-[#70452d]">Product prices, availability and delivery information shown here are illustrative while the storefront is in its static build phase.</p></section>
					<section id="accessibility" className="scroll-mt-24 border-t border-[#e3d3b8] pt-8"><h2 className="font-serif text-3xl font-bold">Accessibility</h2><p className="mt-3 text-sm leading-6 text-[#70452d]">We aim to provide semantic headings, labelled controls, keyboard access, visible focus states and layouts that work from phone to desktop. Please contact us if you encounter a barrier.</p></section>
				</div>
				<a href="/" className="mt-12 inline-flex rounded-full border border-[#64391f] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#64391f] no-underline transition hover:bg-[#64391f] hover:text-[#fff8e9]">Back to home</a>
			</div>
		</main>
	);
}
