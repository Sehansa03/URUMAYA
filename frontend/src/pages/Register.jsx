
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await register(form);
      setSuccess("Account created! You can now sign in.");
      setForm({ fullName: "", email: "", password: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-5 py-16 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.35em] text-[#A68A6D] mb-4">
            MAISON
          </p>

          <h1 className="text-4xl font-serif text-[#252421]">
            Join MAISON
          </h1>

          <p className="text-sm text-[#77736E] mt-3">
            Create an account for a more personal shopping experience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E8E3DB] p-8 sm:p-10 space-y-6"
        >
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-700">
              {success}{" "}
              <a href="/login" className="underline">
                Sign in
              </a>
            </p>
          )}

          <div>
            <label
              htmlFor="register-name"
              className="block text-sm mb-2"
            >
              Full Name
            </label>

            <input
              id="register-name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              className="w-full border border-[#DED6CA] px-4 py-3 outline-none focus:border-[#A68A6D]"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm mb-2"
            >
              Email Address
            </label>

            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border border-[#DED6CA] px-4 py-3 outline-none focus:border-[#A68A6D]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm mb-2"
            >
              Password
            </label>

            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border border-[#DED6CA] px-4 py-3 outline-none focus:border-[#A68A6D]"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#252421] text-white py-3.5 text-sm tracking-[0.15em] hover:bg-[#A68A6D] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>

          <p className="text-center text-sm text-[#77736E]">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#252421] underline underline-offset-4"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
