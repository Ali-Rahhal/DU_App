import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { useAccountStore } from "@/store/zustand";
import { changePassword } from "@/utils/apiCalls";
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
  const { type } = useAccountStore();
  // if (type !== 2) {
  //   rt.push("/account");
  //   return null;
  // }
  useEffect(() => {
    if (type === 2) {
      rt.push("/account");
    }
  }, [type]);
  if (type === 2) return null;
  return (
    <Layout>
      <AccountLayout
        // title="Change Password"
        title={t("change_password")}
        // subTitle="You have full control to manage your own Account."
        subTitle={t("you_have_full_control_to_manage_your_own_account")}
      >
        <div className="card">
          <div className="card-body">
            <form
              id="setting_form"
              onSubmit={(e) => {
                e.preventDefault();
                changePassword(oldPassword, newPassword, confirmPassword)
                  .then(() => {
                    toast.success("Password Changed Successfully");
                    rt.push("/dashboard");
                  })
                  .catch((err) => {
                    toast.error(err.response.data.message);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  });
              }}
            >
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group mb-4">
                    <label className="form-label">Old Password</label>
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
                    <label className="form-label">New Password</label>
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-control"
                      id="new_password"
                      name="new_password"
                      type="text"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group mb-4">
                    <label className="form-label">Confirm Password</label>
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
                  Change Password
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
