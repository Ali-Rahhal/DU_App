import { Modal, Button, Badge, Form, Spinner } from "react-bootstrap";
import Select from "react-select";
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
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold">
          <i className="fa fa-key me-2"></i>
          Manage Permissions
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4">
        {permissionsState && (
          <>
            <div className="mb-4">
              <h6 className="text-muted mb-2">User</h6>

              <p className="fw-semibold mb-1">
                {permissionsState.userName || "Unknown User"}
              </p>

              {permissionsState.userRole === ROLES.SysUser ? (
                <Badge bg="primary">SysUser Account</Badge>
              ) : (
                <Badge bg="light" text="dark">
                  Regular Account
                </Badge>
              )}
            </div>

            <Form.Group>
              <Form.Label className="fw-semibold">Permissions</Form.Label>

              <Select
                isMulti
                options={allPermissions.map((permission) => ({
                  value: permission.code,
                  label: permission.code,
                }))}
                value={selectedPermissions}
                onChange={(value) => setSelectedPermissions([...value])}
                placeholder="Select permissions..."
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
          Cancel
        </Button>

        <Button variant="dark" onClick={onUpdate}>
          {updatingPermissions ? (
            <>
              <Spinner size="sm" className="me-2" />
              Updating...
            </>
          ) : (
            "Update Permissions"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PermissionsModal;
