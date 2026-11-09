
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user } = useAuth();

  return (
    <main className="min-h-[70vh] bg-maison-ivory px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-maison-bronze">
          Your MAISON
        </p>

        <h1 className="font-display text-5xl mt-4 mb-10">
          My Account
        </h1>

        <div className="bg-white border border-maison-charcoal/10 p-8">
          <p className="text-sm text-maison-charcoal/60 mb-2">
            Welcome back
          </p>

          <h2 className="font-display text-3xl">
            {user?.fullName}
          </h2>

          <p className="text-sm text-maison-charcoal/60 mt-3">
            {user?.email}
          </p>
        </div>
      </div>
    </main>
  );
}
