import { useEffect, useState } from "react";

import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { Store } from "lucide-react";

import {
  useAccountStore,
  useAuthStore,
  useCompanyStore,
} from "@/store/zustand";

import { Companies, CompanyId } from "@/utils/config_companies";
import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";

export default function LoginPage() {
  const [mohNumber, setMohNumber] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    mohNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [step, setStep] = useState<"company" | "login">("company");

  const { login } = useAuthStore();
  const { refreshCart } = useAccountStore();
  const { companyId, setCompany } = useCompanyStore();

  const router = useRouter();
  const t = useTranslations("login_register");

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("companyIdCustomerPortalApp="));

    if (!cookie) {
      document.cookie = `companyIdCustomerPortalApp=${
        process.env.NEXT_PUBLIC_DEFAULT_COMPANY
      }; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const newErrors = {
      mohNumber: "",
      password: "",
    };

    const trimmedMohNumber = mohNumber.trim();

    if (!trimmedMohNumber) {
      newErrors.mohNumber = t("errors.moh_number_required");
    } else if (!/^MOH-\d{4}-\d{6}$/.test(trimmedMohNumber)) {
      newErrors.mohNumber = t("errors.moh_number_invalid");
    }

    if (!password) {
      newErrors.password = t("errors.password_required");
    }

    setErrors(newErrors);

    if (newErrors.mohNumber || newErrors.password) {
      return;
    }

    setLoading(true);

    try {
      await login({
        moh_number: trimmedMohNumber,
        password,
      });

      setRedirecting(true);

      toast.success(t("login_success"), {
        position: "bottom-center",
      });

      setMohNumber("");
      setPassword("");

      await refreshCart();
      router.push("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? t("errors.login_failed"), {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }

  function selectCompany(company: CompanyId) {
    setCompany(company);

    document.cookie = `companyIdCustomerPortalApp=${company}; path=/; max-age=31536000; SameSite=Lax`;

    setStep("login");
  }

  const company = Companies[companyId];

  return (
    <div className="login-page">
      {/* Language */}
      <div className="login-language">
        <ChangeLangDropdown />
      </div>

      <div className="login-card">
        {/* Loading Overlay */}
        {redirecting && (
          <div className="login-overlay">
            <Spinner animation="border" variant="primary" />

            <span>{t("loading_your_account")}</span>
          </div>
        )}

        {/* ==================================================
            COMPANY SELECTION
        ================================================== */}
        {step === "company" ? (
          <>
            <div className="login-header">
              <div className="login-header-content">
                <div className="login-selection-icon">
                  <Store size={18} />
                </div>

                <h1>{t("welcome")}</h1>

                <p className="login-subtitle">
                  {t("select_company_description")}
                </p>
              </div>
            </div>

            <div className="company-grid">
              {Object.values(Companies)
                .filter((c) => c.enabled)
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`company-card ${
                      c.id === companyId ? "active" : ""
                    }`}
                    disabled={loading || redirecting}
                    onClick={() => selectCompany(c.id as CompanyId)}
                  >
                    <img
                      src={c.logo}
                      alt={c.name}
                      className="company-card-logo"
                    />

                    <div className="company-card-content">
                      <h4>{c.name}</h4>
                    </div>

                    <i className="ti ti-chevron-right company-card-arrow" />
                  </button>
                ))}
            </div>
          </>
        ) : (
          <>
            {/* ==================================================
                LOGIN
            ================================================== */}
            <div className="login-header">
              <button
                type="button"
                className="login-back-btn"
                disabled={loading || redirecting}
                onClick={() => setStep("company")}
              >
                <i className="ti ti-arrow-left" />
              </button>

              <div className="login-header-content">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="login-company-logo mb-5"
                />

                <h1>{t("welcome")}</h1>

                <p className="login-subtitle">
                  {t("sign_in_to_pharmacy_account")}
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              {/* MOH Number */}
              <div className="login-field">
                <label className="login-label">
                  {t("pharmacy_license_number")} <span>*</span>
                </label>

                <input
                  type="text"
                  maxLength={15}
                  disabled={loading || redirecting}
                  className={`form-control ${
                    errors.mohNumber ? "is-invalid-login" : ""
                  }`}
                  placeholder={t("license_number_placeholder")}
                  value={mohNumber}
                  onChange={(e) => {
                    setMohNumber(e.target.value.toUpperCase());

                    if (errors.mohNumber) {
                      setErrors((prev) => ({
                        ...prev,
                        mohNumber: "",
                      }));
                    }
                  }}
                  autoComplete="username"
                />

                {errors.mohNumber && (
                  <small className="login-field-error">
                    {errors.mohNumber}
                  </small>
                )}
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label">
                  {t("password")} <span>*</span>
                </label>

                <input
                  type="password"
                  disabled={loading || redirecting}
                  className={`form-control ${
                    errors.password ? "is-invalid-login" : ""
                  }`}
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }
                  }}
                  autoComplete="current-password"
                />

                {errors.password && (
                  <small className="login-field-error">{errors.password}</small>
                )}
              </div>

              {/* Login */}
              <button
                type="submit"
                className="login-button"
                disabled={loading || redirecting}
              >
                {loading || redirecting ? (
                  <>
                    <Spinner animation="border" size="sm" />

                    <span>{t("loading")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("login")}</span>

                    <i className="ti ti-arrow-right" />
                  </>
                )}
              </button>
            </form>

            {/* Request to Join */}
            <button
              type="button"
              className="request-join-button"
              disabled={loading || redirecting}
              onClick={() => router.push("/register")}
            >
              <span>{t("request_to_join")}</span>
              <i className="ti ti-arrow-right" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
