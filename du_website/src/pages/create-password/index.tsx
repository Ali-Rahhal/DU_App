import { useEffect, useState } from "react";

import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";

import { createPassword } from "@/utils/apiCalls";
import { useCompanyStore } from "@/store/zustand";
import { Companies, CompanyId } from "@/utils/config_companies";

export default function CreatePasswordPage() {
  const router = useRouter();
  const t = useTranslations();
  const { companyId, setCompany } = useCompanyStore();
  const company = Companies[companyId];

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const companyid =
      typeof router.query.companyId === "string"
        ? router.query.companyId
        : process.env.NEXT_PUBLIC_DEFAULT_COMPANY;

    setCompany(companyid as CompanyId);
    document.cookie = `companyIdCustomerPortalApp=${companyid}; path=/; max-age=31536000; SameSite=Lax`;
  }, [router.isReady, router.query.companyId]);

  async function handleCreatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!router.isReady) return;

    const token =
      typeof router.query.token === "string" ? router.query.token : "";

    // -----------------------------
    // Validation
    // -----------------------------

    if (!token) {
      toast.error(t("create_password.errors.invalid_link"));
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword) {
      toast.error(t("create_password.errors.password_required"));
      return;
    }

    if (trimmedPassword.length < 8) {
      toast.error(t("create_password.errors.password_min_length"));
      return;
    }

    if (!trimmedConfirmPassword) {
      toast.error(t("create_password.errors.confirm_password_required"));
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error(t("create_password.errors.passwords_do_not_match"));
      return;
    }

    // -----------------------------
    // API call
    // -----------------------------

    setLoading(true);

    try {
      await createPassword({
        token,
        password: trimmedPassword,
      });

      toast.success(t("create_password.success"));

      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          t("create_password.errors.creation_failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      {/* Language */}
      <div className="register-language">
        <ChangeLangDropdown />
      </div>

      <div className="register-card create-password-card">
        {/* Header */}
        <div className="register-header">
          <button
            type="button"
            className="register-back-btn"
            disabled={loading}
            onClick={() => router.push("/login")}
          >
            <i className="ti ti-arrow-left"></i>
          </button>

          <div className="register-header-content">
            <img
              src={company?.logo}
              alt={company?.name}
              className="register-company-logo"
            />
            <h1>{t("create_password.title")}</h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreatePassword}>
          {/* Password */}
          <div className="mb-3">
            <input
              type="password"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("create_password.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <input
              type="password"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("create_password.confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {/* Create Password */}
          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t("create_password.loading")}
              </>
            ) : (
              t("create_password.create")
            )}
          </button>
        </form>

        {/* Login */}
        <div className="login-section">
          <span className="login-text">
            {t("create_password.already_have_account")}
          </span>

          <button
            type="button"
            className="login-link-btn"
            disabled={loading}
            onClick={() => router.push("/login")}
          >
            {t("login_register.login")}
          </button>
        </div>
      </div>
    </div>
  );
}
