import { useEffect, useState } from "react";

import { Modal } from "react-bootstrap";
import { Lock, X } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import { useAccountStore } from "@/store/zustand";
import { changePassword } from "@/utils/apiCalls";
import { ALL_PERMISSIONS } from "@/utils/data";

interface ChangePasswordModalProps {
  show: boolean;
  onHide: () => void;
}

const ChangePasswordModal = ({ show, onHide }: ChangePasswordModalProps) => {
  const t = useTranslations();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { checkPermission } = useAccountStore();

  const hasPermission = checkPermission(ALL_PERMISSIONS.ChangePassword);

  useEffect(() => {
    if (show && !hasPermission) {
      toast.error(t("change_password.no_permission"));
      onHide();
      router.push("/account");
    }
  }, [show, hasPermission, onHide, router, t]);

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onHide();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      await changePassword(oldPassword, newPassword, confirmPassword);

      toast.success(t("change_password.success_message"));

      resetForm();
      onHide();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || t("change_password.error_message"),
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="change-password-modal"
    >
      <Modal.Header>
        <div className="change-password-modal-heading">
          <div className="change-password-modal-icon">
            <Lock size={20} />
          </div>

          <div>
            <Modal.Title>{t("change_password.title")}</Modal.Title>

            <p className="change-password-modal-subtitle">
              {t("change_password.subtitle")}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="change-password-modal-close"
          onClick={onHide}
          aria-label={t("common.close")}
        >
          <X size={18} />
        </button>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="change-password-form-group">
            <label htmlFor="old_password" className="change-password-label">
              {t("change_password.old_password")}
            </label>

            <input
              id="old_password"
              name="old_password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="form-control change-password-input"
              required
              disabled={loading}
            />
          </div>

          <div className="change-password-form-row">
            <div className="change-password-form-group">
              <label htmlFor="new_password" className="change-password-label">
                {t("change_password.new_password")}
              </label>

              <input
                id="new_password"
                name="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control change-password-input"
                required
                disabled={loading}
              />
            </div>

            <div className="change-password-form-group">
              <label
                htmlFor="confirm_password"
                className="change-password-label"
              >
                {t("change_password.confirm_password")}
              </label>

              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control change-password-input"
                required
                disabled={loading}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            className="btn btn-light"
            onClick={handleClose}
            disabled={loading}
          >
            {t("account.cancel")}
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "..." : t("change_password.change_password_btn")}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
