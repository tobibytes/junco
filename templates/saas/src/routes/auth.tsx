import { Navigate, useLocation, useNavigate } from "react-router";
import { ForgotPasswordPage, LogInPage, OnboardingPage, SignUpPage } from "@junco/blocks/app";
import { app } from "../config";
import { useAuth } from "../lib/auth";

export function LogIn() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/app";
  if (user) return <Navigate to={from} replace />;
  return (
    <LogInPage
      appName={app.name}
      signUpHref="/signup"
      forgotPasswordHref="/forgot-password"
      onSubmit={async ({ email, password }) => {
        await signIn(email, password);
        navigate(from, { replace: true });
      }}
    />
  );
}

export function SignUp() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  if (user) return <Navigate to="/app" replace />;
  return (
    <SignUpPage
      appName={app.name}
      logInHref="/login"
      termsHref="/terms"
      privacyHref="/privacy"
      onSubmit={async ({ name, email, password }) => {
        await signUp(name, email, password);
        navigate("/onboarding", { replace: true });
      }}
    />
  );
}

export function ForgotPassword() {
  return (
    <ForgotPasswordPage
      appName={app.name}
      logInHref="/login"
      onSubmit={async () => {
        // Send the reset email from your backend here. The page then shows "Check your email".
      }}
    />
  );
}

/** Shown right after sign-up. */
export function Onboarding() {
  return (
    <OnboardingPage
      appName={app.name}
      doneHref="/app"
      onComplete={async () => {
        // Create the workspace and send the invites from your backend here.
      }}
    />
  );
}
