import { Modal } from "react-bootstrap";
import { Building2, Hash, Phone, Mail, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAccountStore } from "@/store/zustand";

interface AccountDetailsModalProps {
  show: boolean;
  onHide: () => void;
}

const AccountDetailsModal = ({ show, onHide }: AccountDetailsModalProps) => {
  const t = useTranslations();

  const { name, pharmacy_name, code, moh_number, phone, email } =
    useAccountStore();

  const details = [
    {
      key: "pharmacy",
      label: t("account.pharmacy_name"),
      value: pharmacy_name,
      icon: Building2,
    },
    {
      key: "client-code",
      label: t("account.client_code"),
      value: code,
      icon: Hash,
    },
    {
      key: "moh-number",
      label: t("account.moh_number"),
      value: moh_number,
      icon: Hash,
    },
    {
      key: "phone",
      label: t("account.phone"),
      value: phone,
      icon: Phone,
    },
    {
      key: "email",
      label: t("account.email"),
      value: email,
      icon: Mail,
    },
  ];

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="account-details-modal"
    >
      <Modal.Header>
        <div>
          <Modal.Title>{t("my_account.title")}</Modal.Title>

          <p className="account-details-modal-subtitle">
            {t("my_account.subtitle")}
          </p>
        </div>

        <button
          type="button"
          className="account-modal-close"
          onClick={onHide}
          aria-label={t("account.close")}
        >
          <X size={18} />
        </button>
      </Modal.Header>

      <Modal.Body>
        <div className="account-details-modal-profile">
          <div className="account-details-modal-avatar">
            {(name || "Client")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join("")}
          </div>

          <div className="account-details-modal-profile-info">
            <h3>{name || "Client"}</h3>

            {pharmacy_name && (
              <div className="account-details-modal-pharmacy">
                <Building2 size={15} />
                <span>{pharmacy_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="account-details-modal-grid">
          {details.map((detail) => {
            if (!detail.value) return null;

            const Icon = detail.icon;

            return (
              <div key={detail.key} className="account-details-modal-item">
                <div className="account-details-modal-icon">
                  <Icon size={18} />
                </div>

                <div className="account-details-modal-item-content">
                  <span className="account-details-modal-label">
                    {detail.label}
                  </span>

                  <span className="account-details-modal-value">
                    {detail.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={onHide}>
          {t("account.cancel")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AccountDetailsModal;
