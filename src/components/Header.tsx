import { Show, useClerk, useUser } from "@clerk/tanstack-react-start";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
	LogOut,
	Menu,
	Package,
	ReceiptText,
	Search,
	Settings,
	ShoppingBag,
	Store,
	X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const navigation = [
	["Shop", "/shop"],
	["About", "/about"],
	["Our Story", "/#story"],
	["Recipes", "/recipes"],
	["Reviews", "/#reviews"],
];

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [cart, setCart] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	useEffect(() => {
		const update = (event: Event) =>
			setCart((event as CustomEvent<number>).detail);
		window.addEventListener("pastalo:cart", update);
		return () => window.removeEventListener("pastalo:cart", update);
	}, []);
	const closeMenu = () => setMenuOpen(false);
	return (
		<header className="sticky top-0 z-50 border-b border-[#70452d]/10 bg-[#fff8e9]/95 px-4 backdrop-blur">
			<nav
				className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-3"
				aria-label="Main navigation"
			>
				<a
					href="/"
					className="flex items-center gap-1.5 font-serif text-sm font-bold text-[#64391f] no-underline"
				>
					<span className="grid size-8 place-items-center rounded-lg border border-[#70452d]/15 bg-white p-0.5 shadow-sm">
						<img
							src="/images/brand/molino-package-seal.png"
							alt=""
							className="size-full object-contain"
						/>
					</span>
					Molino Pastello
				</a>
				<div className="hidden items-center gap-5 text-[9px] font-bold uppercase tracking-wider md:flex">
					{navigation.map(([label, href]) => (
						<a
							key={label}
							href={href}
							className="text-[#70452d] no-underline hover:text-[#f66a16]"
						>
							{label}
						</a>
					))}
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setSearchOpen((value) => !value)}
						aria-expanded={searchOpen}
						aria-controls="site-search"
						className="grid size-9 place-items-center rounded-full text-[#64391f] hover:bg-[#f2e7d0]"
						aria-label="Search"
					>
						<Search size={16} />
					</button>
					<a
						href="/cart"
						className="relative grid size-9 place-items-center rounded-full text-[#64391f] hover:bg-[#f2e7d0]"
						aria-label={`View basket with ${cart} items`}
					>
						<ShoppingBag size={16} />
						{cart > 0 && (
							<span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#f66a16] text-[8px] font-bold text-white">
								{cart}
							</span>
						)}
					</a>
					<Show when="signed-out">
						<a
							href="/auth"
							className="hidden rounded-full border border-[#d9c6a8] px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-[#64391f] no-underline hover:border-[#f66a16] hover:text-[#f66a16] sm:block"
						>
							Sign in
						</a>
						<a
							href="/auth#signup"
							className="hidden rounded-full bg-[#f66a16] px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-white no-underline hover:bg-[#df5509] sm:block"
						>
							Join us
						</a>
					</Show>
					<Show when="signed-in">
						<SignedInNavigation />
					</Show>
					<button
						type="button"
						onClick={() => setMenuOpen((value) => !value)}
						className="grid size-9 place-items-center rounded-full text-[#64391f] hover:bg-[#f2e7d0] md:hidden"
						aria-label={menuOpen ? "Close menu" : "Open menu"}
						aria-expanded={menuOpen}
					>
						{menuOpen ? <X size={18} /> : <Menu size={18} />}
					</button>
				</div>
			</nav>
			{searchOpen && (
				<form
					id="site-search"
					className="mx-auto flex max-w-[1120px] gap-2 border-t border-[#70452d]/10 py-3"
					onSubmit={(event) => {
						event.preventDefault();
						window.dispatchEvent(
							new CustomEvent("pastalo:search", { detail: searchTerm }),
						);
						document
							.getElementById("shop")
							?.scrollIntoView({ behavior: "smooth" });
						setSearchOpen(false);
					}}
				>
					<label className="sr-only" htmlFor="site-search-input">
						Search products
					</label>
					<input
						id="site-search-input"
						name="site-search"
						autoComplete="off"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search the collection"
						className="min-w-0 flex-1 rounded-full border border-[#d9c6a8] bg-white px-4 py-2 text-sm outline-[#f66a16]"
					/>
					<button
						type="submit"
						className="rounded-full bg-[#64391f] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white"
					>
						Search
					</button>
				</form>
			)}
			<div
				className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
				aria-hidden={!menuOpen}
			>
				<div className="min-h-0">
					<div
						className={`border-t border-[#70452d]/10 px-5 py-4 transition-opacity duration-200 ${menuOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0"}`}
					>
						{navigation.filter(([label]) => label !== "Shop").map(([label, href]) => (
							<a
								onClick={closeMenu}
								key={label}
								href={href}
								tabIndex={menuOpen ? 0 : -1}
								className="block py-3 text-sm font-bold text-[#64391f] no-underline transition-colors hover:text-[#f66a16]"
							>
								{label}
							</a>
						))}
						<Show when="signed-out">
							<a
								onClick={closeMenu}
								href="/auth"
								tabIndex={menuOpen ? 0 : -1}
								className="block py-3 text-sm font-bold text-[#64391f] no-underline"
							>
								Sign in
							</a>
							<a
								onClick={closeMenu}
								href="/auth#signup"
								tabIndex={menuOpen ? 0 : -1}
								className="block py-3 text-sm font-bold text-[#a84716] no-underline"
							>
								Create account
							</a>
						</Show>
					</div>
				</div>
			</div>
		</header>
	);
}

function SignedInNavigation() {
	const { user } = useUser();
	const isAdmin =
		user?.primaryEmailAddress?.emailAddress?.toLowerCase() ===
			"saquibhazari1000@gmail.com" || user?.publicMetadata.role === "admin";
	return (
		<>
			{isAdmin && (
				<a
					href="/admin"
					className="hidden rounded-full bg-[#64391f] px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-[#fff8e9] no-underline sm:block"
				>
					Admin
				</a>
			)}
			<AccountMenu />
		</>
	);
}

function AccountMenu() {
	const clerk = useClerk();
	const { user } = useUser();
	const isAdmin =
		user?.primaryEmailAddress?.emailAddress?.toLowerCase() ===
			"saquibhazari1000@gmail.com" || user?.publicMetadata.role === "admin";
	const dashboardHref = isAdmin ? "/admin" : "/dashboard";
	const name = user?.fullName || user?.firstName || "My account";
	const initials = name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					className="ml-1 grid size-9 place-items-center overflow-hidden rounded-full border-2 border-[#f9b562] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f66a16]"
					aria-label="Open account menu"
				>
					{user?.imageUrl ? (
						<img
							src={user.imageUrl}
							alt=""
							className="size-full object-cover"
						/>
					) : (
						<span className="font-serif text-xs font-bold text-[#64391f]">
							{initials}
						</span>
					)}
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					sideOffset={10}
					className="z-[70] w-72 rounded-3xl border border-[#e4d0ad] bg-[#fffdf8] p-2 shadow-[0_18px_45px_rgba(100,57,31,.2)] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95"
				>
					<div className="flex items-center gap-3 px-3 py-3">
						{user?.imageUrl ? (
							<img
								src={user.imageUrl}
								alt=""
								className="size-10 rounded-full object-cover"
							/>
						) : (
							<span className="grid size-10 place-items-center rounded-full bg-[#f9b562] font-serif font-bold text-[#64391f]">
								{initials}
							</span>
						)}
						<div className="min-w-0">
							<p className="truncate text-sm font-bold text-[#64391f]">
								{name}
							</p>
							<p className="truncate text-xs text-[#70452d]">
								{user?.primaryEmailAddress?.emailAddress}
							</p>
						</div>
					</div>
					<DropdownMenu.Separator className="my-1 h-px bg-[#eadfc9]" />
					<AccountMenuLink
						href={dashboardHref}
						icon={<Package size={16} />}
						label={isAdmin ? "Admin dashboard" : "My dashboard"}
					/>
					<AccountMenuLink
						href="/shop"
						icon={<Store size={16} />}
						label="Shop pasta"
					/>
					<AccountMenuLink
						href="/cart"
						icon={<ShoppingBag size={16} />}
						label="My cart"
					/>
					<AccountMenuLink
						href={`${dashboardHref}#orders`}
						icon={<ReceiptText size={16} />}
						label="Purchase history"
					/>
					<DropdownMenu.Item
						onSelect={(event) => {
							event.preventDefault();
							clerk.openUserProfile();
						}}
						className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#64391f] outline-none transition data-[highlighted]:bg-[#f3e8cc]"
					>
						<Settings size={16} /> Manage account
					</DropdownMenu.Item>
					<DropdownMenu.Separator className="my-1 h-px bg-[#eadfc9]" />
					<DropdownMenu.Item
						onSelect={() => void clerk.signOut({ redirectUrl: "/" })}
						className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-[#a84716] outline-none transition data-[highlighted]:bg-[#fff0d7]"
					>
						<LogOut size={16} /> Sign out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}

function AccountMenuLink({
	href,
	icon,
	label,
}: {
	href: string;
	icon: ReactNode;
	label: string;
}) {
	return (
		<DropdownMenu.Item asChild>
			<a
				href={href}
				className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#64391f] no-underline outline-none transition data-[highlighted]:bg-[#f3e8cc]"
			>
				{icon}
				{label}
			</a>
		</DropdownMenu.Item>
	);
}
