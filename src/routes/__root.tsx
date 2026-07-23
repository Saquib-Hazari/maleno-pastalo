import {
	createRootRoute,
	HeadContent,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";
import AppClerkProvider from "../integrations/clerk/provider";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Molino Pastello — Italian Pasta & Flour",
			},
			{
				name: "description",
				content:
					"Authentic Italian pasta and flour, slowly crafted with exceptional durum wheat and time-honoured Italian techniques.",
			},
			{ name: "robots", content: "index, follow, max-image-preview:large" },
			{ name: "theme-color", content: "#f66a16" },
			{ name: "color-scheme", content: "light" },
			{
				property: "og:title",
				content: "Molino Pastello — Italian Pasta & Flour",
			},
			{
				property: "og:description",
				content:
					"Authentic Italian pasta and flour, slowly crafted with exceptional durum wheat and time-honoured Italian techniques.",
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:image",
				content: "/images/home/hero-pasta-branded-desktop.png",
			},
			{ property: "og:image:alt", content: "Molino Pastello artisan pasta" },
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:image",
				content: "/images/home/hero-pasta-branded-desktop.png",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isWorkspace = ["/auth", "/dashboard", "/admin"].includes(pathname);
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<AppClerkProvider>
					{!isWorkspace && <Header />}
					{children}
					{!isWorkspace && <Footer />}
				</AppClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
