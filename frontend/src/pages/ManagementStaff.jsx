import { useEffect, useRef, useState } from "react";

import {
  Users,
  UserCheck,
  UserMinus,
  UserPlus,
  Search,
  RefreshCw,
  Pencil,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { staffAPI } from "../api/staff";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
};

const inputClass =
  "w-full rounded-xl border border-[#103D46]/15 bg-[#FFFDFA] px-4 py-3 text-sm text-[#29251F] outline-none transition focus:border-[#103D46]";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#103D46] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#071F22] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#103D46]/15 bg-white/70 px-4 py-3 text-sm font-medium text-[#103D46] transition hover:bg-white disabled:opacity-50";

const actionButton =
  "inline-flex items-center justify-center rounded-lg border border-[#103D46]/10 p-2.5 text-[#103D46] transition hover:bg-[#103D46] hover:text-white disabled:opacity-40";

const getInitials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "S";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Colombo",
      })
    : "—";

// ==========================================
// STATISTIC CARD
// ==========================================

function StatisticCard({
  icon: Icon,
  label,
  value,
  description,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#29251F]/60">
          {label}
        </p>

        <Icon
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-[#B95035]"
        />
      </div>

      <p className="font-number mt-5 text-3xl text-[#103D46]">
        {loading ? "..." : value ?? "—"}
      </p>

      <p className="mt-2 text-[11px] text-[#29251F]/50">
        {description}
      </p>
    </div>
  );
}

// ==========================================
// STAFF ACCOUNT MODAL
// ==========================================

function StaffModal({
  modal,
  onClose,
  onSuccess,
}) {
  const { type, staff } = modal;

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    fullName: staff?.fullName || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
  });

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dialogRef = useRef(null);
  const savingRef = useRef(false);

  const isCreate = type === "create";
  const isEdit = type === "edit";
  const isPassword = type === "password";
  const isStatus = type === "status";

  const nextStatus = !staff?.isActive;

  const title = isCreate
    ? "Add Staff Member"
    : isEdit
      ? "Edit Staff Details"
      : isPassword
        ? "Reset Password"
        : nextStatus
          ? "Activate Account"
          : "Deactivate Account";

  // Keyboard navigation and modal focus
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !savingRef.current) {
        onClose();
      }

      if (event.key === "Tab") {
        const elements =
          dialogRef.current?.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
          );

        if (!elements?.length) {
          event.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialogRef.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    setError("");

    if (isCreate || isEdit) {
      if (form.fullName.trim().length < 2) {
        setError("Please enter a valid full name.");
        return;
      }

      if (!form.email.trim()) {
        setError("Please enter an email address.");
        return;
      }
    }

    if (isCreate || isPassword) {
      if (form.password.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (
        new TextEncoder().encode(form.password).length >
        72
      ) {
        setError("Password must not exceed 72 bytes.");
        return;
      }

      if (form.password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    savingRef.current = true;
    setSaving(true);

    try {
      let response;

      const personalDetails = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };

      if (isCreate) {
        response = await staffAPI.createStaff({
          ...personalDetails,
          password: form.password,
        });
      } else if (isEdit) {
        response = await staffAPI.updateStaff(
          staff._id,
          personalDetails
        );
      } else if (isPassword) {
        response = await staffAPI.resetStaffPassword(
          staff._id,
          form.password
        );
      } else if (isStatus) {
        response = await staffAPI.updateStaffStatus(
          staff._id,
          nextStatus
        );
      }

      setForm({ ...EMPTY_FORM });
      setConfirmPassword("");

      onSuccess(
        response?.data?.message ||
          "Staff account updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete this action. Please try again."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071F22]/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !savingRef.current
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-modal-title"
        tabIndex={-1}
        className="management-scroll max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#103D46]/10 bg-[#FFFDFA] shadow-2xl outline-none"
      >
        {/* MODAL HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-[#103D46]/10 p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B95035]">
              Team & Access Management
            </p>

            <h3
              id="staff-modal-title"
              className="mt-2 font-display text-3xl text-[#103D46]"
            >
              {title}
            </h3>

            {staff && (
              <p className="mt-2 break-all text-xs text-[#29251F]/55">
                {staff.fullName} · {staff.email}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-40"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset
            disabled={saving}
            className="space-y-5 p-6"
          >
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="shrink-0"
                />
                {error}
              </div>
            )}

            {/* PERSONAL DETAILS */}

            {(isCreate || isEdit) && (
              <>
                <div>
                  <label
                    htmlFor="staff-name"
                    className="mb-2 block text-xs font-medium text-[#103D46]"
                  >
                    Full Name *
                  </label>

                  <input
                    id="staff-name"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    minLength={2}
                    maxLength={100}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="staff-email"
                    className="mb-2 block text-xs font-medium text-[#103D46]"
                  >
                    Email Address *
                  </label>

                  <input
                    id="staff-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="staff@example.com"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="staff-phone"
                    className="mb-2 block text-xs font-medium text-[#103D46]"
                  >
                    Phone Number
                  </label>

                  <input
                    id="staff-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    maxLength={30}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* PASSWORD FIELDS */}

            {(isCreate || isPassword) && (
              <>
                <div>
                  <label
                    htmlFor="staff-password"
                    className="mb-2 block text-xs font-medium text-[#103D46]"
                  >
                    {isCreate
                      ? "Initial Password *"
                      : "New Password *"}
                  </label>

                  <div className="relative">
                    <input
                      id="staff-password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      maxLength={72}
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={showPassword}
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#103D46]/60"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="staff-confirm-password"
                    className="mb-2 block text-xs font-medium text-[#103D46]"
                  >
                    Confirm Password *
                  </label>

                  <input
                    id="staff-confirm-password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    required
                    maxLength={72}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* ACCOUNT INFORMATION */}

            {isCreate && (
              <div className="flex items-start gap-3 rounded-xl bg-[#103D46]/5 p-4">
                <ShieldCheck
                  size={20}
                  className="shrink-0 text-[#103D46]"
                />

                <div>
                  <p className="text-xs font-semibold text-[#103D46]">
                    Staff Access
                  </p>

                  <p className="mt-1 text-xs leading-6 text-[#29251F]/65">
                    This account will be assigned the Staff
                    role with standard staff permissions.
                    Administrator privileges cannot be
                    assigned here.
                  </p>
                </div>
              </div>
            )}

            {isPassword && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
                Resetting this password will invalidate
                existing login sessions. The staff member
                must sign in again using the new password.
                Share the new password securely.
              </div>
            )}

            {/* STATUS CONFIRMATION */}

            {isStatus && (
              <div
                className={`rounded-xl border p-5 text-sm leading-7 ${
                  nextStatus
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {nextStatus
                  ? "This staff member will regain access to the management workspace and can sign in again."
                  : "This staff member will lose access to the management workspace. Existing login sessions will be invalidated, but the account record will be retained."}
              </div>
            )}
          </fieldset>

          {/* MODAL FOOTER */}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#103D46]/10 p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={secondaryButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={
                isStatus && !nextStatus
                  ? "inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
                  : primaryButton
              }
            >
              {saving && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Processing..."
                : isCreate
                  ? "Create Account"
                  : isEdit
                    ? "Save Changes"
                    : isPassword
                      ? "Reset Password"
                      : nextStatus
                        ? "Activate Account"
                        : "Deactivate Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// STAFF MANAGEMENT PAGE
// ==========================================

export default function ManagementStaff() {
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user?.role === "admin";

  const [staff, setStaff] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalResults: 0,
    totalPages: 0,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load staff list and statistics
  useEffect(() => {
    if (authLoading || !isAdmin) return;

    let cancelled = false;

    const loadStaff = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await staffAPI.getStaff({
          page,
          limit: PAGE_SIZE,
          search,
          status,
        });

        if (cancelled) return;

        const result = response.data.data;

        setStatistics(result.statistics);

        if (
          page > 1 &&
          page > result.pagination.totalPages
        ) {
          setPage(
            Math.max(1, result.pagination.totalPages)
          );

          return;
        }

        setStaff(result.staff || []);
        setPagination(result.pagination);
      } catch (err) {
        if (!cancelled) {
          setStaff([]);
          setStatistics(null);

          setError(
            err.response?.data?.message ||
              "Unable to load staff accounts."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStaff();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAdmin,
    user?.id,
    page,
    search,
    status,
    refreshKey,
  ]);

  // Automatically dismiss success messages
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [success]);

  const handleRefresh = () => {
    setRefreshKey((previous) => previous + 1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const openModal = (type, selectedStaff = null) => {
    setSuccess("");
    setModal({
      type,
      staff: selectedStaff,
    });
  };

  const handleSuccess = (message) => {
    setModal(null);
    setSuccess(message);
    handleRefresh();
  };

  const cards = [
    {
      label: "Total Staff",
      icon: Users,
      value: statistics?.totalStaff,
      description: "Registered staff accounts",
    },
    {
      label: "Active Staff",
      icon: UserCheck,
      value: statistics?.activeStaff,
      description: "Staff with workspace access",
    },
    {
      label: "Inactive Staff",
      icon: UserMinus,
      value: statistics?.inactiveStaff,
      description: "Deactivated staff accounts",
    },
  ];

  // Authentication guard
  if (authLoading) {
    return (
      <div className="py-16 text-center text-sm text-[#103D46]">
        Loading workspace...
      </div>
    );
  }

  // Administrator-only access
  if (!isAdmin) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        You do not have permission to access Staff
        Management.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE INTRODUCTION */}

      <section className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B95035]">
            Team & Access Management
          </p>

          <h2 className="mt-2 font-display text-4xl text-[#103D46]">
            Our Team
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#29251F]/60">
            Manage staff accounts, maintain team details
            and control access to URUMAYA's management
            workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className={secondaryButton}
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => openModal("create")}
            className={primaryButton}
          >
            <UserPlus size={18} />
            Add Staff
          </button>
        </div>
      </section>

      {/* SUCCESS MESSAGE */}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2
            size={20}
            className="shrink-0"
          />

          <span className="flex-1">{success}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccess("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STAFF STATISTICS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatisticCard
            key={card.label}
            {...card}
            loading={loading}
          />
        ))}
      </section>

      {/* STAFF DIRECTORY */}

      <section className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/85 shadow-sm">
        <div className="border-b border-[#103D46]/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl text-[#103D46]">
                Staff Directory
              </h3>

              <p className="mt-2 text-xs text-[#29251F]/55">
                {loading
                  ? "Loading staff..."
                  : error
                    ? "Staff directory unavailable"
                    : `${pagination.totalResults} staff members found`}
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#103D46]/5 px-4 py-2 text-xs font-medium text-[#103D46]">
              <ShieldCheck size={15} />
              Admin Only
            </span>
          </div>

          {/* SEARCH AND FILTERS */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#103D46]/45"
              />

              <input
                type="search"
                aria-label="Search staff"
                placeholder="Search by name or email..."
                value={searchInput}
                maxLength={100}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                className="w-full rounded-xl border border-[#103D46]/15 bg-[#FFFDFA] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#29251F]/40 focus:border-[#103D46]"
              />
            </div>

            <select
              aria-label="Filter staff status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#103D46]/15 bg-[#FFFDFA] px-4 py-3 text-sm text-[#103D46] outline-none focus:border-[#103D46]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {(searchInput || status) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl px-4 py-3 text-xs font-medium text-[#B95035] transition hover:bg-[#B95035]/5"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* LOADING, ERROR AND EMPTY STATES */}

        {loading ? (
          <div
            role="status"
            className="flex flex-col items-center gap-4 py-20 text-[#103D46]"
          >
            <LoaderCircle
              size={28}
              className="animate-spin"
            />

            <p className="text-sm">
              Loading staff accounts...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="p-8 text-center"
          >
            <AlertCircle
              size={30}
              className="mx-auto text-red-600"
            />

            <p className="mt-4 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className={`${primaryButton} mt-5`}
            >
              Try Again
            </button>
          </div>
        ) : staff.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#103D46]/5">
              <Users
                size={28}
                className="text-[#103D46]/45"
              />
            </div>

            <h3 className="mt-5 font-display text-2xl text-[#103D46]">
              No Staff Found
            </h3>

            <p className="mt-2 text-sm text-[#29251F]/55">
              {search || status
                ? "Try changing your search or filters."
                : "Create a staff account to get started."}
            </p>

            {!search && !status && (
              <button
                type="button"
                onClick={() => openModal("create")}
                className={`${primaryButton} mt-5`}
              >
                <UserPlus size={17} />
                Add Staff
              </button>
            )}
          </div>
        ) : (
          <>
            {/* STAFF TABLE */}

            <div className="management-scroll overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead className="border-b border-[#103D46]/10 bg-[#F6EEDF]/60">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#103D46]/70">
                    <th className="px-6 py-4">
                      Staff Member
                    </th>

                    <th className="px-4 py-4">
                      Phone
                    </th>

                    <th className="px-4 py-4">
                      Joined
                    </th>

                    <th className="px-4 py-4">
                      Role
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#103D46]/10">
                  {staff.map((member) => (
                    <tr
                      key={member._id}
                      className="transition hover:bg-[#F6EEDF]/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#103D46]/10 text-sm font-semibold text-[#103D46]">
                            {getInitials(member.fullName)}
                          </div>

                          <div className="min-w-0">
                            <p
                              title={member.fullName}
                              className="max-w-[220px] truncate text-sm font-semibold text-[#103D46]"
                            >
                              {member.fullName}
                            </p>

                            <p
                              title={member.email}
                              className="mt-1 max-w-[220px] truncate text-xs text-[#29251F]/50"
                            >
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-5 text-xs text-[#29251F]/70">
                        {member.phone || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-5 text-xs text-[#29251F]/70">
                        {formatDate(member.createdAt)}
                      </td>

                      <td className="px-4 py-5">
                        <span className="rounded-full bg-[#103D46]/5 px-3 py-1.5 text-[11px] font-medium capitalize text-[#103D46]">
                          {member.role}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-medium ${
                            member.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {member.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* ACCOUNT ACTIONS */}

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Edit staff details"
                            aria-label={`Edit ${member.fullName}`}
                            onClick={() =>
                              openModal("edit", member)
                            }
                            className={actionButton}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Reset password"
                            aria-label={`Reset password for ${member.fullName}`}
                            onClick={() =>
                              openModal("password", member)
                            }
                            className={actionButton}
                          >
                            <KeyRound size={16} />
                          </button>

                          <button
                            type="button"
                            title={
                              member.isActive
                                ? "Deactivate account"
                                : "Activate account"
                            }
                            aria-label={`${
                              member.isActive
                                ? "Deactivate"
                                : "Activate"
                            } ${member.fullName}`}
                            onClick={() =>
                              openModal("status", member)
                            }
                            className={`inline-flex items-center justify-center rounded-lg border p-2.5 transition ${
                              member.isActive
                                ? "border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-700 hover:text-white"
                            }`}
                          >
                            {member.isActive ? (
                              <UserMinus size={17} />
                            ) : (
                              <UserCheck size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#103D46]/10 px-6 py-5">
              <p className="text-xs text-[#29251F]/60">
                Showing {(page - 1) * PAGE_SIZE + 1}
                {" – "}
                {Math.min(
                  page * PAGE_SIZE,
                  pagination.totalResults
                )}
                {" of "}
                {pagination.totalResults} staff members
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((previous) => previous - 1)
                  }
                  className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-xs font-medium text-[#103D46]">
                  Page {page} of{" "}
                  {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={
                    page >= pagination.totalPages
                  }
                  onClick={() =>
                    setPage((previous) => previous + 1)
                  }
                  className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* STAFF MANAGEMENT MODAL */}

      {modal && (
        <StaffModal
          key={`${modal.type}-${modal.staff?._id || "new"}`}
          modal={modal}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}