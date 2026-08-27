import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

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
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [step, setStep] = useState<"company" | "login">("company");

  const { login } = useAuthStore();
  const { refreshCart } = useAccountStore();
  const { companyId, setCompany } = useCompanyStore();

  const router = useRouter();
  const t = useTranslations();

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
    setLoading(true);

    try {
      await login({ moh_number: mohNumber, password });
      setRedirecting(true);
      toast.success("Logged in Successfully", {
        position: "bottom-center",
      });
      setMohNumber("");
      setPassword("");
      await refreshCart();
      router.push("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Login failed", {
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
      {/* Language Selector */}
      <div className="login-language">
        <ChangeLangDropdown />
      </div>

      <div className="login-card">
        {/* Loading Overlay */}
        {redirecting && (
          <div className="login-overlay">
            <Spinner animation="border" variant="primary" />
            <span>{t("login_register.loading_your_account")}</span>
          </div>
        )}

        {/* Company Selection Step */}
        {step === "company" ? (
          <>
            <p className="text-center text-muted select-company-text">
              {t("login_register.select_company_description")}
            </p>

            <div className="company-grid">
              {Object.values(Companies)
                .filter((c) => c.enabled)
                .map((c) => (
                  <button
                    key={c.id}
                    className={`company-card ${c.id === companyId ? "active" : ""}`}
                    onClick={() => selectCompany(c.id as CompanyId)}
                  >
                    <img
                      src={c.logo}
                      alt={c.name}
                      className="company-card-logo"
                    />
                    <h4>{c.name}</h4>
                  </button>
                ))}
            </div>
          </>
        ) : (
          /* Login Step */
          <>
            <div className="login-header">
              <button
                type="button"
                className="login-back-btn"
                disabled={loading || redirecting}
                onClick={() => setStep("company")}
              >
                <i className="ti ti-arrow-left"></i>
              </button>
              <div className="login-header-content">
                <h1>{t("login_register.welcome_to")}</h1>
                <img
                  src={company.logo}
                  alt={company.name}
                  className="login-company-logo"
                />
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group mb-3">
                <input
                  type="text"
                  required
                  disabled={loading || redirecting}
                  className="form-control"
                  placeholder={t("login_register.moh_number")}
                  value={mohNumber}
                  onChange={(e) => setMohNumber(e.target.value)}
                />
              </div>

              <div className="form-group mb-4">
                <input
                  type="password"
                  required
                  disabled={loading || redirecting}
                  className="form-control"
                  placeholder={t("login_register.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading || redirecting}
              >
                {loading || redirecting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {t("login_register.loading")}
                  </>
                ) : (
                  t("login_register.login")
                )}
              </button>
            </form>

            <div className="register-section">
              <span className="register-text">
                {t("login_register.dont_have_account")}
              </span>
              <button
                type="button"
                className="register-btn"
                onClick={() => router.push("/register")}
              >
                {t("login_register.register")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
