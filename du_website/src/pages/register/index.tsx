import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import { useCompanyStore } from "@/store/zustand";
import { Companies } from "@/utils/config_companies";
import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";

import { sendRegistrationCode, verifyRegistrationCode } from "@/utils/apiCalls";

export default function RegisterPage() {
  const [mohNumber, setMohNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationTimeLeft, setVerificationTimeLeft] = useState(600);
  const [resendingCode, setResendingCode] = useState(false);

  const { companyId } = useCompanyStore();

  const router = useRouter();
  const t = useTranslations();

  const company = Companies[companyId];

  useEffect(() => {
    if (!showVerificationModal || verificationTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setVerificationTimeLeft((time) => Math.max(0, time - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [showVerificationModal, verificationTimeLeft]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // -----------------------------
    // Validation
    // -----------------------------

    const trimmedMohNumber = mohNumber.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedEmail = email.trim();
    const trimmedDescription = description.trim();

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

    if (!companyId || !company) {
      toast.error(t("login_register.errors.company_required"));
      return;
    }

    // -----------------------------
    // API call
    // -----------------------------

    setLoading(true);

    try {
      await sendRegistrationCode({
        moh_number: trimmedMohNumber,
        phone_number: trimmedPhoneNumber,
        email: trimmedEmail,
        description: trimmedDescription,
      });

      setShowVerificationModal(true);
      setVerificationTimeLeft(600);

      toast.success(t("login_register.verification_code_sent"));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          t("login_register.errors.registration_failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  const handleResendCode = async () => {
    try {
      setResendingCode(true);

      await sendRegistrationCode({
        moh_number: mohNumber.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim(),
        description: description.trim(),
      });

      setVerificationCode("");
      setVerificationTimeLeft(600);

      toast.success(t("login_register.code_resent"));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("login_register.errors.resend_code_failed"),
      );
    } finally {
      setResendingCode(false);
    }
  };

  async function handleVerifyCode() {
    if (!verificationCode.trim()) {
      toast.error(t("login_register.errors.verification_code_required"));
      return;
    }

    setVerificationLoading(true);

    try {
      await verifyRegistrationCode({
        moh_number: mohNumber.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim(),
        description: description.trim(),
        code: verificationCode.trim(),
      });

      setShowVerificationModal(false);

      toast.success(t("login_register.registration_success"));

      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          t("login_register.errors.verification_failed"),
      );
    } finally {
      setVerificationLoading(false);
    }
  }

  return (
    <div className="register-page">
      {/* Language */}
      <div className="register-language">
        <ChangeLangDropdown />
      </div>

      <div className="register-card">
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
            <h1>{t("login_register.register")}</h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>
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
      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="verification-modal-overlay">
          <div className="verification-modal">
            <h2>{t("login_register.verify_email")}</h2>

            <p>{t("login_register.verification_code_description")}</p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="form-control verification-code-input"
              placeholder={t("login_register.verification_code")}
              value={verificationCode}
              disabled={verificationLoading}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
            />

            {/* Timer */}
            <p className="verification-timer">
              {verificationTimeLeft > 0
                ? `${t("login_register.code_expires_in")} ${Math.floor(
                    verificationTimeLeft / 60,
                  )}:${String(verificationTimeLeft % 60).padStart(2, "0")}`
                : t("login_register.code_expired")}
            </p>

            {/* Resend */}
            <button
              type="button"
              className="verification-resend-btn"
              disabled={resendingCode || verificationTimeLeft > 0}
              onClick={handleResendCode}
            >
              {resendingCode
                ? t("login_register.resending")
                : t("login_register.resend_code")}
            </button>

            <div className="verification-modal-actions">
              <button
                type="button"
                className="verification-cancel-btn"
                disabled={verificationLoading || resendingCode}
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode("");
                }}
              >
                {t("login_register.cancel")}
              </button>

              <button
                type="button"
                className="register-submit-btn"
                disabled={
                  verificationLoading ||
                  resendingCode ||
                  verificationTimeLeft === 0 ||
                  verificationCode.length !== 6
                }
                onClick={handleVerifyCode}
              >
                {verificationLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {t("login_register.verifying")}
                  </>
                ) : (
                  t("login_register.verify")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
