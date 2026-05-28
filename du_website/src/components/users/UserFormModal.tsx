import { Modal, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { useTranslations } from "next-intl";
import { ROLES } from "@/utils/data";
import { UserFormData } from "@/types/usersTypes";

interface Props {
  show: boolean;
  modalMode: "add" | "edit";
  modalLoading: boolean;
  formData: UserFormData;
  formErrors: any;
  editingRole: string | null;
  setFormData: (v: any) => void;
  handleInputChange: any;
  handleSubmit: () => void;
  handleClose: () => void;
  getRoleLabel: (role: string | null) => string | null;
}

const UserFormModal = ({
  show,
  modalMode,
  modalLoading,
  formData,
  formErrors,
  editingRole,
  setFormData,
  handleInputChange,
  handleSubmit,
  handleClose,
  getRoleLabel,
}: Props) => {
  const t = useTranslations();

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold">
          {modalMode === "add"
            ? t("users.modal.add_title")
            : t("users.modal.edit_title")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4">
        {modalLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("users.modal.first_name")} *</Form.Label>

                  <Form.Control
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.first_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.first_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("users.modal.last_name")}</Form.Label>

                  <Form.Control
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{t("users.modal.description")}</Form.Label>

              <Form.Control
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {t("users.modal.role")} *
                {editingRole === ROLES.Admin &&
                  ` (${t("users.modal.cannot_change_role")})`}
              </Form.Label>

              <Select
                isDisabled={editingRole === ROLES.Admin}
                options={Object.entries(ROLES)
                  .filter(([key]) => key !== "Admin")
                  .map(([key, value]) => ({
                    value,
                    label: key,
                  }))}
                value={
                  formData.role
                    ? {
                        value: formData.role,
                        label: getRoleLabel(formData.role),
                      }
                    : null
                }
                onChange={(selected) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    role: selected ? selected.value : "",
                  }))
                }
              />
              {formErrors.role && (
                <div className="text-danger small mt-1">{formErrors.role}</div>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("users.modal.password")}</Form.Label>

                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder={
                      modalMode === "edit"
                        ? t("users.modal.password_placeholder")
                        : ""
                    }
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("users.modal.confirm_password")}</Form.Label>

                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={handleClose}>
          {t("users.modal.cancel")}
        </Button>

        <Button variant="dark" onClick={handleSubmit}>
          {modalLoading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {t("users.modal.saving")}
            </>
          ) : modalMode === "add" ? (
            t("users.modal.create_btn")
          ) : (
            t("users.modal.update_btn")
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserFormModal;
