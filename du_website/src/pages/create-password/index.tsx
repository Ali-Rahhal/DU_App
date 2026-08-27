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

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const companyid =
      typeof router.query.companyId === "string"
        ? router.query.companyId
        : process.env.NEXT_PUBLIC_DEFAULT_COMPANY;

    setCompany(companyid as CompanyId);

    document.cookie = `companyIdCustomerPortalApp=${companyid}; path=/; max-age=31536000; SameSite=Lax`;
  }, [router.isReady, router.query.companyId, setCompany]);

  async function handleCreatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!router.isReady) return;

    const token =
      typeof router.query.token === "string" ? router.query.token : "";

    // --------------------------------------------------
    // Token validation
    // --------------------------------------------------

    if (!token) {
      toast.error(t("create_password.errors.invalid_link"));
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Reset field errors
    setPasswordError("");
    setConfirmPasswordError("");

    // --------------------------------------------------
    // Password validation
    // --------------------------------------------------

    if (!trimmedPassword) {
      setPasswordError(t("create_password.errors.password_required"));
      return;
    }

    if (trimmedPassword.length < 8) {
      setPasswordError(t("create_password.errors.password_min_length"));
      return;
    }

    if (trimmedPassword.length > 128) {
      setPasswordError(t("create_password.errors.password_max_length"));
      return;
    }

    if (!/[A-Z]/.test(trimmedPassword)) {
      setPasswordError(t("create_password.errors.password_uppercase_required"));
      return;
    }

    if (!/[a-z]/.test(trimmedPassword)) {
      setPasswordError(t("create_password.errors.password_lowercase_required"));
      return;
    }

    if (!/\d/.test(trimmedPassword)) {
      setPasswordError(t("create_password.errors.password_number_required"));
      return;
    }

    // --------------------------------------------------
    // Confirm password validation
    // --------------------------------------------------

    if (!trimmedConfirmPassword) {
      setConfirmPasswordError(
        t("create_password.errors.confirm_password_required"),
      );
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setConfirmPasswordError(
        t("create_password.errors.passwords_do_not_match"),
      );
      return;
    }

    // --------------------------------------------------
    // API call
    // --------------------------------------------------

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
    <div className="create-password-page">
      {/* Language */}
      <div className="create-password-language">
        <ChangeLangDropdown />
      </div>

      <div className="create-password-card">
        {/* Header */}
        <div className="create-password-header">
          <button
            type="button"
            className="create-password-back-btn"
            disabled={loading}
            onClick={() => router.push("/login")}
          >
            <i className="ti ti-arrow-left" />
          </button>

          <div className="create-password-header-content">
            <img
              src={company?.logo}
              alt={company?.name}
              className="create-password-company-logo mb-5"
            />

            <h1>{t("create_password.title")}</h1>

            <p className="create-password-subtitle">
              {t("create_password.subtitle")}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreatePassword}>
          {/* Password */}
          <div className="create-password-field">
            <label className="create-password-label">
              {t("create_password.password")} <span>*</span>
            </label>

            <input
              type="password"
              disabled={loading}
              className={`form-control ${
                passwordError ? "create-password-input-error" : ""
              }`}
              placeholder={t("create_password.password_placeholder")}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                if (passwordError) {
                  setPasswordError("");
                }
              }}
              autoComplete="new-password"
            />

            {passwordError ? (
              <div className="create-password-error">
                <i className="ti ti-alert-circle" />
                <span>{passwordError}</span>
              </div>
            ) : (
              <small className="create-password-field-hint">
                {t("create_password.password_hint")}
              </small>
            )}
          </div>

          {/* Confirm Password */}
          <div className="create-password-field">
            <label className="create-password-label">
              {t("create_password.confirm_password")} <span>*</span>
            </label>

            <input
              type="password"
              disabled={loading}
              className={`form-control ${
                confirmPasswordError ? "create-password-input-error" : ""
              }`}
              placeholder={t("create_password.confirm_password_placeholder")}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);

                if (confirmPasswordError) {
                  setConfirmPasswordError("");
                }
              }}
              autoComplete="new-password"
            />

            {confirmPasswordError && (
              <div className="create-password-error">
                <i className="ti ti-alert-circle" />
                <span>{confirmPasswordError}</span>
              </div>
            )}
          </div>

          {/* Create Password */}
          <button
            type="submit"
            className="create-password-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>{t("create_password.loading")}</span>
              </>
            ) : (
              <>
                <span>{t("create_password.create")}</span>
                <i className="ti ti-arrow-right" />
              </>
            )}
          </button>
        </form>

        {/* Login */}
        <div className="create-password-login-section">
          <span className="create-password-login-text">
            {t("create_password.already_have_account")}
          </span>

          <button
            type="button"
            className="create-password-login-link-btn"
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
