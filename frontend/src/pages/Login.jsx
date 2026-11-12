
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    
  try {
  const result = await login(form);

  const role = result.data?.user?.role;

  const defaultDestination =
    role === "admin" || role === "staff"
      ? "/management"
      : "/account";

  const requestedPath = location.state?.from?.pathname;

  const destination =
    requestedPath &&
    (
      (requestedPath.startsWith("/management") &&
        ["admin", "staff"].includes(role)) ||
      (!requestedPath.startsWith("/management") &&
        !["admin", "staff"].includes(role))
    )
      ? `${requestedPath}${location.state.from.search || ""}`
      : defaultDestination;

  navigate(destination, { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-maison-ivory flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        {/* Page heading */}
        <div className="text-center mb-10">
          <p className="text-maison-bronze text-xs uppercase tracking-[0.35em] mb-4">
            Your MAISON
          </p>

          <h1 className="font-display text-4xl md:text-5xl text-maison-charcoal">
            Welcome Back
          </h1>

          <p className="text-maison-charcoal/60 text-sm mt-4">
            Sign in to continue your MAISON experience.
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-maison-charcoal/10 p-7 sm:p-10 space-y-6"
        >
          {error && (
            <div
              role="alert"
              className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm text-maison-charcoal mb-2"
            >
              Email Address
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-maison-charcoal/20 bg-white px-4 py-3.5 text-sm text-maison-charcoal outline-none transition-colors focus:border-maison-bronze"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm text-maison-charcoal mb-2"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full border border-maison-charcoal/20 bg-white px-4 py-3.5 pr-20 text-sm text-maison-charcoal outline-none transition-colors focus:border-maison-bronze"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-maison-charcoal/60 hover:text-maison-bronze cursor-pointer"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-maison-charcoal text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-maison-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "SIGNING IN..." : "SIGN IN"}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-maison-charcoal/60">
            New to MAISON?{" "}
            <Link
              to="/register"
              className="text-maison-charcoal underline underline-offset-4 hover:text-maison-bronze transition-colors"
            >
              Create an account
            </Link>
          </p>
        </form>

        {/* Bottom message */}
        <p className="text-center text-xs text-maison-charcoal/45 mt-8 tracking-wide">
          EVERYDAY ELEGANCE, REDEFINED.
        </p>
      </div>
    </main>
  );
}
