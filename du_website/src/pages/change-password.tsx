import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { useAccountStore } from "@/store/zustand";
import { changePassword } from "@/utils/apiCalls";
import { ALL_PERMISSIONS } from "@/utils/data";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const rt = useRouter();
  const t = useTranslations();
  const { role, checkPermission } = useAccountStore();

  useEffect(() => {
    if (!checkPermission(ALL_PERMISSIONS.ChangePassword)) {
      toast.error(t("change_password.no_permission"));
      rt.push("/account");
    }
  }, [role, t]);

  if (!checkPermission(ALL_PERMISSIONS.ChangePassword)) return null;

  return (
    <Layout>
      <AccountLayout
        title={t("change_password.title")}
        subTitle={t("change_password.subtitle")}
      >
        <div className="card">
          <div className="card-body">
            <form
              id="setting_form"
              onSubmit={(e) => {
                e.preventDefault();
                changePassword(oldPassword, newPassword, confirmPassword)
                  .then(() => {
                    toast.success(t("change_password.success_message"));
                    rt.push("/dashboard");
                  })
                  .catch((err) => {
                    toast.error(
                      err.response?.data?.message ||
                        t("change_password.error_message"),
                    );
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  });
              }}
            >
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group mb-4">
                    <label className="form-label">
                      {t("change_password.old_password")}
                    </label>
                    <input
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="form-control"
                      name="old_password"
                      type="password"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group mb-4">
                    <label className="form-label">
                      {t("change_password.new_password")}
                    </label>
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-control"
                      id="new_password"
                      name="new_password"
                      type="password"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group mb-4">
                    <label className="form-label">
                      {t("change_password.confirm_password")}
                    </label>
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="form-control"
                      name="confirm_password"
                      type="password"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group text-right mb-0">
                <button
                  id="setting_form_btn"
                  type="submit"
                  className="btn btn-primary btn-medium"
                >
                  {t("change_password.change_password_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default ChangePassword;
