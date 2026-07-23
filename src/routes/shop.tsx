import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { getStorefrontProducts } from "../features/catalog/catalog.functions";

const categories = [
	["all", "All pasta"],
	["long", "Long pasta"],
	["short", "Short pasta"],
	["specialty", "Specialty shapes"],
] as const;

export const Route = createFileRoute("/shop")({
	loader: () => getStorefrontProducts(),
	component: ShopPage,
	head: () => ({
		meta: [
			{ title: "Our Pasta Collection — Molino Pastello" },
			{
				name: "description",
				content:
					"Explore the Molino Pastello collection of slow-dried artisan Italian pasta.",
			},
		],
	}),
});

function ShopPage() {
	const storefrontProducts = Route.useLoaderData();
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("all");
	const [sort, setSort] = useState("featured");
	const [added, setAdded] = useState<number | null>(null);
	const [buying, setBuying] = useState<number | null>(null);
	const products = useMemo(() => {
		const filtered = storefrontProducts.filter(
			(product) =>
				(category === "all" || product.category === category) &&
				product.name.toLowerCase().includes(query.toLowerCase()),
		);
		return [...filtered].sort((first, second) => {
			if (sort === "price-low") return first.price - second.price;
			if (sort === "price-high") return second.price - first.price;
			if (sort === "name") return first.name.localeCompare(second.name);
			return 0;
		});
	}, [storefrontProducts, query, category, sort]);
	const clearFilters = () => {
		setQuery("");
		setCategory("all");
		setSort("featured");
	};
	return (
		<main className="bg-[#fff8e9] pb-20">
			<section className="bg-[#f3e8cc] px-5 py-14 text-center sm:py-20">
				<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#94360c]">
					Molino Pastello
				</p>
				<h1 className="mt-3 font-serif text-5xl font-bold text-[#64391f] sm:text-6xl">
					Our Pasta Collection
				</h1>
				<p className="mt-3 text-sm text-[#70452d]">
					Premium, slow-dried artisan pasta from the heart of Italy.
				</p>
				<form
					className="mx-auto mt-7 flex max-w-xl rounded-full bg-white p-1 shadow-sm"
					onSubmit={(event) => event.preventDefault()}
				>
					<Search className="m-3 text-[#70452d]" size={18} />
					<input
						name="collection-search"
						autoComplete="off"
						aria-label="Search the pasta collection"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search for shapes, ingredients, or collections..."
						className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#64391f] outline-none placeholder:text-[#96745c]"
					/>
				</form>
			</section>
			<section className="mx-auto grid max-w-[1200px] gap-8 px-5 py-12 lg:grid-cols-[245px_1fr]">
				<aside className="h-fit rounded-3xl border border-[#e5d4b6] bg-white/70 p-4 shadow-[0_10px_28px_rgba(100,57,31,.05)] sm:p-5 lg:sticky lg:top-20">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a84716]">
								Refine your pantry
							</p>
							<h2 className="mt-1 font-serif text-2xl font-bold">
								Filter pasta
							</h2>
						</div>
						<span className="grid size-9 place-items-center rounded-full bg-[#f3e8cc] text-[#a84716]">
							<SlidersHorizontal size={17} />
						</span>
					</div>
					<div className="mt-6 border-t border-[#eadfc9] pt-5">
						<p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#70452d]">
							Category
						</p>
						<fieldset className="mt-3 grid gap-1.5">
							<legend className="sr-only">Pasta categories</legend>
							{categories.map(([value, label]) => {
								const count =
									value === "all"
										? storefrontProducts.length
										: storefrontProducts.filter(
												(product) => product.category === value,
											).length;
								return (
									<button
										key={value}
										type="button"
										onClick={() => setCategory(value)}
										aria-pressed={category === value}
										className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${category === value ? "!bg-[#f66a16] !text-white shadow-sm" : "text-[#70452d] hover:bg-[#f3e8cc]"}`}
									>
										<span className="flex min-w-0 items-center gap-2">
											<span
												className="grid size-4 shrink-0 place-items-center"
												aria-hidden="true"
											>
												{category === value && (
													<Check size={14} strokeWidth={3} />
												)}
											</span>
											<span className="truncate">{label}</span>
										</span>
										<span
											className={`min-w-5 text-right text-xs tabular-nums ${category === value ? "text-white/80" : "text-[#96745c]"}`}
										>
											{count}
										</span>
									</button>
								);
							})}
						</fieldset>
					</div>
					<button
						type="button"
						onClick={clearFilters}
						className="mt-5 text-xs font-bold text-[#a84716] underline-offset-4 hover:underline"
					>
						Clear all filters
					</button>
				</aside>
				<div>
					<div className="mb-6 grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#e7d7bb] pb-5">
						<p
							className="text-xs font-bold uppercase tracking-wider text-[#70452d]"
							aria-live="polite"
						>
							{products.length}{" "}
							{products.length === 1 ? "variety" : "varieties"}
						</p>
						<label className="flex items-center justify-end gap-2 text-xs font-bold text-[#70452d]">
							<span className="hidden sm:inline">Sort by</span>
							<span className="relative">
								<select
									value={sort}
									onChange={(event) => setSort(event.target.value)}
									className="h-10 min-w-36 appearance-none rounded-full border border-[#ddc8a5] bg-white py-2 pl-4 pr-9 text-left text-xs font-bold text-[#64391f] outline-none transition hover:border-[#f66a16] focus:border-[#f66a16]"
								>
									<option value="featured">Featured</option>
									<option value="price-low">Price: low to high</option>
									<option value="price-high">Price: high to low</option>
									<option value="name">Name: A–Z</option>
								</select>
								<ChevronDown
									className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a84716]"
									size={15}
								/>
							</span>
						</label>
					</div>
					<div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
						{products.map((product) => (
							<article
								key={product.id}
								className="group transition duration-300 hover:-translate-y-1"
							>
								<div className="relative overflow-hidden rounded-2xl bg-[#f3e8cc] p-4 shadow-[0_8px_20px_rgba(100,57,31,.06)]">
									{product.isSoldOut && (
										<span className="absolute left-3 top-3 z-10 rounded-full bg-[#64391f] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
											Sold out
										</span>
									)}
									<img
										src={product.image}
										alt={`${product.name} pasta package`}
										className="aspect-[4/5] w-full object-contain transition duration-500 group-hover:scale-[1.04]"
									/>
								</div>
								<div className="mt-3 flex gap-3">
									<div>
										<a
											href="/product"
											className="font-serif text-lg font-bold text-[#64391f] no-underline hover:text-[#f66a16]"
										>
											{product.name}
										</a>
										<p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#70452d]">
											{product.detail}
										</p>
									</div>
									<strong className="ml-auto text-[#94360c]">
										${product.price.toFixed(2)}
									</strong>
								</div>
								<div className="mt-4 flex gap-2">
									<button
										type="button"
										disabled={product.isSoldOut}
										onClick={() => {
											setAdded(product.id);
											window.dispatchEvent(
												new CustomEvent("pastalo:cart", { detail: 1 }),
											);
										}}
										className="flex-1 rounded-full bg-[#64391f] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white transition disabled:cursor-not-allowed disabled:bg-[#bda98d]"
									>
										{product.isSoldOut
											? "Sold out"
											: added === product.id
												? "Added!"
												: "Add to cart"}
									</button>
									<button
										type="button"
										disabled={product.isSoldOut || buying === product.id}
										onClick={() => {
											setBuying(product.id);
											window.dispatchEvent(
												new CustomEvent("pastalo:cart", { detail: 1 }),
											);
											window.setTimeout(
												() => window.location.assign("/cart"),
												420,
											);
										}}
										className={`min-w-28 rounded-full border px-4 py-3 text-[10px] font-bold uppercase tracking-wider ring-1 ring-offset-2 transition-all duration-200 ${buying === product.id ? "border-[#56611c] bg-[#edf1d7] text-[#56611c] ring-[#56611c]/45" : "border-[#70452d] bg-white text-[#64391f] ring-[#70452d]/45 hover:-translate-y-0.5 hover:border-[#f66a16] hover:bg-[#fff0d7] hover:text-[#a84716] hover:ring-[#f66a16]/45"}`}
									>
										{product.isSoldOut
											? "Sold out"
											: buying === product.id
												? "Added — one moment"
												: "Buy now"}
									</button>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
