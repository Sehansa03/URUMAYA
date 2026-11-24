import { useState } from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { AlertCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import AuthLayout, {
  AuthInput,
  AuthButton,
} from "../components/AuthLayout";

export default function Register() {
  const { register } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    fullName: "",
    email: location.state?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
  // HANDLE REGISTRATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError("");

    // Validate full name
    if (form.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    // Validate password length
    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    // Validate password confirmation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      // Send registration details to backend
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // Automatically open Login popup
      navigate("/login", {
        replace: true,
        state: {
          email: form.email.trim(),
          success:
            "Your account has been created successfully. Please sign in to continue.",
          from: location.state?.from,
        },
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // REGISTRATION UI
  // ==========================================

  return (
    <AuthLayout
      compact
      title="Create an account"
      subtitle="Become part of our heritage."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="
              flex items-start gap-2
              rounded-xl
              border border-red-200
              bg-red-50
              px-3 py-2.5
              text-xs text-red-700
            "
          >
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* Full name */}
        <AuthInput
          compact
          id="register-name"
          label="Full name"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={form.fullName}
          onChange={handleChange}
          minLength={2}
          maxLength={100}
          disabled={submitting}
          required
        />

        {/* Email address */}
        <AuthInput
          compact
          id="register-email"
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
        <div>
          <AuthInput
            compact
            id="register-password"
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            maxLength={128}
            disabled={submitting}
            aria-describedby="password-hint"
            required
          />

          <p
            id="password-hint"
            className="mt-1.5 text-[11px] text-[#81796D]"
          >
            Use at least 8 characters.
          </p>
        </div>

        {/* Confirm password */}
        <AuthInput
          compact
          id="register-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange}
          maxLength={128}
          disabled={submitting}
          required
        />

        {/* Submit button */}
        <div className="pt-1">
          <AuthButton
            compact
            submitting={submitting}
            loadingText="Creating account..."
          >
            Create account
          </AuthButton>
        </div>

        {/* Login link */}
        <p className="pt-1 text-center text-xs leading-relaxed text-[#81796D]">
          Already have an account?{" "}

          <Link
            to="/login"
            state={{
              from: location.state?.from,
              email: form.email,
            }}
            className="
              font-semibold
              text-urumaya-terracotta
              transition-colors
              hover:text-urumaya-teal
            "
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}