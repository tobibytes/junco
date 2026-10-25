import { Navigate, useLocation, useNavigate } from "react-router";
import { ForgotPasswordPage, LogInPage } from "@junco/blocks/app";
import { app } from "../config";
import { useAuth } from "../lib/auth";

/** Admins are invited, so there's no sign-up page. */
export function LogIn() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";
  if (user) return <Navigate to={from} replace />;
  return (
    <LogInPage
      appName={app.name}
      signUpHref={null}
      forgotPasswordHref="/forgot-password"
      onSubmit={async ({ email, password }) => {
        await signIn(email, password);
        navigate(from, { replace: true });
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
