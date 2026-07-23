export type PastaProduct = {
	id: string;
	name: string;
	detail: string;
	price: number;
	category: "long" | "short" | "specialty";
	image: string;
};

export const pastaProducts: PastaProduct[] = [
	{
		id: "spaghetti",
		name: "Traditional Spaghetti No. 5",
		detail: "500g · bronze die",
		price: 12,
		category: "long",
		image: "/images/products/molino-spaghetti-package-v2.webp",
	},
	{
		id: "penne",
		name: "Organic Penne Rigate",
		detail: "500g · ridged texture",
		price: 14,
		category: "short",
		image: "/images/products/molino-penne-package-v2.webp",
	},
	{
		id: "fusilli",
		name: "Hand-Twisted Fusilli",
		detail: "500g · slow dried",
		price: 14,
		category: "short",
		image: "/images/products/molino-fusilli-package-v2.webp",
	},
	{
		id: "bucatini",
		name: "Artisanal Bucatini",
		detail: "500g · hollow center",
		price: 13.5,
		category: "long",
		image: "/images/products/molino-bucatini-package-v2.webp",
	},
	{
		id: "mezze",
		name: "Mezze Rigatoni",
		detail: "500g · large ridges",
		price: 12,
		category: "short",
		image: "/images/products/molino-mezze-rigatoni-package-v2.webp",
	},
	{
		id: "farfalle",
		name: "Farfalle Classico",
		detail: "500g · bow-tie",
		price: 11,
		category: "specialty",
		image: "/images/products/molino-farfalle-package-v2.webp",
	},
];
