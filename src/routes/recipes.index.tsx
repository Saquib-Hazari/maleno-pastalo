import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock3, UsersRound } from "lucide-react";
import { recipes } from "../lib/recipes";

export const Route = createFileRoute("/recipes/")({ component: RecipesIndex });

function RecipesIndex() {
	return (
		<main className="bg-[#fff8e9] px-5 pb-20 pt-14 text-[#64391f] sm:pt-20">
			<section className="mx-auto max-w-[1120px]">
				<p className="text-center text-[10px] font-bold uppercase tracking-[.24em] text-[#a84716]">
					Molino kitchen journal
				</p>
				<h1 className="mx-auto mt-3 max-w-3xl text-center font-serif text-5xl font-bold leading-[.95] sm:text-6xl">
					Four ways to make pasta feel like home.
				</h1>
				<p className="mx-auto mt-5 max-w-xl text-center text-sm leading-6 text-[#70452d]">
					Simple, generous recipes built around good pasta, vivid ingredients
					and the pleasure of cooking slowly.
				</p>
				<div className="mt-12 grid gap-6 sm:grid-cols-2">
					{recipes.map((recipe, index) => (
						<article
							key={recipe.slug}
							className={`group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_32px_rgba(100,57,31,.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(100,57,31,.16)] ${index === 0 ? "sm:col-span-2 sm:grid sm:grid-cols-2" : ""}`}
						>
							<img
								src={recipe.image}
								alt={recipe.title}
								className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${index === 0 ? "h-72 sm:h-full" : "h-64"}`}
							/>
							<div className="p-6 sm:p-7">
								<p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a84716]">
									{recipe.difficulty}
								</p>
								<h2 className="mt-3 font-serif text-3xl font-bold">
									{recipe.title}
								</h2>
								<p className="mt-3 text-sm leading-6 text-[#70452d]">
									{recipe.description}
								</p>
								<div className="mt-5 flex gap-4 text-xs font-bold text-[#70452d]">
									<span className="inline-flex items-center gap-1.5">
										<Clock3 size={14} />
										{recipe.time}
									</span>
									<span className="inline-flex items-center gap-1.5">
										<UsersRound size={14} />
										{recipe.serves}
									</span>
								</div>
								<a
									href={`/recipes/${recipe.slug}`}
									className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#a84716] no-underline"
								>
									Cook this recipe <ArrowRight size={16} />
								</a>
							</div>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}
