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
	PackageCheck,
	LogOut,
	UserRound,
	Settings,
	ShoppingBag,
	Users,
} from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { FormEvent } from "react";
import { useState } from "react";
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

function AdminAccountSettings() {
	const { user } = useUser();
	const [firstName, setFirstName] = useState(user?.firstName ?? "Saquibhazari");
	const [lastName, setLastName] = useState(user?.lastName ?? "");
	const [email, setEmail] = useState(
		user?.primaryEmailAddress?.emailAddress ?? "",
	);
	const [phone, setPhone] = useState(
		user?.primaryPhoneNumber?.phoneNumber ?? "",
	);
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [country, setCountry] = useState("India");
	const [preview, setPreview] = useState(user?.imageUrl ?? "");
	const [saved, setSaved] = useState(false);
	const cancel = () => {
		setFirstName(user?.firstName ?? "Saquibhazari");
		setLastName(user?.lastName ?? "");
		setEmail(user?.primaryEmailAddress?.emailAddress ?? "");
		setPhone(user?.primaryPhoneNumber?.phoneNumber ?? "");
		setAddress("");
		setCity("");
		setState("");
		setZipCode("");
		setCountry("India");
		setPreview(user?.imageUrl ?? "");
		setSaved(false);
	};
	const save = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaved(true);
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
					setSaved(false);
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
					Changes are preview-only until the database is connected.
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
						className="rounded-full border border-[#f66a16] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#a84716] transition hover:-translate-y-0.5 hover:bg-[#fff0d7]"
					>
						Save changes
					</button>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#f3e8cc] p-4">
				<div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#f9b562] font-serif text-xl font-bold text-[#64391f]">
					{preview ? (
						<img
							src={preview}
							alt="Profile preview"
							className="size-full object-cover"
						/>
					) : (
						firstName.charAt(0).toUpperCase()
					)}
				</div>
				<div>
					<p className="font-bold">Profile picture</p>
					<p className="mt-1 text-xs text-[#70452d]">
						JPG, PNG or WebP. This preview is for the dashboard prototype.
					</p>
					<label className="mt-3 inline-flex cursor-pointer rounded-full border border-[#d6bf9a] bg-white px-3 py-2 text-xs font-bold text-[#64391f] transition hover:border-[#f66a16]">
						Choose photo
						<input
							type="file"
							accept="image/png,image/jpeg,image/webp"
							className="sr-only"
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) {
									setPreview(URL.createObjectURL(file));
									setSaved(false);
								}
							}}
						/>
					</label>
				</div>
			</div>
			<div className="mt-6 grid gap-4 sm:grid-cols-2">
				{field("First name", firstName, setFirstName, "given-name")}
				{field("Last name", lastName, setLastName, "family-name")}
				{field("Email address", email, setEmail, "email")}
				{field("Phone number", phone, setPhone, "tel")}
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
					className="rounded-full border border-[#f66a16] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#a84716] transition hover:-translate-y-0.5 hover:bg-[#fff0d7]"
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
				{saved && (
					<p
						role="status"
						className="inline-flex items-center gap-2 text-sm font-bold text-[#56611c]"
					>
						<CheckCircle2 size={17} />
						Information saved — preview mode only, no database has been updated.
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
