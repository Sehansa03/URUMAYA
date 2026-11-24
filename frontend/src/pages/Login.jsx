import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { CheckCircle2, AlertCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import AuthLayout, {
  AuthInput,
  AuthButton,
} from "../components/AuthLayout";

export default function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const successMessage = location.state?.success || "";

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ==========================================
  // HANDLE LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const result = await login({
        email: form.email.trim(),
        password: form.password,
      });

      const role = result.data?.user?.role;

      const isManagementUser = ["admin", "staff"].includes(role);

      const defaultDestination = isManagementUser
        ? "/management"
        : "/account";

      const requestedPath =
        location.state?.from?.pathname;

      const destination =
        requestedPath &&
        (
          (requestedPath.startsWith("/management") &&
            isManagementUser) ||
          (!requestedPath.startsWith("/management") &&
            !isManagementUser)
        )
          ? `${requestedPath}${location.state.from.search || ""}`
          : defaultDestination;

      navigate(destination, {
        replace: true,
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOGIN UI
  // ==========================================

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your URUMAYA journey."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* Registration success message */}
        {successMessage && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800"
          >
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* Email */}
        <AuthInput
          id="login-email"
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          disabled={submitting}
          required
        />

        {/* Password */}
        <AuthInput
          id="login-password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          disabled={submitting}
          required
        />

        {/* Submit */}
        <AuthButton
          submitting={submitting}
          loadingText="Signing in..."
        >
          Sign in
        </AuthButton>

        {/* Registration link */}
        <p className="pt-1 text-center text-sm leading-relaxed text-[#81796D]">
          New to URUMAYA?{" "}

          <Link
            to="/register"
            state={{
              from: location.state?.from,
              email: form.email,
            }}
            className="font-semibold text-urumaya-terracotta transition-colors hover:text-urumaya-teal"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}