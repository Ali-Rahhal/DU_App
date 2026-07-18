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

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import {
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Form,
  Spinner,
} from "react-bootstrap";

import { ROLES } from "@/utils/data";

import UsersTable from "@/components/users/UsersTable";
import UserFormModal from "@/components/users/UserFormModal";
import PermissionsModal from "@/components/users/PermissionsModal";

import {
  User,
  Permission,
  PaginationInfo,
  PermissionsState,
  UserFormData,
  INITIAL_FORM_DATA,
} from "@/types/usersTypes";
import UsersCards from "@/components/users/UsersCards";

const Users = () => {
  const t = useTranslations();

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

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  const [permissionsModal, setPermissionsModal] = useState(false);

  const [permissionsState, setPermissionsState] =
    useState<PermissionsState | null>(null);

  const [selectedPermissions, setSelectedPermissions] = useState<
    { value: string; label: string }[]
  >([]);

  const [updatingPermissions, setUpdatingPermissions] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM_DATA);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingRole, setEditingRole] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  useEffect(() => {
    if (allPermissions.length) return;
    fetchAllPermissions();
  }, []);

  const fetchAllPermissions = async () => {
    try {
      const response = await getAllPermissions();
      setAllPermissions(response.data.result || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("users.permissions_fetch_error"),
      );
    }
  };

  const fetchUsers = useCallback(
    async (page = 1, search = searchTerm, isPageChange = false) => {
      try {
        if (isPageChange) setPageLoading(true);
        else setLoading(true);

        const response = await getUsers(page, pagination.pageSize, search);

        setUsers(response.data.result.users);
        setPagination(response.data.result.pagination);
      } catch (error: any) {
        toast.error(error.response?.data?.message || t("users.fetch_error"));
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [searchTerm, pagination.pageSize, t],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers]);

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await toggleUserStatus(userId);

      const statusMessage = response.data.result.is_active
        ? t("users.activated")
        : t("users.deactivated");

      toast.success(
        `${t("users.user")} ${statusMessage} ${t("users.successfully")}`,
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, is_active: response.data.result.is_active }
            : user,
        ),
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || t("users.status_update_error");

      toast.error(errorMessage);
    }
  };

  const handleOpenPermissionsModal = async (user: User) => {
    setPermissionsModal(true);

    setPermissionsState({
      userId: user.id,
      userName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      userRole: user.role,
      permissions: [],
    });

    setSelectedPermissions([]);

    try {
      const response = await getUserPermissions(user.id);

      const userPermissions = response.data.result.permissions || [];

      const selected = userPermissions.map((perm: any) => ({
        value: perm.code,
        label: perm.code,
      }));

      setSelectedPermissions(selected);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("users.permissions_fetch_error"),
      );
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
      const permissionCodes = selectedPermissions.map((p) => p.value);

      const permissionIds = allPermissions
        .filter((p) => permissionCodes.includes(p.code))
        .map((p) => p.id);

      await updateUserPermissions(permissionsState.userId, permissionIds);

      toast.success(t("users.permissions_update_success"));

      handleClosePermissionsModal();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("users.permissions_update_error"),
      );
    } finally {
      setUpdatingPermissions(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
    setEditingRole(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = async (userId: number, userRole: string) => {
    setModalMode("edit");
    setEditingId(userId);
    setEditingRole(userRole);
    setModalLoading(true);
    setShowModal(true);

    try {
      const response = await getUserById(userId);

      const user = response.data.result;

      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        description: user.description || "",
        role: user.role || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("users.fetch_error"));
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
    setEditingRole(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = t("users.errors.first_name_required");
    }

    if (!formData.role) {
      errors.role = t("users.errors.role_required");
    }

    if (modalMode === "add" && !formData.password) {
      errors.password = t("users.errors.password_required");
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = t("users.errors.password_min_length");
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("users.errors.passwords_mismatch");
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
          role: formData.role,
          password: formData.password,
        });

        setUsers((prev) => [response.data.result, ...prev]);

        if (response.data.result.role === ROLES.SysUser) {
          await handleOpenPermissionsModal(response.data.result);
        }

        toast.success(t("users.create_success"));
      } else {
        if (!editingId) return;

        const response = await updateUser(editingId, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          description: formData.description,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        });

        setUsers((prev) =>
          prev.map((user) =>
            user.id === editingId ? response.data.result : user,
          ),
        );

        toast.success(t("users.update_success"));
      }

      handleCloseModal();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          (modalMode === "add"
            ? t("users.create_error")
            : t("users.update_error")),
      );
    } finally {
      setModalLoading(false);
    }
  };

  const getRoleLabel = (roleValue: string | null) => {
    const roleEntry = Object.entries(ROLES).find(
      ([, value]) => value === roleValue,
    );

    return roleEntry ? roleEntry[0] : null;
  };

  return (
    <Layout>
      <AccountLayout title={t("users.title")} subTitle={t("users.subtitle")}>
        <Row className="mb-4 align-items-center">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <i className="fa fa-search text-muted"></i>
              </InputGroup.Text>

              <Form.Control
                placeholder={t("users.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6} className="text-md-end mt-3 mt-md-0">
            <Button variant="dark" onClick={handleOpenAddModal}>
              <i className="fa fa-plus me-2"></i>
              {t("users.add_user")}
            </Button>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-0 py-3 px-4 d-flex justify-content-between">
            <div>
              <h5 className="mb-0 fw-semibold">{t("users.title")}</h5>

              <small className="text-muted">
                {pagination.totalCount} {t("users.total_users")}
              </small>
            </div>

            {loading && <Spinner size="sm" />}
          </Card.Header>

          <div className="table-responsive position-relative d-none d-lg-block">
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

            <UsersTable
              users={users}
              loading={loading}
              onEdit={handleOpenEditModal}
              onPermissions={handleOpenPermissionsModal}
              onToggle={handleToggleStatus}
            />
          </div>

          {/* Mobile */}
          <div className="d-block d-lg-none">
            <UsersCards
              users={users}
              loading={loading}
              onEdit={handleOpenEditModal}
              onPermissions={handleOpenPermissionsModal}
              onToggle={handleToggleStatus}
            />
          </div>
          {pagination.totalPages > 1 && (
            <Card.Footer className="bg-white border-0 py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  {t("users.showing")}{" "}
                  {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalCount,
                  )}{" "}
                  {t("users.of")} {pagination.totalCount}
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
                    {t("users.previous")}
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
                    {t("users.next")}
                  </Button>
                </div>
              </div>
            </Card.Footer>
          )}
        </Card>

        <PermissionsModal
          show={permissionsModal}
          onClose={handleClosePermissionsModal}
          permissionsState={permissionsState}
          allPermissions={allPermissions}
          selectedPermissions={selectedPermissions}
          setSelectedPermissions={setSelectedPermissions}
          updatingPermissions={updatingPermissions}
          onUpdate={handleUpdatePermissions}
        />

        <UserFormModal
          show={showModal}
          modalMode={modalMode}
          modalLoading={modalLoading}
          formData={formData}
          formErrors={formErrors}
          editingRole={editingRole}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleClose={handleCloseModal}
          getRoleLabel={getRoleLabel}
        />
      </AccountLayout>
    </Layout>
  );
};

export default Users;
