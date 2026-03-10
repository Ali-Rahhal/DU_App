import { Modal, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
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
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold">
          {modalMode === "add" ? "Add New User" : "Edit User"}
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
                  <Form.Label>First Name *</Form.Label>

                  <Form.Control
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.first_name}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>

                  <Form.Control
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>

              <Form.Control
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Role *
                {editingRole === ROLES.Admin &&
                  "(You can't change the role of an Admin)"}
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
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>

                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder={
                      modalMode === "edit" ? "Leave blank to keep current" : ""
                    }
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>

                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={handleClose}>
          Cancel
        </Button>

        <Button variant="dark" onClick={handleSubmit}>
          {modalLoading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Saving...
            </>
          ) : modalMode === "add" ? (
            "Create User"
          ) : (
            "Update User"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserFormModal;
