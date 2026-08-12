import { useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import { useCompanyStore } from "@/store/zustand";
import { Companies } from "@/utils/config_companies";
import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";

import { register } from "@/utils/apiCalls";

export default function RegisterPage() {
  const [clientCode, setClientCode] = useState("");
  const [mohNumber, setMohNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const { companyId } = useCompanyStore();

  const router = useRouter();
  const t = useTranslations();

  const company = Companies[companyId];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // -----------------------------
    // Validation
    // -----------------------------

    const trimmedClientCode = clientCode.trim();
    const trimmedMohNumber = mohNumber.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedEmail = email.trim();
    const trimmedDescription = description.trim();

    if (!trimmedClientCode) {
      toast.error(t("login_register.errors.client_code_required"));
      return;
    }

    if (!trimmedMohNumber) {
      toast.error(t("login_register.errors.moh_number_required"));
      return;
    }

    if (!trimmedDescription) {
      toast.error(t("login_register.errors.description_required"));
      return;
    }

    if (!trimmedPhoneNumber) {
      toast.error(t("login_register.errors.phone_required"));
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;

    if (!phoneRegex.test(trimmedPhoneNumber)) {
      toast.error(t("login_register.errors.phone_invalid"));
      return;
    }

    if (!trimmedEmail) {
      toast.error(t("login_register.errors.email_required"));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      toast.error(t("login_register.errors.email_invalid"));
      return;
    }

    if (!password) {
      toast.error(t("login_register.errors.password_required"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("login_register.errors.password_min_length"));
      return;
    }

    if (!companyId || !company) {
      toast.error(t("login_register.errors.company_required"));
      return;
    }

    // -----------------------------
    // API call
    // -----------------------------

    setLoading(true);

    try {
      await register({
        client_code: trimmedClientCode,
        moh_number: trimmedMohNumber,
        password,
        phone_number: trimmedPhoneNumber,
        email: trimmedEmail,
        description: trimmedDescription,
      });

      toast.success(t("login_register.registration_success"), {
        position: "bottom-center",
      });

      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          t("login_register.errors.registration_failed"),
        {
          position: "top-right",
        },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Language */}
        <div className="register-language">
          <ChangeLangDropdown />
        </div>

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

          <h1>{t("login_register.register")}</h1>

          <img
            src={company?.logo}
            alt={company?.name}
            className="register-company-logo"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>
          {/* Client Code */}
          <div className="mb-3">
            <input
              type="text"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("login_register.user_code")}
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
            />
          </div>

          {/* MOH Number */}
          <div className="mb-3">
            <input
              type="text"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("login_register.moh_number")}
              value={mohNumber}
              onChange={(e) => setMohNumber(e.target.value)}
            />
          </div>

          {/* Name */}
          <div className="mb-3">
            <input
              type="text"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("login_register.name")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <input
              type="tel"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("login_register.phone_number")}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <input
              type="email"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("login_register.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <input
              type="password"
              required
              disabled={loading}
              className="form-control"
              placeholder={t("login_register.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Register */}
          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t("login_register.loading")}
              </>
            ) : (
              t("login_register.register")
            )}
          </button>
        </form>

        {/* Login */}
        <div className="login-section">
          <span className="login-text">
            {t("login_register.already_have_account")}
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
