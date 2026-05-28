import { Modal, Button, Badge, Form, Spinner } from "react-bootstrap";
import Select from "react-select";
import { useTranslations } from "next-intl";
import { Permission, PermissionsState } from "@/types/usersTypes";
import { ROLES } from "@/utils/data";

interface Props {
  show: boolean;
  onClose: () => void;
  permissionsState: PermissionsState | null;
  allPermissions: Permission[];
  selectedPermissions: { value: string; label: string }[];
  setSelectedPermissions: (v: any) => void;
  updatingPermissions: boolean;
  onUpdate: () => void;
}

const PermissionsModal = ({
  show,
  onClose,
  permissionsState,
  allPermissions,
  selectedPermissions,
  setSelectedPermissions,
  updatingPermissions,
  onUpdate,
}: Props) => {
  const t = useTranslations();

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold">
          <i className="fa fa-key me-2"></i>
          {t("users.permissions.title")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4">
        {permissionsState && (
          <>
            <div className="mb-4">
              <h6 className="text-muted mb-2">{t("users.permissions.user")}</h6>

              <p className="fw-semibold mb-1">
                {permissionsState.userName ||
                  t("users.permissions.unknown_user")}
              </p>

              {permissionsState.userRole === ROLES.SysUser ? (
                <Badge bg="primary">
                  {t("users.permissions.sysuser_account")}
                </Badge>
              ) : (
                <Badge bg="light" text="dark">
                  {t("users.permissions.regular_account")}
                </Badge>
              )}
            </div>

            <Form.Group>
              <Form.Label className="fw-semibold">
                {t("users.permissions.permissions_label")}
              </Form.Label>

              <Select
                isMulti
                options={allPermissions.map((permission) => ({
                  value: permission.code,
                  label: permission.code,
                }))}
                value={selectedPermissions}
                onChange={(value) => setSelectedPermissions([...value])}
                placeholder={t("users.permissions.select_placeholder")}
                styles={{
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#007bff" : "white",
                    color: state.isFocused ? "white" : "black",
                    borderRadius: 6,
                  }),
                  multiValue: (base) => ({
                    ...base,
                    borderRadius: 60,
                  }),
                }}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onClose}>
          {t("users.permissions.cancel")}
        </Button>

        <Button variant="dark" onClick={onUpdate}>
          {updatingPermissions ? (
            <>
              <Spinner size="sm" className="me-2" />
              {t("users.permissions.updating")}
            </>
          ) : (
            t("users.permissions.update_btn")
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PermissionsModal;
