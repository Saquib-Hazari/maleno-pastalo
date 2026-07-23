import { AuthenticateWithRedirectCallback } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sso-callback")({
	component: SsoCallback,
});

function SsoCallback() {
	return (
		<main className="grid min-h-screen place-items-center bg-[#fff8e9] px-5">
			<div className="text-center">
				<p className="font-serif text-2xl text-[#64391f]">
					Completing your sign-in…
				</p>
				<AuthenticateWithRedirectCallback
					signInForceRedirectUrl="/dashboard"
					signUpForceRedirectUrl="/dashboard"
				/>
			</div>
		</main>
	);
}
