// pages/users/index.tsx

import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import {
  getUsers,
  toggleUserStatus,
  createUser,
  updateUser,
  getUserById,
  getUserPermissions,
  getAllPermissions,
  updateUserPermissions,
} from "@/utils/apiCalls";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import {
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Card,
  Dropdown,
  Modal,
  Spinner,
} from "react-bootstrap";
import Select from "react-select";

interface User {
  id: number;
  code: string;
  first_name: string | null;
  last_name: string | null;
  description: string | null;
  type: number | null;
  balance: number | string;
  is_verified: boolean;
  is_blocked: boolean | null;
  is_active: boolean | null;
  date_added: string;
  password?: string;
  role?: string | null;
}

interface Permission {
  id: number;
  code: string;
  description: string | null;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface UserFormData {
  id?: number;
  first_name: string;
  last_name: string;
  description: string;
  password: string;
  confirmPassword: string;
}

interface PermissionsState {
  userId: number;
  userName: string;
  userType: number | null;
  permissions: Permission[];
}

const INITIAL_FORM_DATA: UserFormData = {
  first_name: "",
  last_name: "",
  description: "",
  password: "",
  confirmPassword: "",
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Permissions state
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permissionsModal, setPermissionsModal] = useState(false);
  const [permissionsState, setPermissionsState] =
    useState<PermissionsState | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<
    { value: string; label: string }[]
  >([]);
  const [updatingPermissions, setUpdatingPermissions] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  const t = useTranslations();

  // Fetch all permissions on component mount
  useEffect(() => {
    fetchAllPermissions();
  }, []);

  const fetchAllPermissions = async () => {
    try {
      const response = await getAllPermissions();
      setAllPermissions(response.data.result || []);
    } catch (error: any) {
      toast.error("Failed to fetch permissions");
    }
  };

  // Memoized fetch function with pageLoading for pagination
  const fetchUsers = useCallback(
    async (page = 1, search = searchTerm, isPageChange = false) => {
      try {
        if (isPageChange) setPageLoading(true);
        else setLoading(true);

        const response = await getUsers(page, pagination.pageSize, search);
        setUsers(response.data.result.users);
        setPagination(response.data.result.pagination);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [searchTerm, pagination.pageSize],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers]);

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await toggleUserStatus(userId);
      toast.success(
        `User ${
          response.data.result.is_active ? "activated" : "deactivated"
        } successfully`,
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, is_active: response.data.result.is_active }
            : user,
        ),
      );
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  // Permissions handlers
  const handleOpenPermissionsModal = async (user: User) => {
    setPermissionsModal(true);
    setPermissionsState({
      userId: user.id,
      userName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      userType: user.type,
      permissions: [],
    });
    setSelectedPermissions([]);

    try {
      const response = await getUserPermissions(user.id);
      const userPermissions = response.data.result.permissions || [];

      // Convert to react-select format
      const selected = userPermissions.map((perm: any) => ({
        value: perm.code,
        label: perm.code,
      }));
      setSelectedPermissions(selected);
    } catch (error: any) {
      toast.error("Failed to load user permissions");
    }
  };

  const handleClosePermissionsModal = () => {
    setPermissionsModal(false);
    setPermissionsState(null);
    setSelectedPermissions([]);
  };

  const handleUpdatePermissions = async () => {
    if (!permissionsState) return;

    setUpdatingPermissions(true);
    try {
      // Extract permission IDs from selected options
      const permissionCodes = selectedPermissions.map((p) => p.value);
      const permissionIds = allPermissions
        .filter((p) => permissionCodes.includes(p.code))
        .map((p) => p.id);

      await updateUserPermissions(permissionsState.userId, permissionIds);
      toast.success("Permissions updated successfully");
      handleClosePermissionsModal();
    } catch (error: any) {
      toast.error("Failed to update permissions");
    } finally {
      setUpdatingPermissions(false);
    }
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = async (userId: number) => {
    setModalMode("edit");
    setEditingId(userId);
    setModalLoading(true);
    setShowModal(true);

    try {
      const response = await getUserById(userId);
      const user = response.data.result;
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        description: user.description || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Failed to load user data");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setEditingId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name as keyof UserFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (modalMode === "add" && !formData.password) {
      errors.password = "Password is required";
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setModalLoading(true);
    try {
      if (modalMode === "add") {
        const response = await createUser({
          first_name: formData.first_name,
          last_name: formData.last_name,
          description: formData.description,
          password: formData.password,
        });

        setUsers((prev) => [response.data.result, ...prev]);
        toast.success("User created successfully");
      } else {
        if (!editingId) return;

        const response = await updateUser(editingId, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          description: formData.description,
          ...(formData.password ? { password: formData.password } : {}),
        });

        setUsers((prev) =>
          prev.map((user) =>
            user.id === editingId ? response.data.result : user,
          ),
        );
        toast.success("User updated successfully");
      }

      handleCloseModal();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to ${modalMode} user`,
      );
    } finally {
      setModalLoading(false);
    }
  };

  const formatBalance = (balance: number | string | undefined) => {
    if (!balance) return "0.00";
    const num = typeof balance === "string" ? parseFloat(balance) : balance;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  const getUserType = (type: number | null) => {
    switch (type) {
      case 0:
        return { label: "Regular", bg: "light", text: "dark" };
      case 2:
        return { label: "Child", bg: "primary" };
      default:
        return { label: "Unknown", bg: "warning", text: "dark" };
    }
  };

  return (
    <Layout>
      <AccountLayout
        title={t("users") || "Users"}
        subTitle={t("manage_your_users") || "Manage your users"}
      >
        {/* Search + Add */}
        <Row className="mb-4 align-items-center">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <i className="fa fa-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6} className="text-md-end mt-3 mt-md-0">
            <Button
              variant="dark"
              className="px-4"
              onClick={handleOpenAddModal}
            >
              <i className="fa fa-plus me-2"></i>
              Add User
            </Button>
          </Col>
        </Row>
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-semibold">{t("users")}</h5>
              <small className="text-muted">
                {pagination.totalCount} total users
              </small>
            </div>
            {loading && <Spinner size="sm" variant="primary" />}
          </Card.Header>

          <div className="table-responsive position-relative">
            {pageLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 5,
                }}
              >
                <Spinner animation="border" size="sm" />
              </div>
            )}

            <Table hover className="mb-0 align-middle">
              <thead className="bg-light small text-uppercase text-muted">
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th className="text-end">Balance</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const type = getUserType(user.type);

                    return (
                      <tr key={user.id}>
                        <td className="fw-semibold text-primary">
                          {user.code}
                        </td>
                        <td>
                          <div className="fw-semibold">
                            {user.first_name} {user.last_name}
                          </div>
                          {user.description && (
                            <small className="text-muted">
                              {user.description}
                            </small>
                          )}
                        </td>
                        <td>
                          <Badge bg={type.bg} text={type.text || "white"}>
                            {type.label}
                          </Badge>
                        </td>
                        <td className="text-end fw-medium">
                          {formatBalance(user.balance)}
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Badge
                              bg={user.is_active ? "success" : "warning"}
                              text="white"
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {user.is_verified && (
                              <Badge bg="info" text="white">
                                Verified
                              </Badge>
                            )}
                            {user.is_blocked && (
                              <Badge bg="danger" text="white">
                                Blocked
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(user.date_added)}</td>
                        <td className="text-center">
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="border rounded-circle px-2"
                              style={{ width: 36, height: 36 }}
                            >
                              <i className="fa fa-ellipsis-v"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => handleOpenEditModal(user.id)}
                              >
                                <i className="fa fa-edit me-2"></i> Edit
                              </Dropdown.Item>

                              {/* New Permissions Menu Item */}
                              <Dropdown.Item
                                onClick={() => handleOpenPermissionsModal(user)}
                              >
                                <i className="fa fa-key me-2"></i> Permissions
                              </Dropdown.Item>

                              <Dropdown.Divider />

                              <Dropdown.Item
                                onClick={() => handleToggleStatus(user.id)}
                              >
                                <i className="fa fa-ban me-2"></i>
                                {user.is_active ? "Deactivate" : "Activate"}
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card.Footer className="bg-white border-0 py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalCount,
                  )}{" "}
                  of {pagination.totalCount}
                </small>

                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    disabled={pagination.currentPage === 1 || pageLoading}
                    onClick={() =>
                      fetchUsers(pagination.currentPage - 1, searchTerm, true)
                    }
                  >
                    Previous
                  </Button>

                  <Button
                    size="sm"
                    variant="light"
                    disabled={
                      pagination.currentPage === pagination.totalPages ||
                      pageLoading
                    }
                    onClick={() =>
                      fetchUsers(pagination.currentPage + 1, searchTerm, true)
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card.Footer>
          )}
        </Card>

        {/* Permissions Modal */}
        <Modal
          show={permissionsModal}
          onHide={handleClosePermissionsModal}
          centered
          size="lg"
        >
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
                  {permissionsState.userType === 2 ? (
                    <Badge bg="primary">Child Account</Badge>
                  ) : (
                    <Badge bg="light" text="dark">
                      Regular Account
                    </Badge>
                  )}
                </div>

                <Form.Group className="mb-3">
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
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isFocused ? "#007bff" : "white",
                        color: state.isFocused ? "white" : "black",
                        borderRadius: 6,
                        overflow: "hidden",
                      }),
                      multiValue: (baseStyles) => ({
                        ...baseStyles,
                        borderRadius: 60,
                      }),
                      control: (baseStyles) => ({
                        ...baseStyles,
                        backgroundColor: "white",
                      }),
                    }}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleClosePermissionsModal}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleUpdatePermissions}>
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

        {/* Add/Edit User Modal */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-semibold">
              {modalMode === "add" ? "Add New User" : "Edit User"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4">
            {modalLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        type="text"
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
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
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
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Password {modalMode === "add" && "*"}
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.password}
                        placeholder={
                          modalMode === "edit"
                            ? "Leave blank to keep current"
                            : ""
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.password}
                      </Form.Control.Feedback>
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
            <Button variant="light" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="dark"
              onClick={handleSubmit}
              disabled={modalLoading}
            >
              {modalLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {modalMode === "add" ? "Creating..." : "Updating..."}
                </>
              ) : modalMode === "add" ? (
                "Create User"
              ) : (
                "Update User"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </AccountLayout>
    </Layout>
  );
};

export default Users;
