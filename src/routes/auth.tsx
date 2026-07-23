import { useSignIn, useSignUp } from "@clerk/tanstack-react-start/legacy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/auth")({
	component: AuthPage,
	head: () => ({
		meta: [
			{ title: "Sign in — Molino Pastello" },
			{ name: "robots", content: "noindex, nofollow" },
			{
				name: "description",
				content: "Sign in or create a Molino Pastello account.",
			},
		],
	}),
});

type ClerkError = {
	errors?: Array<{ code?: string; longMessage?: string; message?: string }>;
};
type VerificationAttempt = {
	status: string;
	createdSessionId?: string | null;
	missingFields?: string[];
	unverifiedFields?: string[];
};
const clerkMessage = (error: unknown) => {
	const clerkError = (error as ClerkError).errors?.[0];
	if (
		clerkError?.code?.includes("pwned") ||
		clerkError?.code?.includes("breach")
	)
		return "That password has appeared in a known breach. Please choose a different password that you do not use anywhere else.";
	if (
		clerkError?.code === "form_identifier_not_found" ||
		clerkError?.code === "form_password_incorrect"
	)
		return "We couldn't sign you in with that email and password.";
	if (clerkError?.code === "form_identifier_exists")
		return "An account with this email already exists. Try signing in instead.";
	if (clerkError?.code === "verification_failed")
		return "That verification code is invalid or has expired. Please try again.";
	return (
		clerkError?.longMessage ??
		clerkError?.message ??
		"Something went wrong. Please try again."
	);
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRules = [
	{ label: "8 or more characters", test: (value: string) => value.length >= 8 },
	{
		label: "An uppercase letter",
		test: (value: string) => /[A-Z]/.test(value),
	},
	{ label: "A lowercase letter", test: (value: string) => /[a-z]/.test(value) },
	{ label: "A number", test: (value: string) => /\d/.test(value) },
	{
		label: "A symbol (for example ! @ #)",
		test: (value: string) => /[^A-Za-z0-9]/.test(value),
	},
];

function AuthPage() {
	const navigate = useNavigate();
	const {
		isLoaded: signInLoaded,
		signIn,
		setActive: activateSignIn,
	} = useSignIn();
	const {
		isLoaded: signUpLoaded,
		signUp,
		setActive: activateSignUp,
	} = useSignUp();
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [needsVerification, setNeedsVerification] = useState(false);
	const [visible, setVisible] = useState(false);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	useEffect(() => {
		const syncMode = () =>
			setMode(window.location.hash === "#signup" ? "signup" : "signin");
		syncMode();
		window.addEventListener("hashchange", syncMode);
		return () => window.removeEventListener("hashchange", syncMode);
	}, []);
	const selectMode = (next: "signin" | "signup") => {
		setError("");
		setNotice("");
		setFieldErrors({});
		setNeedsVerification(false);
		window.location.hash = next === "signup" ? "signup" : "signin";
	};
	const finish = async (
		sessionId: string | null | undefined,
		activate: typeof activateSignIn,
	) => {
		if (!sessionId || !activate) {
			setError("We couldn't create a session. Please try again.");
			return;
		}
		await activate({ session: sessionId });
		await navigate({ to: "/dashboard" });
	};
	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setFieldErrors({});
		const nextFieldErrors: Record<string, string> = {};
		const normalizedEmail = email.trim().toLowerCase();
		if (needsVerification) {
			if (!/^\d{6}$/.test(code.trim()))
				nextFieldErrors.code = "Enter the 6-digit code from your email.";
		} else {
			if (!emailPattern.test(normalizedEmail))
				nextFieldErrors.email =
					"Enter a valid email address, like name@example.com.";
			if (!password)
				nextFieldErrors.password = "Enter your password to continue.";
			if (mode === "signup") {
				if (name.trim().length < 2)
					nextFieldErrors.name = "Enter your full name.";
				if (!passwordRules.every((rule) => rule.test(password)))
					nextFieldErrors.password =
						"Use all of the password requirements below.";
				if (password !== confirmPassword)
					nextFieldErrors.confirmPassword = "Your passwords do not match.";
			}
		}
		if (Object.keys(nextFieldErrors).length > 0) {
			setFieldErrors(nextFieldErrors);
			return;
		}
		setPending(true);
		try {
			if (mode === "signin") {
				if (!signInLoaded) return;
				const result = await signIn.create({
					identifier: normalizedEmail,
					password,
				});
				if (result.status === "complete")
					await finish(result.createdSessionId, activateSignIn);
				else setError("Please complete the remaining sign-in step.");
				return;
			}
			if (!signUpLoaded) return;
			if (needsVerification) {
				const result = (await signUp.attemptEmailAddressVerification({
					code: code.trim(),
				})) as VerificationAttempt;
				if (result.status === "complete")
					await finish(result.createdSessionId, activateSignUp);
				else {
					const remaining = [
						...(result.missingFields ?? []),
						...(result.unverifiedFields ?? []),
					];
					setError(
						remaining.length > 0
							? `Verification is not finished yet. Clerk still requires: ${remaining.join(", ").replaceAll("_", " ")}.`
							: "We couldn't finish this verification. Request a fresh code and enter the newest code from your inbox.",
					);
				}
				return;
			}
			await signUp.create({
				emailAddress: normalizedEmail,
				password,
				firstName: name.trim().split(" ")[0] || undefined,
				lastName: name.trim().split(" ").slice(1).join(" ") || undefined,
			});
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
			setNeedsVerification(true);
		} catch (cause) {
			setError(clerkMessage(cause));
		} finally {
			setPending(false);
		}
	};
	const resendVerificationCode = async () => {
		if (!signUpLoaded) return;
		setError("");
		setNotice("");
		setPending(true);
		try {
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
			setCode("");
			setNotice(
				"A fresh verification code was sent. Use the newest code in your inbox.",
			);
		} catch (cause) {
			setError(clerkMessage(cause));
		} finally {
			setPending(false);
		}
	};
	const continueWithGoogle = async () => {
		setError("");
		setPending(true);
		try {
			if (!signInLoaded) {
				setError("Sign-in is still loading. Please try again in a moment.");
				return;
			}
			await signIn.authenticateWithRedirect({
				strategy: "oauth_google",
				redirectUrl: "/sso-callback",
				redirectUrlComplete: "/dashboard",
			});
		} catch (cause) {
			setError(clerkMessage(cause));
			setPending(false);
		}
	};
	return (
		<main className="grid min-h-screen bg-[#fff8e9] lg:grid-cols-[1.05fr_.95fr]">
			<section className="relative hidden overflow-hidden bg-[#f66a16] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,230,175,.42),transparent_25%),radial-gradient(circle_at_10%_92%,rgba(100,57,31,.27),transparent_36%)]" />
				<a href="/" className="relative text-white no-underline">
					<span className="inline-flex rounded-2xl bg-[#fff8e9] p-2 shadow-lg shadow-[#64391f]/15">
						<img
							src="/images/brand/molino-wordmark-stacked.png"
							alt="Molino Pastello"
							className="h-24 w-32 object-contain object-center"
						/>
					</span>
				</a>
				<div className="relative max-w-lg">
					<p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#ffe1b1]">
						Benvenuti
					</p>
					<h1 className="mt-5 font-serif text-6xl font-bold leading-[.98]">
						The heart of Italy, delivered to your table.
					</h1>
					<p className="mt-6 max-w-md text-lg leading-8 text-[#fff1d7]">
						Join our famiglia for recipes, thoughtful pasta pairings, and pantry
						staples made with patience.
					</p>
				</div>
				<p className="relative text-xs text-[#fff1d7]">
					© 2026 Molino Pastello. Crafted with care.
				</p>
			</section>
			<section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
				<div className="w-full max-w-md">
					<a
						href="/"
						className="flex items-center justify-center gap-2 text-[#64391f] no-underline lg:hidden"
					>
						<span className="grid h-10 w-10 place-items-center rounded-xl border border-[#70452d]/15 bg-white p-1 shadow-sm">
							<img
								src="/images/brand/molino-package-seal.png"
								alt=""
								className="size-full object-contain"
							/>
						</span>
						<span className="font-serif text-2xl font-bold">
							Molino Pastello
						</span>
					</a>
					<div className="relative mt-10 flex border-b border-[#dfcfac]">
						<button
							type="button"
							onClick={() => selectMode("signin")}
							className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-[.16em] transition-colors duration-200 ${mode === "signin" ? "text-[#64391f]" : "text-[#a07b60] hover:text-[#64391f]"}`}
						>
							Sign in
						</button>
						<button
							type="button"
							onClick={() => selectMode("signup")}
							className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-[.16em] transition-colors duration-200 ${mode === "signup" ? "text-[#64391f]" : "text-[#a07b60] hover:text-[#64391f]"}`}
						>
							Create account
						</button>
						<span
							aria-hidden="true"
							className={`absolute bottom-[-1px] h-0.5 w-1/2 bg-[#f66a16] transition-transform duration-300 ease-out ${mode === "signup" ? "translate-x-full" : "translate-x-0"}`}
						/>
					</div>
					<div
						key={`${mode}-${needsVerification}`}
						className="auth-panel-motion"
					>
						<h1 className="mt-9 font-serif text-4xl font-bold text-[#64391f]">
							{mode === "signin"
								? "Welcome back."
								: needsVerification
									? "Check your inbox."
									: "Join the famiglia."}
						</h1>
						<p className="mt-2 text-sm leading-6 text-[#70452d]">
							{mode === "signin"
								? "Sign in to revisit your favourites and manage your orders."
								: needsVerification
									? `We sent a verification code to ${email}.`
									: "Create an account for a more delicious way to shop."}
						</p>
						<form noValidate onSubmit={submit} className="mt-7 space-y-4">
							{mode === "signup" && !needsVerification && (
								<label className="block text-sm font-bold text-[#64391f]">
									Full name
									<input
										required
										autoComplete="name"
										value={name}
										onChange={(event) => setName(event.target.value)}
										placeholder="Your name"
										aria-invalid={Boolean(fieldErrors.name)}
										aria-describedby={
											fieldErrors.name ? "name-error" : undefined
										}
										className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 font-normal outline-none transition focus:border-[#f66a16] ${fieldErrors.name ? "border-[#c5481c]" : "border-[#dfcfac]"}`}
									/>
									{fieldErrors.name && (
										<span
											id="name-error"
											className="mt-2 block text-xs font-medium text-[#a84716]"
										>
											{fieldErrors.name}
										</span>
									)}
								</label>
							)}
							{needsVerification ? (
								<label className="block text-sm font-bold text-[#64391f]">
									Email verification code
									<input
										required
										inputMode="numeric"
										pattern="[0-9]{6}"
										maxLength={6}
										autoComplete="one-time-code"
										value={code}
										onChange={(event) => setCode(event.target.value)}
										placeholder="Enter the code"
										aria-invalid={Boolean(fieldErrors.code)}
										aria-describedby={
											fieldErrors.code ? "code-error" : undefined
										}
										className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 font-normal outline-none transition focus:border-[#f66a16] ${fieldErrors.code ? "border-[#c5481c]" : "border-[#dfcfac]"}`}
									/>
									{fieldErrors.code && (
										<span
											id="code-error"
											className="mt-2 block text-xs font-medium text-[#a84716]"
										>
											{fieldErrors.code}
										</span>
									)}
									<button
										type="button"
										onClick={resendVerificationCode}
										disabled={pending}
										className="mt-3 text-xs font-bold text-[#a84716] underline-offset-4 hover:underline disabled:cursor-wait disabled:opacity-60"
									>
										Resend a new code
									</button>
								</label>
							) : (
								<>
									<label className="block text-sm font-bold text-[#64391f]">
										Email address
										<div className="relative mt-2">
											<Mail
												className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a84716]"
												size={17}
											/>
											<input
												required
												type="email"
												autoComplete="email"
												value={email}
												onChange={(event) => setEmail(event.target.value)}
												placeholder="you@example.com"
												aria-invalid={Boolean(fieldErrors.email)}
												aria-describedby={
													fieldErrors.email ? "email-error" : undefined
												}
												className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 font-normal outline-none transition focus:border-[#f66a16] ${fieldErrors.email ? "border-[#c5481c]" : "border-[#dfcfac]"}`}
											/>
										</div>
										{fieldErrors.email && (
											<span
												id="email-error"
												className="mt-2 block text-xs font-medium text-[#a84716]"
											>
												{fieldErrors.email}
											</span>
										)}
									</label>
									<label className="block text-sm font-bold text-[#64391f]">
										Password
										<div className="relative mt-2">
											<LockKeyhole
												className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a84716]"
												size={17}
											/>
											<input
												required
												minLength={8}
												autoComplete={
													mode === "signin"
														? "current-password"
														: "new-password"
												}
												type={visible ? "text" : "password"}
												value={password}
												onChange={(event) => setPassword(event.target.value)}
												placeholder="••••••••"
												aria-invalid={Boolean(fieldErrors.password)}
												aria-describedby={
													fieldErrors.password
														? "password-error password-requirements"
														: mode === "signup"
															? "password-requirements"
															: undefined
												}
												className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 font-normal outline-none transition focus:border-[#f66a16] ${fieldErrors.password ? "border-[#c5481c]" : "border-[#dfcfac]"}`}
											/>
											<button
												type="button"
												aria-label={visible ? "Hide password" : "Show password"}
												onClick={() => setVisible(!visible)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-[#70452d]"
											>
												{visible ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
										{fieldErrors.password && (
											<span
												id="password-error"
												className="mt-2 block text-xs font-medium text-[#a84716]"
											>
												{fieldErrors.password}
											</span>
										)}
									</label>
									{mode === "signup" && (
										<ul
											id="password-requirements"
											className="mt-3 grid gap-1.5 text-xs font-medium text-[#70452d]"
											aria-label="Password requirements"
										>
											{passwordRules.map((rule) => {
												const fulfilled = rule.test(password);
												return (
													<li
														key={rule.label}
														className={`flex items-center gap-2 ${fulfilled ? "text-[#557019]" : ""}`}
													>
														<span
															className={`grid size-4 place-items-center rounded-full border ${fulfilled ? "border-[#6d7b2c] bg-[#6d7b2c] text-white" : "border-[#cdb991]"}`}
														>
															{fulfilled && "✓"}
														</span>
														{rule.label}
													</li>
												);
											})}
										</ul>
									)}
									{mode === "signup" && (
										<label className="block text-sm font-bold text-[#64391f]">
											Confirm password
											<input
												required
												type={visible ? "text" : "password"}
												autoComplete="new-password"
												value={confirmPassword}
												onChange={(event) =>
													setConfirmPassword(event.target.value)
												}
												placeholder="Repeat your password"
												aria-invalid={Boolean(fieldErrors.confirmPassword)}
												aria-describedby={
													fieldErrors.confirmPassword
														? "confirm-password-error"
														: undefined
												}
												className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 font-normal outline-none transition focus:border-[#f66a16] ${fieldErrors.confirmPassword ? "border-[#c5481c]" : "border-[#dfcfac]"}`}
											/>
											{fieldErrors.confirmPassword && (
												<span
													id="confirm-password-error"
													className="mt-2 block text-xs font-medium text-[#a84716]"
												>
													{fieldErrors.confirmPassword}
												</span>
											)}
										</label>
									)}
								</>
							)}
							{error && (
								<p
									aria-live="assertive"
									className="rounded-xl bg-[#fff0d7] px-4 py-3 text-sm text-[#a84716]"
								>
									{error}
								</p>
							)}
							{notice && (
								<p
									aria-live="polite"
									className="rounded-xl bg-[#edf2d2] px-4 py-3 text-sm text-[#557019]"
								>
									{notice}
								</p>
							)}
							<button
								type="submit"
								disabled={
									pending ||
									(!signInLoaded && mode === "signin") ||
									(!signUpLoaded && mode === "signup")
								}
								className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f66a16] px-5 py-4 text-xs font-bold uppercase tracking-[.16em] text-[#4a2916] transition hover:bg-[#df5509] disabled:cursor-wait disabled:opacity-60"
							>
								{pending
									? "Please wait"
									: needsVerification
										? "Verify email"
										: mode === "signin"
											? "Sign in"
											: "Create my account"}
								<ArrowRight size={16} />
							</button>
						</form>
						{!needsVerification && (
							<div className="mt-6 space-y-4">
								<div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#96745c]">
									<span className="h-px flex-1 bg-[#dfcfac]" />
									or continue with
									<span className="h-px flex-1 bg-[#dfcfac]" />
								</div>
								<button
									type="button"
									onClick={continueWithGoogle}
									disabled={pending}
									className="flex w-full items-center justify-center gap-3 rounded-full !bg-[#f66a16] px-5 py-3.5 text-xs font-bold uppercase tracking-wider !text-[#4a2916] shadow-[0_8px_18px_rgba(246,106,22,.32)] transition hover:!bg-[#df5509] disabled:cursor-wait disabled:opacity-60"
								>
									<span
										className="grid size-6 place-items-center rounded-full bg-white shadow-sm"
										aria-hidden="true"
									>
										<svg viewBox="0 0 24 24" className="size-4">
											<title>Google</title>
											<path
												fill="#4285F4"
												d="M21.35 12.27c0-.79-.07-1.55-.21-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.13c1.83-1.68 2.93-4.16 2.93-7.75Z"
											/>
											<path
												fill="#34A853"
												d="M12 21.75c2.62 0 4.82-.87 6.42-2.35l-3.13-2.79c-.87.58-1.98.92-3.29.92-2.53 0-4.68-1.71-5.45-4.01H3.31v2.88A9.7 9.7 0 0 0 12 21.75Z"
											/>
											<path
												fill="#FBBC05"
												d="M6.55 13.52A5.83 5.83 0 0 1 6.24 12c0-.53.1-1.04.31-1.52V7.6H3.31A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.06 4.4l3.24-2.88Z"
											/>
											<path
												fill="#EA4335"
												d="M12 6.47c1.42 0 2.7.49 3.7 1.45l2.77-2.77C16.82 3.6 14.62 2.25 12 2.25a9.7 9.7 0 0 0-8.69 5.35l3.24 2.88c.77-2.3 2.92-4.01 5.45-4.01Z"
											/>
										</svg>
									</span>
									Continue with Google
								</button>
							</div>
						)}
					</div>
					<p className="mt-8 text-center text-xs leading-5 text-[#70452d]">
						Your account is secured by Clerk. By continuing, you agree to our
						Terms of Service and Privacy Policy.
					</p>
				</div>
			</section>
		</main>
	);
}
