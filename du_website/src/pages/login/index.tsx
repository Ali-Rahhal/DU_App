import { useEffect, useState } from "react";
import { Spinner, FormSelect } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import {
  useAccountStore,
  useAuthStore,
  useCompanyStore,
} from "@/store/zustand";

import { Companies, CompanyId } from "@/utils/config_companies";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { login } = useAuthStore();
  const { refreshCart } = useAccountStore();

  const { companyId, setCompany } = useCompanyStore();

  const router = useRouter();
  const t = useTranslations();

  // Set default company cookie on load if not set
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("companyId="));

    if (!cookie) {
      const defaultCompany = process.env.NEXT_PUBLIC_DEFAULT_COMPANY as string;

      document.cookie = `companyId=${defaultCompany}; path=/; max-age=31536000; SameSite=Lax`;
    }
  });

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

  function handleCompanyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedCompany = e.target.value as CompanyId;

    setCompany(selectedCompany);

    document.cookie = `companyId=${selectedCompany}; path=/; max-age=31536000; SameSite=Lax`;

    window.location.reload();
  }

  const company = Companies[companyId];

  return (
    <div className="login-page">
      <div className="login-card">
        {redirecting && (
          <div className="login-overlay">
            <Spinner animation="border" />
            <span>Loading your account...</span>
          </div>
        )}
        {/* Logo */}
        <div className="text-center mb-4">
          <img src={company.logo} alt={company.name} className="company-logo" />

          <p className="text-muted">{t("login")}</p>
        </div>

        {/* Company Switch */}
        <div className="company-switch mb-4">
          <label>Company</label>

          <FormSelect
            value={companyId}
            disabled={loading}
            onChange={handleCompanyChange}
            className="company-select"
          >
            {Object.values(Companies)
              .filter((c) => c.enabled)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.abreviation}
                </option>
              ))}
          </FormSelect>
        </div>

        <form
          onSubmit={handleLogin}
          className={redirecting ? "form-loading" : ""}
        >
          <div className="form-group mb-3">
            <input
              type="text"
              disabled={loading || redirecting}
              required
              className="form-control"
              placeholder={t("user_code")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="form-group mb-4">
            <input
              type="password"
              disabled={loading || redirecting}
              required
              className="form-control"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-button" disabled={loading || redirecting}>
            {loading || redirecting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Loading...
              </>
            ) : (
              t("login")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
