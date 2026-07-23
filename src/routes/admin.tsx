import { useClerk, useUser } from "@clerk/tanstack-react-start";
import * as Select from "@radix-ui/react-select";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	BarChart3,
	Bell,
	Box,
	CalendarDays,
	CheckCircle2,
	ChevronDown,
	ClipboardList,
	LayoutDashboard,
	LogOut,
	PackageCheck,
	Settings,
	ShoppingBag,
	UserRound,
	Users,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	deleteCatalogProduct,
	getAdminCatalog,
	saveCatalogProduct,
} from "../features/catalog/catalog.functions";
import type {
	AdminCatalogProduct,
	CatalogProductInput,
} from "../features/catalog/catalog.types";
import {
	getMyProfile,
	saveMyProfile,
	saveVerifiedPhone,
} from "../features/profile/profile.functions";
import type { ProfileRecord } from "../features/profile/profile.types";
import { getSessionAccess } from "../lib/auth";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const access = await getSessionAccess();
		if (!access.userId) throw redirect({ to: "/auth" });
		if (access.role !== "admin") throw redirect({ to: "/dashboard" });
	},
	component: AdminPage,
	head: () => ({
		meta: [
			{ title: "Admin overview — Molino Pastello" },
			{ name: "robots", content: "noindex, nofollow" },
			{ name: "description", content: "Molino Pastello operations dashboard." },
		],
	}),
});

const nav = [
	[LayoutDashboard, "Overview"],
	[ShoppingBag, "Orders"],
	[Box, "Products"],
	[Users, "Customers"],
	[BarChart3, "Analytics"],
	[Settings, "Settings"],
] as const;
const orders = [
	["#MP-2841", "Luca Sarti", "3 items", "$42.00", "In transit"],
	["#MP-2840", "Mia Romano", "2 items", "$28.00", "Preparing"],
	["#MP-2839", "Elena Ricci", "4 items", "$56.00", "Delivered"],
];
const revenueData = [
	{ month: "May", revenue: 3200 },
	{ month: "Jun", revenue: 4100 },
	{ month: "Jul", revenue: 3650 },
	{ month: "Aug", revenue: 5200 },
	{ month: "Sep", revenue: 6100 },
	{ month: "Oct", revenue: 7820 },
];
const reportingPeriods = ["October 2026", "September 2026", "August 2026"];
function AdminPage() {
	const { user } = useUser();
	const clerk = useClerk();
	const [reportingPeriod, setReportingPeriod] = useState(reportingPeriods[0]);
	const [activeView, setActiveView] =
		useState<(typeof nav)[number][1]>("Overview");
	const [accountOpen, setAccountOpen] = useState(false);
	const displayName = user?.fullName || user?.firstName || "Administrator";
	return (
		<main className="min-h-screen bg-[#fff8e9] text-[#64391f] lg:grid lg:grid-cols-[250px_1fr]">
			<aside className="bg-[#64391f] px-5 py-5 text-[#fff8e9] lg:min-h-screen lg:px-7 lg:py-8">
				<div className="flex items-center justify-between lg:block">
					<a
						href="/"
						className="flex items-center gap-2 text-white no-underline"
					>
						<span className="grid size-10 place-items-center rounded-xl bg-[#fff8e9] p-1 shadow-sm">
							<img
								src="/images/brand/molino-package-seal.png"
								alt=""
								className="size-full object-contain"
							/>
						</span>
						<span className="font-serif text-xl font-bold">
							Molino Pastello
						</span>
					</a>
					<span className="rounded-full bg-[#f66a16] px-2 py-1 text-[9px] font-bold uppercase tracking-wider">
						{displayName.split(" ")[0]} · Admin
					</span>
				</div>
				<p className="mt-8 text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b98d]">
					Workspace
				</p>
				<nav
					aria-label="Admin navigation"
					className="mt-3 flex gap-2 overflow-auto lg:block lg:space-y-1"
				>
					{nav.map(([Icon, label]) => (
						<button
							type="button"
							key={label}
							onClick={() => setActiveView(label)}
							aria-current={activeView === label ? "page" : undefined}
							className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${activeView === label ? "bg-[#f66a16] font-bold text-white" : "text-[#f6d9b1] hover:bg-white/10"}`}
						>
							<Icon size={17} />
							{label}
						</button>
					))}
				</nav>
				<div className="mt-8 border-t border-white/15 pt-6 lg:mt-28">
					<p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b98d]">
						Need a hand?
					</p>
					<a
						href="#support"
						className="mt-3 flex items-center gap-3 text-sm text-[#f6d9b1] no-underline"
					>
						<ClipboardList size={17} />
						Operations guide
					</a>
				</div>
			</aside>
			<section className="p-5 sm:p-8 lg:p-12">
				<header className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
							Molino Pastello / Operations
						</p>
						<h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
							Executive Overview
						</h1>
						<p className="mt-2 text-sm text-[#70452d]">
							A clear picture of today’s business.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="relative hidden sm:block">
							<button
								type="button"
								onClick={() => setAccountOpen((open) => !open)}
								aria-expanded={accountOpen}
								className="flex items-center gap-2 rounded-full border border-[#decba8] bg-white py-1 pl-1 pr-3 text-xs font-bold text-[#64391f] transition hover:-translate-y-0.5 hover:border-[#f66a16] hover:shadow-sm"
							>
								{user?.imageUrl ? (
									<img
										src={user.imageUrl}
										alt=""
										className="h-8 w-8 rounded-full object-cover"
									/>
								) : (
									<span className="grid h-8 w-8 place-items-center rounded-full bg-[#f9b562] font-serif text-sm text-[#64391f]">
										{displayName.charAt(0).toUpperCase()}
									</span>
								)}
								{displayName.split(" ")[0]}
							</button>
							<div
								className={`absolute left-0 top-[calc(100%+10px)] z-20 w-52 origin-top-left rounded-2xl border border-[#decba8] bg-[#fffdf8] p-2 shadow-xl transition-all duration-200 ease-out ${accountOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}
							>
								<button
									type="button"
									onClick={() => {
										setActiveView("Settings");
										setAccountOpen(false);
									}}
									className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#64391f] hover:bg-[#f3e8cc]"
								>
									<UserRound size={16} /> Account settings
								</button>
								<button
									type="button"
									onClick={() => void clerk.signOut({ redirectUrl: "/" })}
									className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#a84716] hover:bg-[#fff0d7]"
								>
									<LogOut size={16} /> Sign out
								</button>
							</div>
						</div>
						<button
							type="button"
							aria-label="View notifications"
							className="grid h-10 w-10 place-items-center rounded-full border border-[#decba8] bg-white text-[#64391f]"
						>
							<Bell size={17} />
						</button>
						<Select.Root
							value={reportingPeriod}
							onValueChange={setReportingPeriod}
						>
							<Select.Trigger
								aria-label="Reporting period"
								className="flex items-center gap-2 rounded-full border border-[#decba8] bg-white px-4 py-2.5 text-xs font-bold text-[#64391f] outline-none transition hover:border-[#f66a16] focus-visible:ring-2 focus-visible:ring-[#f66a16]/40"
							>
								<CalendarDays size={15} />
								<Select.Value />
								<ChevronDown size={14} />
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
									position="popper"
									className="z-50 overflow-hidden rounded-2xl border border-[#decba8] bg-[#fffdf8] p-1 shadow-xl"
								>
									<Select.Viewport>
										{reportingPeriods.map((period) => (
											<Select.Item
												key={period}
												value={period}
												className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-[#64391f] outline-none data-[highlighted]:bg-[#f3e8cc]"
											>
												<Select.ItemText>{period}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Viewport>
								</Select.Content>
							</Select.Portal>
						</Select.Root>
					</div>
				</header>
				{activeView === "Overview" ? (
					<>
						<section
							aria-label="Key business figures"
							className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
						>
							<Metric
								label="Total revenue"
								value="$24,860"
								change="↑ 12.6% from last month"
							/>
							<Metric
								label="Gross profit"
								value="$14,112"
								change="↑ 8.2% from last month"
							/>
							<Metric
								label="Orders fulfilled"
								value="682"
								change="↑ 16.1% from last month"
							/>
							<Metric
								label="New customers"
								value="218"
								change="↑ 7.4% from last month"
							/>
						</section>
						<div className="mt-7 grid gap-7 xl:grid-cols-[1.3fr_.7fr]">
							<section className="rounded-[1.75rem] bg-white p-6 shadow-[0_10px_28px_rgba(100,57,31,.07)]">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
											Sales performance
										</p>
										<h2 className="mt-2 font-serif text-2xl font-bold">
											Revenue this month
										</h2>
									</div>
									<button
										type="button"
										className="text-xs font-bold text-[#a84716]"
									>
										Monthly <ChevronDown className="inline" size={14} />
									</button>
								</div>
								<div
									className="mt-8 h-56"
									role="img"
									aria-label="Revenue area chart rising from $3,200 to $7,820 across six months"
								>
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart
											data={revenueData}
											margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
										>
											<defs>
												<linearGradient
													id="revenue-fill"
													x1="0"
													x2="0"
													y1="0"
													y2="1"
												>
													<stop
														offset="0%"
														stopColor="#f66a16"
														stopOpacity={0.28}
													/>
													<stop
														offset="100%"
														stopColor="#f66a16"
														stopOpacity={0.02}
													/>
												</linearGradient>
											</defs>
											<CartesianGrid
												vertical={false}
												stroke="#eadfc9"
												strokeDasharray="4 6"
											/>
											<XAxis
												dataKey="month"
												axisLine={false}
												tickLine={false}
												tick={{
													fill: "#96745c",
													fontSize: 10,
													fontWeight: 700,
												}}
											/>
											<YAxis hide domain={[0, "dataMax + 1000"]} />
											<Tooltip
												formatter={(value) => [
													`$${Number(value).toLocaleString()}`,
													"Revenue",
												]}
												contentStyle={{
													borderRadius: 14,
													borderColor: "#eadfc9",
													color: "#64391f",
												}}
											/>
											<Area
												type="monotone"
												dataKey="revenue"
												stroke="#f66a16"
												strokeWidth={4}
												fill="url(#revenue-fill)"
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</section>
							<section className="rounded-[1.75rem] bg-[#6d7b2c] p-6 text-white">
								<PackageCheck size={22} />
								<p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-[#e9efbd]">
									Order logistics
								</p>
								<h2 className="mt-2 font-serif text-3xl font-bold">92.4%</h2>
								<p className="mt-2 text-sm text-[#f1f5cd]">
									Orders delivered on time this month.
								</p>
								<div className="mt-7 space-y-4">
									<div>
										<div className="mb-1 flex justify-between text-xs">
											<span>Preparing</span>
											<span>18</span>
										</div>
										<div className="h-2 rounded-full bg-black/15">
											<div className="h-full w-[35%] rounded-full bg-[#f9cb8b]" />
										</div>
									</div>
									<div>
										<div className="mb-1 flex justify-between text-xs">
											<span>In transit</span>
											<span>44</span>
										</div>
										<div className="h-2 rounded-full bg-black/15">
											<div className="h-full w-[70%] rounded-full bg-[#f9cb8b]" />
										</div>
									</div>
								</div>
								<a
									href="#orders"
									className="mt-7 inline-block rounded-full bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#56611c] no-underline"
								>
									Manage orders
								</a>
							</section>
						</div>
						<section className="mt-7 rounded-[1.75rem] bg-white p-6 shadow-[0_10px_28px_rgba(100,57,31,.07)]">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
										Order logistics
									</p>
									<h2 className="mt-2 font-serif text-2xl font-bold">
										Recent orders
									</h2>
								</div>
								<a
									href="#orders"
									className="rounded-full border border-[#d9c6a3] px-4 py-2 text-xs font-bold text-[#64391f] no-underline"
								>
									View all orders
								</a>
							</div>
							<div className="mt-5 overflow-x-auto">
								<table className="w-full min-w-[600px] text-left text-sm">
									<thead className="border-y border-[#eadfc9] text-[10px] uppercase tracking-wider text-[#96745c]">
										<tr>
											<th className="py-3 font-bold">Order</th>
											<th className="py-3 font-bold">Customer</th>
											<th className="py-3 font-bold">Contents</th>
											<th className="py-3 font-bold">Total</th>
											<th className="py-3 font-bold">Status</th>
										</tr>
									</thead>
									<tbody>
										{orders.map(([id, customer, contents, total, status]) => (
											<tr key={id} className="border-b border-[#f0e8d7]">
												<td className="py-4 font-bold">{id}</td>
												<td className="py-4">{customer}</td>
												<td className="py-4 text-[#70452d]">{contents}</td>
												<td className="py-4 font-bold">{total}</td>
												<td className="py-4">
													<span
														className={`rounded-full px-3 py-1 text-xs font-bold ${status === "Delivered" ? "bg-[#edf1d7] text-[#56611c]" : status === "Preparing" ? "bg-[#fff0d7] text-[#a84716]" : "bg-[#f4e6d1] text-[#70452d]"}`}
													>
														{status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					</>
				) : (
					<AdminWorkspace view={activeView} />
				)}
			</section>
		</main>
	);
}

function AdminWorkspace({
	view,
}: {
	view: Exclude<(typeof nav)[number][1], "Overview">;
}) {
	const copy = {
		Orders: ["Orders", "Review and update the latest fulfilment activity."],
		Products: ["Products", "Manage your artisan pasta collection."],
		Customers: ["Customers", "View customer profiles and purchase activity."],
		Analytics: ["Analytics", "Track performance across your storefront."],
		Settings: ["Account settings", "Update your administration preferences."],
	} as const;
	const [title, description] = copy[view];
	return (
		<section className="mt-9 rounded-[1.75rem] bg-white p-6 shadow-[0_10px_28px_rgba(100,57,31,.07)]">
			<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
				Operations workspace
			</p>
			<h2 className="mt-2 font-serif text-3xl font-bold">{title}</h2>
			<p className="mt-2 text-sm text-[#70452d]">{description}</p>
			{view === "Settings" ? (
				<AdminAccountSettings />
			) : view === "Orders" ? (
				<div className="mt-6 overflow-x-auto">
					<table className="w-full min-w-[600px] text-left text-sm">
						<thead className="border-y border-[#eadfc9] text-[10px] uppercase tracking-wider text-[#96745c]">
							<tr>
								<th className="py-3">Order</th>
								<th className="py-3">Customer</th>
								<th className="py-3">Items</th>
								<th className="py-3">Total</th>
								<th className="py-3">Status</th>
							</tr>
						</thead>
						<tbody>
							{orders.map(([id, customer, items, total, status]) => (
								<tr key={id} className="border-b border-[#f0e8d7]">
									<td className="py-4 font-bold">{id}</td>
									<td className="py-4">{customer}</td>
									<td className="py-4">{items}</td>
									<td className="py-4 font-bold">{total}</td>
									<td className="py-4">
										<button
											type="button"
											className="rounded-full bg-[#f3e8cc] px-3 py-1 text-xs font-bold text-[#64391f] transition hover:bg-[#f9b562]"
										>
											{status}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : view === "Products" ? (
				<CatalogManager />
			) : (
				<div className="mt-6 rounded-2xl border border-dashed border-[#decba8] bg-[#fff8e9] p-6 text-sm text-[#70452d]">
					This interactive workspace is ready for your live data connection. The
					dashboard navigation, settings and account actions now work in the
					interface.
				</div>
			)}
		</section>
	);
}

const emptyCatalogProduct: CatalogProductInput = {
	name: "",
	description: "",
	category: "specialty",
	price: 0,
	quantity: 0,
	imageUrl: "",
	status: "draft",
};

function CatalogManager() {
	const [items, setItems] = useState<AdminCatalogProduct[]>([]);
	const [draft, setDraft] = useState<CatalogProductInput>(emptyCatalogProduct);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		void getAdminCatalog()
			.then((catalog) => active && setItems(catalog))
			.catch(() => active && setError("We couldn't load the catalog."))
			.finally(() => active && setLoading(false));
		return () => {
			active = false;
		};
	}, []);
	const edit = (item: AdminCatalogProduct) => {
		setDraft({
			id: item.id,
			name: item.name,
			description: item.description,
			category: item.category,
			price: item.price,
			quantity: item.availableQuantity,
			imageUrl: item.image,
			status: item.status,
		});
		setMessage("");
		setError("");
	};
	const save = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaving(true);
		setError("");
		setMessage("");
		try {
			const catalog = await saveCatalogProduct({ data: draft });
			setItems(catalog);
			setMessage(
				draft.id
					? "Product and stock updated."
					: "Product added to the storefront.",
			);
			setDraft(emptyCatalogProduct);
		} catch (caught) {
			setError(
				caught instanceof Error
					? caught.message
					: "We couldn't save this product.",
			);
		} finally {
			setSaving(false);
		}
	};
	const remove = async (item: AdminCatalogProduct) => {
		if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`))
			return;
		setSaving(true);
		setError("");
		try {
			const catalog = await deleteCatalogProduct({ data: { id: item.id } });
			setItems(catalog);
			if (draft.id === item.id) setDraft(emptyCatalogProduct);
			setMessage("Product deleted from the catalog and shop.");
		} catch (caught) {
			setError(
				caught instanceof Error
					? caught.message
					: "We couldn't delete this product.",
			);
		} finally {
			setSaving(false);
		}
	};
	const update = <K extends keyof CatalogProductInput>(
		key: K,
		value: CatalogProductInput[K],
	) => setDraft((current) => ({ ...current, [key]: value }));
	return (
		<div className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
			<form
				onSubmit={save}
				className="rounded-2xl border border-[#eadfc9] bg-[#fff8e9] p-5"
			>
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
							Catalog editor
						</p>
						<h3 className="mt-1 font-serif text-2xl font-bold">
							{draft.id ? "Edit pasta" : "Add pasta"}
						</h3>
					</div>
					{draft.id && (
						<button
							type="button"
							onClick={() => setDraft(emptyCatalogProduct)}
							className="text-xs font-bold text-[#a84716] underline"
						>
							New product
						</button>
					)}
				</div>
				<div className="mt-5 grid gap-3">
					<CatalogInput
						label="Product name"
						value={draft.name}
						onChange={(value) => update("name", value)}
					/>
					<CatalogInput
						label="Description"
						value={draft.description}
						onChange={(value) => update("description", value)}
					/>
					<CatalogInput
						label="Image URL"
						value={draft.imageUrl}
						onChange={(value) => update("imageUrl", value)}
						placeholder="/images/products/package.webp"
					/>
					<div className="grid grid-cols-2 gap-3">
						<CatalogInput
							label="Price (USD)"
							value={String(draft.price)}
							inputMode="decimal"
							onChange={(value) => update("price", Number(value))}
						/>
						<CatalogInput
							label="Quantity"
							value={String(draft.quantity)}
							inputMode="numeric"
							onChange={(value) => update("quantity", Number(value))}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<label className="text-xs font-bold text-[#64391f]">
							Category
							<select
								value={draft.category}
								onChange={(event) => update("category", event.target.value)}
								className="mt-1.5 w-full rounded-xl border border-[#dfcfac] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#f66a16]"
							>
								<option value="long">Long pasta</option>
								<option value="short">Short pasta</option>
								<option value="specialty">Specialty / bundle</option>
							</select>
						</label>
						<label className="text-xs font-bold text-[#64391f]">
							Store status
							<select
								value={draft.status}
								onChange={(event) =>
									update(
										"status",
										event.target.value as CatalogProductInput["status"],
									)
								}
								className="mt-1.5 w-full rounded-xl border border-[#dfcfac] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#f66a16]"
							>
								<option value="draft">Draft</option>
								<option value="active">Active</option>
								<option value="archived">Archived</option>
							</select>
						</label>
					</div>
				</div>
				<button
					type="submit"
					disabled={saving}
					className="mt-5 rounded-full !bg-[#f66a16] px-5 py-3 text-xs font-bold uppercase tracking-wider !text-white shadow-[0_8px_18px_rgba(246,106,22,.22)] transition-all hover:-translate-y-0.5 hover:!bg-[#df5509] disabled:opacity-60"
				>
					{saving ? "Saving…" : draft.id ? "Save product" : "Add product"}
				</button>
				{message && (
					<output className="ml-3 text-sm font-bold text-[#56611c]">
						{message}
					</output>
				)}
				{error && (
					<p role="alert" className="mt-3 text-sm font-bold text-[#a84716]">
						{error}
					</p>
				)}
			</form>
			<div className="overflow-hidden rounded-2xl border border-[#eadfc9] bg-white">
				<div className="flex items-center justify-between border-b border-[#eadfc9] px-5 py-4">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
							Live inventory
						</p>
						<h3 className="mt-1 font-serif text-2xl font-bold">
							{loading ? "Loading…" : `${items.length} products`}
						</h3>
					</div>
					<a
						href="/shop"
						className="text-xs font-bold text-[#a84716] underline"
					>
						View shop
					</a>
				</div>
				<div className="max-h-[620px] divide-y divide-[#f0e8d7] overflow-y-auto">
					{items.map((item) => (
						<article
							key={item.variantId}
							className="flex items-center gap-3 p-4 transition hover:bg-[#fff8e9]"
						>
							<img
								src={item.image}
								alt=""
								className="size-12 rounded-xl bg-[#f3e8cc] object-contain"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-serif text-base font-bold">
									{item.name}
								</p>
								<p className="mt-0.5 text-xs text-[#70452d]">
									${item.price.toFixed(2)} · {item.sku}
								</p>
							</div>
							<div className="flex shrink-0 flex-col items-end gap-2">
								<span
									className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.isSoldOut ? "bg-[#64391f] text-white" : "bg-[#edf1d7] text-[#56611c]"}`}
								>
									{item.isSoldOut
										? "Sold out"
										: `${item.availableQuantity} in stock`}
								</span>
								<span className="flex gap-2">
									<button
										type="button"
										onClick={() => edit(item)}
										className="text-xs font-bold text-[#a84716] underline underline-offset-4"
									>
										Edit
									</button>
									<button
										type="button"
										onClick={() => void remove(item)}
										disabled={saving}
										className="text-xs font-bold text-[#9b2f20] underline underline-offset-4 disabled:opacity-50"
									>
										Delete
									</button>
								</span>
							</div>
						</article>
					))}
				</div>
			</div>
		</div>
	);
}

function CatalogInput({
	label,
	value,
	onChange,
	placeholder,
	inputMode,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	inputMode?: "numeric" | "decimal";
}) {
	return (
		<label className="text-xs font-bold text-[#64391f]">
			{label}
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				inputMode={inputMode}
				required
				className="mt-1.5 w-full rounded-xl border border-[#dfcfac] bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-[#f66a16] focus:ring-2 focus:ring-[#f66a16]/15"
			/>
		</label>
	);
}

function AdminAccountSettings() {
	const { user } = useUser();
	const [firstName, setFirstName] = useState(user?.firstName ?? "Saquibhazari");
	const [lastName, setLastName] = useState(user?.lastName ?? "");
	const [phone, setPhone] = useState(
		user?.primaryPhoneNumber?.phoneNumber ?? "",
	);
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [country, setCountry] = useState("India");
	const [phoneCode, setPhoneCode] = useState("");
	const [phoneId, setPhoneId] = useState<string | null>(null);
	const [phoneVerified, setPhoneVerified] = useState(false);
	const [changingPhone, setChangingPhone] = useState(false);
	const [savedProfile, setSavedProfile] = useState<ProfileRecord | null>(null);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		if (!user) return;
		void getMyProfile()
			.then((profile) => {
				if (!active) return;
				setSavedProfile(profile);
				setFirstName(profile.firstName || user.firstName || "");
				setLastName(profile.lastName || user.lastName || "");
				setPhone(
					profile.phoneNumber ?? user.primaryPhoneNumber?.phoneNumber ?? "",
				);
				setAddress(profile.addressLine1);
				setCity(profile.city);
				setState(profile.state);
				setZipCode(profile.postalCode);
				setCountry(profile.country || "India");
				setPhoneVerified(Boolean(profile.phoneVerifiedAt));
			})
			.catch(() => active && setError("We couldn't load your saved profile."));
		return () => {
			active = false;
		};
	}, [user]);

	const cancel = () => {
		setFirstName(savedProfile?.firstName ?? user?.firstName ?? "Saquibhazari");
		setLastName(savedProfile?.lastName ?? user?.lastName ?? "");
		setPhone(
			savedProfile?.phoneNumber ?? user?.primaryPhoneNumber?.phoneNumber ?? "",
		);
		setAddress(savedProfile?.addressLine1 ?? "");
		setCity(savedProfile?.city ?? "");
		setState(savedProfile?.state ?? "");
		setZipCode(savedProfile?.postalCode ?? "");
		setCountry(savedProfile?.country ?? "India");
		setPhoneCode("");
		setPhoneId(null);
		setChangingPhone(false);
		setError("");
		setMessage("");
	};
	const save = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setMessage("");
		setSaving(true);
		try {
			const profile = await saveMyProfile({
				data: {
					firstName,
					lastName,
					addressLine1: address,
					city,
					state,
					postalCode: zipCode,
					country,
				},
			});
			setSavedProfile(profile);
			setMessage("Information saved securely to your administrator profile.");
		} catch (caught) {
			setError(
				caught instanceof Error
					? caught.message
					: "We couldn't save your profile.",
			);
		} finally {
			setSaving(false);
		}
	};
	const sendPhoneCode = async () => {
		if (!user) return;
		const normalizedPhone = phone.replaceAll(" ", "");
		if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
			setError(
				"Enter a valid number with country code, for example +91 98765 43210.",
			);
			return;
		}
		setError("");
		setMessage("");
		setSaving(true);
		try {
			const existing = user.phoneNumbers.find(
				(number) => number.phoneNumber === normalizedPhone,
			);
			const number =
				existing ??
				(await user.createPhoneNumber({ phoneNumber: normalizedPhone }));
			await number.prepareVerification();
			setPhoneId(number.id);
			setMessage("A verification code was sent to your phone.");
		} catch {
			setError(
				"We couldn't send a verification code. Check the number and try again.",
			);
		} finally {
			setSaving(false);
		}
	};
	const verifyPhone = async () => {
		if (!user || !phoneId) return;
		if (!/^\d{6}$/.test(phoneCode)) {
			setError("Enter the 6-digit code sent to your phone.");
			return;
		}
		setError("");
		setMessage("");
		setSaving(true);
		try {
			const number = user.phoneNumbers.find((item) => item.id === phoneId);
			if (!number) throw new Error("Phone verification expired");
			const verified = await number.attemptVerification({ code: phoneCode });
			if (verified.verification.status !== "verified")
				throw new Error("Phone verification is incomplete");
			await user.update({ primaryPhoneNumberId: verified.id });
			const profile = await saveVerifiedPhone({
				data: { phoneId: verified.id },
			});
			await user.reload();
			setSavedProfile(profile);
			setPhone(profile.phoneNumber ?? verified.phoneNumber);
			setPhoneVerified(true);
			setChangingPhone(false);
			setPhoneCode("");
			setPhoneId(null);
			setMessage("Phone number verified and saved.");
		} catch {
			setError("That code didn't verify. Request a new one and try again.");
		} finally {
			setSaving(false);
		}
	};
	const field = (
		label: string,
		value: string,
		change: (value: string) => void,
		autoComplete: string,
	) => (
		<label className="block text-xs font-bold text-[#64391f]">
			{label}
			<input
				value={value}
				onChange={(event) => {
					change(event.target.value);
				}}
				autoComplete={autoComplete}
				className="mt-1.5 w-full rounded-xl border border-[#dfcfac] bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-[#f66a16] focus:ring-2 focus:ring-[#f66a16]/15"
			/>
		</label>
	);
	return (
		<form onSubmit={save} className="mt-6 border-t border-[#eadfc9] pt-6">
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eadfc9] bg-[#fff8e9] p-3">
				<p className="px-2 text-sm font-semibold text-[#70452d]">
					Review your details, then save your administrator profile.
				</p>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={cancel}
						className="rounded-full border border-[#d6bf9a] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#64391f] transition hover:border-[#f66a16]"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={saving}
						className="rounded-full border border-[#f66a16] !bg-[#f66a16] px-4 py-2.5 text-xs font-bold uppercase tracking-wider !text-white shadow-[0_8px_18px_rgba(246,106,22,.22)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:!bg-[#df5509] hover:shadow-[0_12px_24px_rgba(246,106,22,.3)] active:translate-y-0 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f66a16]/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60"
					>
						Save changes
					</button>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#f3e8cc] p-4">
				<div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#f9b562] font-serif text-xl font-bold text-[#64391f]">
					{user?.imageUrl ? (
						<img
							src={user.imageUrl}
							alt="Your Clerk profile"
							className="size-full object-cover"
						/>
					) : (
						firstName.charAt(0).toUpperCase()
					)}
				</div>
				<div>
					<p className="font-bold">Profile picture</p>
					<p className="mt-1 text-xs text-[#70452d]">
						Managed securely in your Clerk account.
					</p>
				</div>
			</div>
			<div className="mt-6 grid gap-4 sm:grid-cols-2">
				{field("First name", firstName, setFirstName, "given-name")}
				{field("Last name", lastName, setLastName, "family-name")}
				<label className="block text-xs font-bold text-[#64391f]">
					Email address
					<input
						value={user?.primaryEmailAddress?.emailAddress ?? ""}
						readOnly
						className="mt-1.5 w-full rounded-xl border border-[#dfcfac] bg-[#fff8e9] px-3 py-2.5 text-sm font-medium text-[#70452d] outline-none"
					/>
				</label>
				<div>
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold text-[#64391f]">
							Phone number
						</span>
						{phoneVerified && !changingPhone && (
							<button
								type="button"
								onClick={() => setChangingPhone(true)}
								className="text-xs font-bold text-[#a84716] underline underline-offset-4"
							>
								Change phone
							</button>
						)}
					</div>
					{!phoneVerified || changingPhone ? (
						<div className="mt-1.5 flex gap-2">
							<label className="sr-only" htmlFor="admin-phone">
								Phone number
							</label>
							<input
								id="admin-phone"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
								autoComplete="tel"
								className="min-w-0 flex-1 rounded-xl border border-[#dfcfac] bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-[#f66a16]"
							/>
							<button
								type="button"
								onClick={() => void sendPhoneCode()}
								disabled={saving}
								className="rounded-xl bg-[#64391f] px-3 text-xs font-bold text-white disabled:opacity-60"
							>
								Send code
							</button>
						</div>
					) : (
						<p className="mt-1.5 rounded-xl border border-[#dfcfac] bg-[#fff8e9] px-3 py-2.5 text-sm font-medium text-[#56611c]">
							{phone || "Verified"}
						</p>
					)}
					{phoneId && (
						<div className="mt-2 flex gap-2">
							<input
								value={phoneCode}
								onChange={(event) =>
									setPhoneCode(
										event.target.value.replace(/\D/g, "").slice(0, 6),
									)
								}
								inputMode="numeric"
								placeholder="6-digit code"
								className="min-w-0 flex-1 rounded-xl border border-[#dfcfac] px-3 py-2.5 text-sm outline-none focus:border-[#f66a16]"
							/>
							<button
								type="button"
								onClick={() => void verifyPhone()}
								disabled={saving}
								className="rounded-xl bg-[#f66a16] px-3 text-xs font-bold text-white disabled:opacity-60"
							>
								Verify
							</button>
						</div>
					)}
				</div>
			</div>
			<div className="mt-4">
				{field("Street address", address, setAddress, "street-address")}
			</div>
			<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{field("City", city, setCity, "address-level2")}
				{field("State", state, setState, "address-level1")}
				{field("ZIP / PIN code", zipCode, setZipCode, "postal-code")}
				{field("Country", country, setCountry, "country-name")}
			</div>
			<div className="mt-6 flex flex-wrap items-center gap-4">
				<button
					type="submit"
					disabled={saving}
					className="rounded-full border border-[#f66a16] !bg-[#f66a16] px-5 py-3 text-xs font-bold uppercase tracking-wider !text-white shadow-[0_8px_18px_rgba(246,106,22,.22)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:!bg-[#df5509] hover:shadow-[0_12px_24px_rgba(246,106,22,.3)] active:translate-y-0 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f66a16]/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60"
				>
					Save changes
				</button>
				<button
					type="button"
					onClick={cancel}
					className="rounded-full border border-[#d6bf9a] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#64391f] transition hover:border-[#f66a16]"
				>
					Cancel
				</button>
				{message && (
					<output className="inline-flex items-center gap-2 text-sm font-bold text-[#56611c]">
						<CheckCircle2 size={17} />
						{message}
					</output>
				)}
				{error && (
					<p role="alert" className="text-sm font-bold text-[#a84716]">
						{error}
					</p>
				)}
			</div>
		</form>
	);
}
function Metric({
	label,
	value,
	change,
}: {
	label: string;
	value: string;
	change: string;
}) {
	return (
		<article className="rounded-[1.4rem] border border-[#e1ceaa] bg-[#fffdf7] p-5">
			<p className="text-[10px] font-bold uppercase tracking-wider text-[#96745c]">
				{label}
			</p>
			<p className="mt-3 font-serif text-3xl font-bold">{value}</p>
			<p className="mt-3 text-xs font-semibold text-[#66752a]">{change}</p>
		</article>
	);
}
