import { useClerk, useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	BookOpen,
	CheckCircle2,
	ChevronRight,
	Heart,
	Home,
	LogOut,
	Mail,
	MapPin,
	Package,
	Phone,
	Settings,
	ShieldCheck,
	Sparkles,
	UserRound,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { getMyDashboardData } from "../features/analytics/analytics.functions";
import type { LiveOrder } from "../features/analytics/analytics.service";
import {
	getMyProfile,
	saveMyProfile,
	saveVerifiedPhone,
} from "../features/profile/profile.functions";
import type { ProfileRecord } from "../features/profile/profile.types";
import { getSessionAccess } from "../lib/auth";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const access = await getSessionAccess();
		if (!access.userId) throw redirect({ to: "/auth" });
		if (access.role === "admin") throw redirect({ to: "/admin" });
	},
	component: DashboardPage,
	head: () => ({
		meta: [
			{ title: "Your pantry — Molino Pastello" },
			{ name: "robots", content: "noindex, nofollow" },
			{
				name: "description",
				content: "Manage your Molino Pastello profile, orders and pantry.",
			},
		],
	}),
});

const nav = [
	[Home, "Overview"],
	[Package, "Orders"],
	[Heart, "Favourites"],
	[BookOpen, "Recipes"],
	[Settings, "Settings"],
] as const;
const formatMoney = (cents: number) =>
	new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
		cents / 100,
	);

function DashboardPage() {
	const { user } = useUser();
	const clerk = useClerk();
	const [activeView, setActiveView] =
		useState<(typeof nav)[number][1]>("Overview");
	const [dashboard, setDashboard] = useState<{
		orders: LiveOrder[];
		weeklyMeals: Array<{ week: string; meals: number }>;
	} | null>(null);
	const displayName = user?.fullName || user?.firstName || "Luca";
	const initial = displayName.charAt(0).toUpperCase();
	useEffect(() => {
		let active = true;
		const refresh = () =>
			void getMyDashboardData()
				.then((data) => active && setDashboard(data))
				.catch(() => undefined);
		refresh();
		const timer = window.setInterval(refresh, 15_000);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, []);
	const latestOrder = dashboard?.orders[0];
	const pantryData = dashboard?.weeklyMeals ?? [];
	const monthMeals = pantryData.reduce((total, week) => total + week.meals, 0);
	const openSettings = () => {
		setActiveView("Settings");
		window.requestAnimationFrame(() => {
			document
				.getElementById("profile")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};
	const openOrders = () => {
		setActiveView("Orders");
		window.requestAnimationFrame(() => {
			document
				.getElementById("orders")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};
	return (
		<main className="min-h-screen bg-[#fff8e9] text-[#64391f] lg:grid lg:grid-cols-[255px_1fr]">
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
					<a href="/" className="text-xs font-bold text-[#ffd8a4] lg:hidden">
						Shop
					</a>
				</div>
				<button
					type="button"
					onClick={() => setActiveView("Settings")}
					className="mt-8 flex w-full items-center gap-3 rounded-2xl bg-white/10 p-3 text-left transition hover:bg-white/15"
				>
					{user?.imageUrl ? (
						<img
							src={user.imageUrl}
							alt=""
							className="h-10 w-10 rounded-full object-cover ring-2 ring-[#f9b562]"
						/>
					) : (
						<span className="grid h-10 w-10 place-items-center rounded-full bg-[#f9b562] font-serif text-lg font-bold text-[#64391f]">
							{initial}
						</span>
					)}
					<div>
						<p className="text-sm font-bold">{displayName}</p>
						<p className="text-xs text-[#f6d9b1]">Pasta enthusiast</p>
					</div>
				</button>
				<nav
					aria-label="Account navigation"
					className="mt-7 flex gap-2 overflow-auto lg:block lg:space-y-1"
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
				<button
					type="button"
					onClick={() => void clerk.signOut({ redirectUrl: "/" })}
					className="mt-8 flex items-center gap-3 px-3 py-3 text-sm text-[#f6d9b1] no-underline lg:mt-40"
				>
					<LogOut size={17} />
					Sign out
				</button>
			</aside>
			<section className="p-5 sm:p-8 lg:p-12">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
							Your cucina
						</p>
						<h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
							Buongiorno, {displayName.split(" ")[0]}.
						</h1>
						<p className="mt-2 text-sm text-[#70452d]">
							Here’s what’s happening in your pantry.
						</p>
					</div>
					<a
						href="/shop"
						className="rounded-full bg-[#f66a16] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white no-underline"
					>
						Shop pasta
					</a>
				</div>
				{activeView === "Settings" ? (
					<ProfileSetup />
				) : activeView === "Overview" ? (
					<div className="mt-9 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
						<section className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(100,57,31,.08)]">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
										Latest order
									</p>
									<h2 className="mt-2 font-serif text-2xl font-bold">
										{latestOrder ? latestOrder.orderNumber : "No orders yet"}
									</h2>
								</div>
								<span className="rounded-full bg-[#edf1d7] px-3 py-1 text-xs font-bold text-[#56611c]">
									{latestOrder?.status ?? "Ready when you are"}
								</span>
							</div>
							<div className="mt-6 grid gap-4 border-y border-[#eadfc9] py-5 sm:grid-cols-3">
								<div>
									<p className="text-xs text-[#70452d]">Estimated arrival</p>
									<p className="mt-1 font-bold">
										{latestOrder
											? new Intl.DateTimeFormat("en-IN", {
													dateStyle: "medium",
												}).format(new Date(latestOrder.createdAt))
											: "Choose your first pasta"}
									</p>
								</div>
								<div>
									<p className="text-xs text-[#70452d]">Total</p>
									<p className="mt-1 font-bold">
										{latestOrder ? formatMoney(latestOrder.totalCents) : "—"}
									</p>
								</div>
								<div>
									<p className="text-xs text-[#70452d]">Items</p>
									<p className="mt-1 font-bold">
										{latestOrder
											? `${latestOrder.itemCount} artisan packs`
											: "—"}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={openOrders}
								className="mt-5 flex items-center justify-between text-sm font-bold text-[#a84716]"
							>
								Track your order <ChevronRight size={17} />
							</button>
						</section>
						<aside className="rounded-[1.75rem] bg-[#f66a16] p-6 text-white">
							<Sparkles size={22} />
							<h2 className="mt-5 font-serif text-2xl font-bold">
								Your pasta profile
							</h2>
							<p className="mt-2 text-sm leading-6 text-[#fff0d1]">
								You’re a classicist at heart, with a soft spot for slow Sunday
								sauces.
							</p>
							<button
								type="button"
								onClick={openSettings}
								className="mt-6 inline-block rounded-full !bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider !text-[#a84716] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#fff0d7] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
							>
								View profile
							</button>
						</aside>
					</div>
				) : (
					<UserWorkspace view={activeView} orders={dashboard?.orders ?? []} />
				)}
				<div className="mt-7 grid gap-7 xl:grid-cols-[1.25fr_.75fr]">
					<section className="rounded-[1.75rem] border border-[#e0cfae] bg-white/70 p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
									Pasta ritual
								</p>
								<h2 className="mt-2 font-serif text-2xl font-bold">
									Your kitchen this month
								</h2>
							</div>
							<span className="rounded-full bg-[#edf1d7] px-3 py-1 text-xs font-bold text-[#56611c]">
								{monthMeals} meals
							</span>
						</div>
						<div
							className="mt-5 h-36"
							role="img"
							aria-label="Bar chart showing two, four, three and five pasta meals over four weeks"
						>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={pantryData}
									margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
								>
									<XAxis
										dataKey="week"
										axisLine={false}
										tickLine={false}
										tick={{ fill: "#96745c", fontSize: 10, fontWeight: 700 }}
									/>
									<YAxis
										allowDecimals={false}
										axisLine={false}
										tickLine={false}
										tick={{ fill: "#96745c", fontSize: 10 }}
									/>
									<Tooltip
										formatter={(value) => [`${value} meals`, "Pasta nights"]}
										cursor={{ fill: "rgba(246,106,22,.08)" }}
										contentStyle={{ borderRadius: 14, borderColor: "#eadfc9" }}
									/>
									<Bar dataKey="meals" fill="#f66a16" radius={[8, 8, 2, 2]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</section>
					<section className="rounded-[1.75rem] border border-[#e0cfae] p-6">
						<UserRound className="text-[#a84716]" />
						<h2 className="mt-4 font-serif text-2xl font-bold">
							Account details
						</h2>
						<dl className="mt-5 space-y-4 text-sm">
							<div>
								<dt className="text-[#70452d]">Email</dt>
								<dd className="mt-1 font-semibold">
									{user?.primaryEmailAddress?.emailAddress || "Not available"}
								</dd>
							</div>
							<div>
								<dt className="text-[#70452d]">Member since</dt>
								<dd className="mt-1 font-semibold">
									{user?.createdAt
										? new Intl.DateTimeFormat("en-IN", {
												month: "long",
												year: "numeric",
											}).format(user.createdAt)
										: "Not available"}
								</dd>
							</div>
						</dl>
						<button
							type="button"
							onClick={openSettings}
							className="mt-6 inline-flex items-center rounded-lg text-sm font-bold text-[#a84716] transition-all duration-200 hover:translate-x-0.5 hover:text-[#df5509] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f66a16]/35"
						>
							Edit account
						</button>
					</section>
				</div>
				<div className="mt-7 grid gap-7 xl:grid-cols-[1.25fr_.75fr]">
					<section>
						<div className="flex items-end justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
									From your kitchen
								</p>
								<h2 className="mt-2 font-serif text-3xl font-bold">
									Cook something wonderful
								</h2>
							</div>
							<Link to="/recipes" className="text-sm font-bold text-[#a84716]">
								All recipes
							</Link>
						</div>
						<article className="mt-5 overflow-hidden rounded-[1.75rem] bg-[#f3e8cc] p-5 sm:flex sm:items-center sm:gap-7">
							<img
								src="/images/home/recipe-limone-new.png"
								alt="Lemon pasta recipe"
								className="h-44 w-full rounded-2xl object-cover sm:w-48"
							/>
							<div className="mt-5 sm:mt-0">
								<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
									20 minute dinner
								</p>
								<h3 className="mt-2 font-serif text-2xl font-bold">
									Silky lemon spaghetti
								</h3>
								<p className="mt-2 text-sm leading-6 text-[#70452d]">
									Bright, peppery and exactly right for your next packet of No.
									5.
								</p>
								<Link
									to="/recipes/$slug"
									params={{ slug: "spaghetti-al-limone" }}
									className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#a84716]"
								>
									Open recipe <ChevronRight size={16} />
								</Link>
							</div>
						</article>
					</section>
				</div>
			</section>
		</main>
	);
}

function UserWorkspace({
	view,
	orders,
}: {
	view: Exclude<(typeof nav)[number][1], "Overview" | "Settings">;
	orders: LiveOrder[];
}) {
	const copy = {
		Orders: ["Your orders", "Keep track of every pasta delivery."],
		Favourites: ["Your favourites", "Save the shapes and sauces you love."],
		Recipes: ["Your recipes", "A curated collection for your next dinner."],
	} as const;
	const [title, description] = copy[view];
	return (
		<section
			id="orders"
			className="mt-9 scroll-mt-8 rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(100,57,31,.08)]"
		>
			<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
				Your cucina
			</p>
			<h2 className="mt-2 font-serif text-3xl font-bold">{title}</h2>
			<p className="mt-2 text-sm text-[#70452d]">{description}</p>
			{view === "Orders" ? (
				<div className="mt-6 space-y-3">
					{orders.length ? (
						orders.map((order) => <OrderDetail key={order.id} order={order} />)
					) : (
						<div className="rounded-2xl border border-dashed border-[#decba8] bg-[#fff8e9] p-6 text-sm text-[#70452d]">
							Your verified purchases will appear here after checkout.
						</div>
					)}
				</div>
			) : (
				<div className="mt-6 rounded-2xl border border-dashed border-[#decba8] bg-[#fff8e9] p-6 text-sm text-[#70452d]">
					Your {view.toLowerCase()} will appear here as you shop and save items.
				</div>
			)}
		</section>
	);
}

function OrderDetail({ order }: { order: LiveOrder }) {
	const stages = [
		"Order confirmed",
		"Packed for the kitchen",
		"On its way",
		"Delivered",
	];
	const currentStage =
		order.status === "fulfilled" ? 3 : order.status === "processing" ? 1 : 0;
	return (
		<article className="rounded-2xl border border-[#eadfc9] p-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="font-bold">{order.orderNumber}</p>
					<p className="mt-1 text-sm text-[#70452d]">
						Placed{" "}
						{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
							new Date(order.createdAt),
						)}{" "}
						· {formatMoney(order.totalCents)}
					</p>
				</div>
				<span className="rounded-full bg-[#edf1d7] px-3 py-1 text-xs font-bold capitalize text-[#56611c]">
					{order.status}
				</span>
			</div>
			<div className="mt-5 grid gap-5 border-y border-[#eadfc9] py-5 sm:grid-cols-2">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
						Order details
					</p>
					<ul className="mt-2 space-y-1 text-sm text-[#70452d]">
						{order.items.map((item) => (
							<li key={`${item.name}-${item.quantity}`}>
								{item.quantity} × {item.name}
							</li>
						))}
					</ul>
				</div>
				<div>
					<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
						Delivery address
					</p>
					<p className="mt-2 text-sm leading-6 text-[#70452d]">
						{order.deliveryAddress ??
							"Address will be confirmed after checkout."}
					</p>
				</div>
			</div>
			<div className="mt-5">
				<p className="text-[10px] font-bold uppercase tracking-wider text-[#a84716]">
					Tracking
				</p>
				<ol className="mt-4 grid gap-3 sm:grid-cols-4">
					{stages.map((label, index) => (
						<li
							key={label}
							className="flex items-center gap-2 text-xs font-semibold"
						>
							<span
								className={`grid size-6 place-items-center rounded-full ${index <= currentStage ? "bg-[#f66a16] text-white" : "bg-[#f3e8cc] text-[#96745c]"}`}
							>
								{index < currentStage ? "✓" : index + 1}
							</span>
							<span
								className={
									index <= currentStage ? "text-[#64391f]" : "text-[#96745c]"
								}
							>
								{label}
							</span>
						</li>
					))}
				</ol>
			</div>
		</article>
	);
}

function ProfileSetup() {
	const { user } = useUser();
	const [firstName, setFirstName] = useState(user?.firstName ?? "");
	const [lastName, setLastName] = useState(user?.lastName ?? "");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [country, setCountry] = useState("India");
	const [phone, setPhone] = useState(
		user?.primaryPhoneNumber?.phoneNumber ?? "",
	);
	const [phoneCode, setPhoneCode] = useState("");
	const [phoneId, setPhoneId] = useState<string | null>(null);
	const [phoneVerified, setPhoneVerified] = useState(
		user?.primaryPhoneNumber?.verification.status === "verified",
	);
	const [changingPhone, setChangingPhone] = useState(false);
	const [savedProfile, setSavedProfile] = useState<ProfileRecord | null>(null);
	const [loading, setLoading] = useState(true);
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
				setAddress(profile.addressLine1);
				setCity(profile.city);
				setState(profile.state);
				setPostalCode(profile.postalCode);
				setCountry(profile.country || "India");
				setPhone(
					profile.phoneNumber ?? user.primaryPhoneNumber?.phoneNumber ?? "",
				);
				setPhoneVerified(Boolean(profile.phoneVerifiedAt));
			})
			.catch(() => {
				if (active)
					setError(
						"We couldn't load your saved profile. Please refresh and try again.",
					);
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [user]);

	const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user) return;
		setError("");
		setMessage("");
		if (!firstName.trim() || !lastName.trim()) {
			setError("Please add both your first and last name.");
			return;
		}
		if (
			!address.trim() ||
			!city.trim() ||
			!state.trim() ||
			!postalCode.trim()
		) {
			setError(
				"Please complete your delivery address, city, state and PIN code.",
			);
			return;
		}
		setSaving(true);
		try {
			const profile = await saveMyProfile({
				data: {
					firstName,
					lastName,
					addressLine1: address,
					city,
					state,
					postalCode,
					country,
				},
			});
			setSavedProfile(profile);
			setMessage("Your pantry profile has been saved.");
		} catch (caught) {
			setError(
				caught instanceof Error
					? caught.message
					: "We couldn't save your profile just now. Please try again.",
			);
		} finally {
			setSaving(false);
		}
	};

	const sendPhoneCode = async () => {
		if (!user) return;
		setError("");
		setMessage("");
		if (!/^\+[1-9]\d{7,14}$/.test(phone.replaceAll(" ", ""))) {
			setError(
				"Enter a valid number with country code, for example +91 98765 43210.",
			);
			return;
		}
		setSaving(true);
		try {
			const normalizedPhone = phone.replaceAll(" ", "");
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
		setError("");
		setMessage("");
		if (!/^\d{6}$/.test(phoneCode.trim())) {
			setError("Enter the 6-digit code sent to your phone.");
			return;
		}
		setSaving(true);
		try {
			const number = user.phoneNumbers.find((item) => item.id === phoneId);
			if (!number) throw new Error("Phone verification expired");
			const verified = await number.attemptVerification({
				code: phoneCode.trim(),
			});
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
			setPhoneId(null);
			setPhoneCode("");
			setMessage("Phone number verified. Your account is ready.");
		} catch {
			setError("That code didn't verify. Request a new one and try again.");
		} finally {
			setSaving(false);
		}
	};
	const cancel = () => {
		setFirstName(savedProfile?.firstName ?? user?.firstName ?? "");
		setLastName(savedProfile?.lastName ?? user?.lastName ?? "");
		setAddress(savedProfile?.addressLine1 ?? "");
		setCity(savedProfile?.city ?? "");
		setState(savedProfile?.state ?? "");
		setPostalCode(savedProfile?.postalCode ?? "");
		setCountry(savedProfile?.country ?? "India");
		setPhone(
			savedProfile?.phoneNumber ?? user?.primaryPhoneNumber?.phoneNumber ?? "",
		);
		setPhoneCode("");
		setPhoneId(null);
		setChangingPhone(false);
		setError("");
		setMessage("");
	};

	return (
		<section
			id="profile"
			className="mt-9 overflow-hidden rounded-[1.75rem] border border-[#e0cfae] bg-white shadow-[0_12px_32px_rgba(100,57,31,.08)]"
		>
			<div className="flex flex-wrap items-start justify-between gap-4 bg-[#f3e8cc] px-6 py-5 sm:px-7">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a84716]">
						Welcome to the famiglia
					</p>
					<h2 className="mt-2 font-serif text-2xl font-bold">
						Complete your pantry profile
					</h2>
					<p className="mt-1 text-sm text-[#70452d]">
						Keep delivery details here, in your Pastalo dashboard.
					</p>
				</div>
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${phoneVerified ? "bg-[#edf1d7] text-[#56611c]" : "bg-white text-[#a84716]"}`}
				>
					{phoneVerified ? (
						<CheckCircle2 size={15} />
					) : (
						<ShieldCheck size={15} />
					)}
					{phoneVerified ? "Phone verified" : "Profile setup"}
				</span>
			</div>
			<form onSubmit={saveProfile} className="p-6 sm:p-7" aria-busy={loading}>
				<div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eadfc9] bg-[#fff8e9] p-3">
					<p className="px-2 text-sm font-semibold text-[#70452d]">
						Review your details, then save your pantry profile.
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
				<div className="grid gap-4 sm:grid-cols-2">
					<ProfileField
						label="First name"
						value={firstName}
						onChange={setFirstName}
						autoComplete="given-name"
					/>
					<ProfileField
						label="Last name"
						value={lastName}
						onChange={setLastName}
						autoComplete="family-name"
					/>
				</div>
				<label className="mt-4 block text-xs font-bold text-[#64391f]">
					Email address
					<span className="relative mt-1.5 block">
						<Mail
							className="pointer-events-none absolute left-3 top-3 text-[#a84716]"
							size={16}
						/>
						<input
							value={user?.primaryEmailAddress?.emailAddress ?? ""}
							readOnly
							aria-label="Email address"
							className="w-full rounded-xl border border-[#dfcfac] bg-[#fff8e9] py-2.5 pl-9 pr-3 text-sm text-[#70452d] outline-none"
						/>
					</span>
				</label>
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					<ProfileField
						label="Delivery address"
						value={address}
						onChange={setAddress}
						autoComplete="street-address"
						icon={<MapPin size={16} />}
					/>
					<ProfileField
						label="City"
						value={city}
						onChange={setCity}
						autoComplete="address-level2"
					/>
				</div>
				<div className="mt-4 grid gap-4 sm:grid-cols-3">
					<ProfileField
						label="State"
						value={state}
						onChange={setState}
						autoComplete="address-level1"
					/>
					<ProfileField
						label="PIN code"
						value={postalCode}
						onChange={setPostalCode}
						autoComplete="postal-code"
						inputMode="numeric"
					/>
					<ProfileField
						label="Country"
						value={country}
						onChange={setCountry}
						autoComplete="country-name"
					/>
				</div>
				<div className="mt-6 border-t border-[#eadfc9] pt-5">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<p className="text-sm font-bold">Verify your phone number</p>
							<p className="mt-1 text-xs text-[#70452d]">
								We’ll use it only for delivery updates.
							</p>
						</div>
						{phoneVerified && !changingPhone && (
							<button
								type="button"
								onClick={() => setChangingPhone(true)}
								className="text-xs font-bold text-[#a84716] underline underline-offset-4"
							>
								Change phone number
							</button>
						)}
					</div>
					{(!phoneVerified || changingPhone) && (
						<div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
							<label className="relative">
								<span className="sr-only">Phone number</span>
								<Phone
									className="pointer-events-none absolute left-3 top-3 text-[#a84716]"
									size={16}
								/>
								<input
									value={phone}
									onChange={(event) => setPhone(event.target.value)}
									placeholder="+91 98765 43210"
									autoComplete="tel"
									inputMode="tel"
									className="w-full rounded-xl border border-[#dfcfac] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#f66a16]"
								/>
							</label>
							<button
								type="button"
								onClick={() => void sendPhoneCode()}
								disabled={saving}
								className="rounded-xl bg-[#64391f] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#4a2916] disabled:opacity-60"
							>
								Send code
							</button>
							{changingPhone && (
								<button
									type="button"
									onClick={() => {
										setChangingPhone(false);
										setPhoneId(null);
										setPhoneCode("");
										setPhone(
											savedProfile?.phoneNumber ??
												user?.primaryPhoneNumber?.phoneNumber ??
												"",
										);
									}}
									className="text-xs font-bold text-[#70452d] underline underline-offset-4"
								>
									Keep current
								</button>
							)}
							{phoneId && (
								<div className="flex gap-2 sm:col-span-2">
									<input
										value={phoneCode}
										onChange={(event) =>
											setPhoneCode(
												event.target.value.replace(/\D/g, "").slice(0, 6),
											)
										}
										placeholder="6-digit code"
										inputMode="numeric"
										className="min-w-0 flex-1 rounded-xl border border-[#dfcfac] px-3 py-2.5 text-sm outline-none focus:border-[#f66a16]"
									/>
									<button
										type="button"
										onClick={() => void verifyPhone()}
										disabled={saving}
										className="rounded-xl bg-[#f66a16] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#df5509] disabled:opacity-60"
									>
										Verify phone
									</button>
								</div>
							)}
						</div>
					)}
				</div>
				{error && (
					<p role="alert" className="mt-4 text-sm font-semibold text-[#a84716]">
						{error}
					</p>
				)}
				{message && (
					<output className="mt-4 block text-sm font-semibold text-[#56611c]">
						{message}
					</output>
				)}
				<button
					type="submit"
					disabled={saving || loading}
					className="mt-6 rounded-full border border-[#f66a16] !bg-[#f66a16] px-5 py-3 text-xs font-bold uppercase tracking-wider !text-white shadow-[0_8px_18px_rgba(246,106,22,.22)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:!bg-[#df5509] hover:shadow-[0_12px_24px_rgba(246,106,22,.3)] active:translate-y-0 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f66a16]/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60"
				>
					{saving ? "Saving…" : "Save changes"}
				</button>
				<button
					type="button"
					onClick={cancel}
					className="ml-2 mt-6 rounded-full border border-[#d6bf9a] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#64391f] transition hover:border-[#f66a16]"
				>
					Cancel
				</button>
			</form>
		</section>
	);
}

function ProfileField({
	label,
	value,
	onChange,
	autoComplete,
	inputMode,
	icon,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	autoComplete: string;
	inputMode?: "numeric" | "text" | "tel";
	icon?: React.ReactNode;
}) {
	return (
		<label className="block text-xs font-bold text-[#64391f]">
			{label}
			<span className="relative mt-1.5 block">
				{icon && (
					<span className="pointer-events-none absolute left-3 top-3 text-[#a84716]">
						{icon}
					</span>
				)}
				<input
					value={value}
					onChange={(event) => onChange(event.target.value)}
					autoComplete={autoComplete}
					inputMode={inputMode}
					className={`w-full rounded-xl border border-[#dfcfac] bg-white py-2.5 pr-3 text-sm outline-none transition focus:border-[#f66a16] ${icon ? "pl-9" : "pl-3"}`}
				/>
			</span>
		</label>
	);
}
