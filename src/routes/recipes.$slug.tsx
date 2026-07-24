import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChefHat, Clock3, UsersRound } from "lucide-react";
import { recipes } from "../lib/recipes";

export const Route = createFileRoute("/recipes/$slug")({
	head: ({ params }) => {
		const recipe = recipes.find((item) => item.slug === params.slug);
		return {
			meta: [
				{ title: `${recipe?.title ?? "Recipe"} — Molino Pastello` },
				{
					name: "description",
					content:
						recipe?.description ?? "A Molino Pastello Italian pasta recipe.",
				},
			],
		};
	},
	loader: ({ params }) => {
		const recipe = recipes.find((item) => item.slug === params.slug);
		if (!recipe) throw notFound();
		return recipe;
	},
	component: RecipePage,
});

function RecipePage() {
	const recipe = Route.useLoaderData() as (typeof recipes)[number];
	return (
		<main className="bg-[#fff8e9] pb-20 text-[#64391f]">
			<section className="mx-auto max-w-[1200px] px-5 pt-8 sm:pt-12">
				<a
					href="/recipes"
					className="inline-flex items-center gap-2 text-sm font-bold text-[#a84716] no-underline"
				>
					<ArrowLeft size={16} /> All recipes
				</a>
				<div className="mt-7 grid overflow-hidden rounded-[2rem] bg-[#64391f] text-white lg:grid-cols-2">
					<div className="p-7 sm:p-12">
						<p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#f9cb8b]">
							Molino kitchen journal
						</p>
						<h1 className="mt-5 font-serif text-5xl font-bold leading-[.95] sm:text-6xl">
							{recipe.title}
						</h1>
						<p className="mt-5 max-w-md text-sm leading-6 text-[#ffe8c6]">
							{recipe.description}
						</p>
						<div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-[#fff0d1]">
							<span className="inline-flex items-center gap-2">
								<Clock3 size={15} /> {recipe.time}
							</span>
							<span className="inline-flex items-center gap-2">
								<UsersRound size={15} /> {recipe.serves}
							</span>
							<span className="inline-flex items-center gap-2">
								<ChefHat size={15} /> {recipe.difficulty}
							</span>
						</div>
					</div>
					<img
						src={recipe.image}
						alt={recipe.title}
						className="h-72 w-full object-cover lg:h-full"
					/>
				</div>
				<div className="mt-10 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
					<aside className="h-fit rounded-[1.75rem] bg-white p-7 shadow-[0_12px_32px_rgba(100,57,31,.08)]">
						<p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a84716]">
							You’ll need
						</p>
						<h2 className="mt-2 font-serif text-3xl font-bold">Ingredients</h2>
						<ul className="mt-6 space-y-3 text-sm leading-6 text-[#70452d]">
							{recipe.ingredients.map((item) => (
								<li key={item} className="flex gap-3">
									<span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#f66a16]" />
									{item}
								</li>
							))}
						</ul>
					</aside>
					<section className="rounded-[1.75rem] border border-[#e0cfae] bg-white/60 p-7 sm:p-9">
						<p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a84716]">
							Method
						</p>
						<h2 className="mt-2 font-serif text-3xl font-bold">
							Cook with patience
						</h2>
						<ol className="mt-7 space-y-6">
							{recipe.steps.map((step, index) => (
								<li key={step} className="flex gap-4">
									<span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f66a16] text-xs font-bold text-white">
										{index + 1}
									</span>
									<p className="pt-1 text-sm leading-6 text-[#70452d]">
										{step}
									</p>
								</li>
							))}
						</ol>
					</section>
				</div>
			</section>
		</main>
	);
}
