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
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // First screen: company selection
  const [step, setStep] = useState<"company" | "login">("company");

  const { login } = useAuthStore();
  const { refreshCart } = useAccountStore();
  const { companyId, setCompany } = useCompanyStore();

  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("companyId="));

    if (!cookie) {
      document.cookie = `companyId=${
        process.env.NEXT_PUBLIC_DEFAULT_COMPANY
      }; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      await login({
        code,
        password,
      });

      setRedirecting(true);

      toast.success("Logged in Successfully", {
        position: "bottom-center",
      });

      setCode("");
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

    document.cookie = `companyId=${company}; path=/; max-age=31536000; SameSite=Lax`;

    setStep("login");
  }

  const company = Companies[companyId];

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-language">
          <ChangeLangDropdown />
        </div>
        {redirecting && (
          <div className="login-overlay">
            <Spinner animation="border" />
            <span>{t("loading_your_account")}</span>
          </div>
        )}

        {step === "company" ? (
          <>
            <div className="text-center mb-5">
              <h2>{t("select_company")}</h2>
              <p className="text-muted">{t("select_company_description")}</p>
            </div>

            <div className="company-grid">
              {Object.values(Companies)
                .filter((c) => c.enabled)
                .map((c) => (
                  <button
                    key={c.id}
                    className="company-card"
                    onClick={() => selectCompany(c.id as CompanyId)}
                  >
                    <img
                      src={c.logo}
                      alt={c.name}
                      className="company-card-logo"
                    />

                    <h4>{c.name}</h4>

                    {c.abreviation && (
                      <small className="text-muted">{c.abreviation}</small>
                    )}
                  </button>
                ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <img
                src={company.logo}
                alt={company.name}
                className="company-logo"
              />

              <h3 className="mt-3">{company.name}</h3>

              <p className="text-muted">{t("login")}</p>

              <button
                type="button"
                className="change-company-btn"
                disabled={loading || redirecting}
                onClick={() => setStep("company")}
              >
                <i className="bi bi-arrow-left"></i> {t("change_company")}
              </button>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group mb-3">
                <input
                  type="text"
                  required
                  disabled={loading || redirecting}
                  className="form-control"
                  placeholder={t("user_code")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div className="form-group mb-4">
                <input
                  type="password"
                  required
                  disabled={loading || redirecting}
                  className="form-control"
                  placeholder={t("password")}
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
                    {t("loading")}
                  </>
                ) : (
                  t("login")
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
