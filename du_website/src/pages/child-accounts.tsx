import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";

import {
  createChild,
  deleteChild,
  disableChild,
  editChild,
  enableChild,
  getAllPermissions,
  getChildren,
  updateChildPermissions,
} from "@/utils/apiCalls";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownButton,
  Modal,
} from "react-bootstrap";
import Select from "react-select";
import { useAccountStore } from "@/store/zustand";
import { useRouter } from "next/router";
const ChildAccountSettings = () => {
  const { type } = useAccountStore();
  const rt = useRouter();
  const [allPermissions, setAllPermissions] = useState<
    {
      id: number;
      description: string;
      code: string;
    }[]
  >([]);
  const [editPermissionsState, setEditPermissionsState] = useState<{
    user_code: string | undefined;
    id: number;
    description: string | undefined;
    warehouse_code: string;
    user_permissions: {
      id: number;

      code: string;
    }[];
  } | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [childUsers, setChildUsers] = useState<
    {
      id: number;
      code: string;
      first_name: string;
      last_name: string;
      type: number;
      phone: string;
      is_active: boolean;
      date_added: string;
      is_blocked: boolean;
      user_permission_assignment: {
        id: number;
        user_permission: {
          id: number;
          description: string;
          code: string;
        };
      }[];
    }[]
  >([]);
  const [name, setName] = useState("");
  const [openAddChildModal, setOpenAddChildModal] = useState({
    open: false,
    isEdit: false,
  });
  const [selectedChild, setSelectedChild] = useState({
    id: 0,
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);

  const t = useTranslations();
  const fetchChildUsers = async (search?: string) => {
    await getChildren(search)
      .then((res) => {
        setChildUsers(res.data.result);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const updateUserPermissions = async () => {
    setLoading(true);
    const result = await updateChildPermissions({
      child_id: editPermissionsState?.id,
      permissionsIds: editPermissionsState?.user_permissions.map(
        (permission) => {
          return permission.id;
        }
      ),
    })
      .then((result) => {
        setLoading(false);
        setSubmitDialogOpen(false);
        setEditPermissionsState(null);
        fetchChildUsers();
        // setUserPermissions(result.data.result);
      })
      .catch((error) => {
        console.log(error);
      });

    return result;
  };
  useEffect(() => {
    fetchChildUsers();
    getAllPermissions()
      .then((res) => {
        setAllPermissions(res.data.result);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchChildUsers(name);
    }, 300);
    return () => {
      t && clearTimeout(t);
    };
  }, [name]);
  if (type === 2) {
    rt.push("/");
    return null;
  }
  return (
    <>
      <Layout>
        <Modal
          show={editPermissionsState !== null}
          onClose={() => {
            setEditPermissionsState(null);
          }}
          title="Edit Permissions"
        >
          <Modal.Header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Modal.Title
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {t("edit_permissions")}
            </Modal.Title>
            <button
              className="close"
              onClick={() => {
                setEditPermissionsState(null);
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </Modal.Header>
          <Modal.Body>
            <div className="child_form">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* <h5 style={{ color: "#1864ab" }}>
                  Account Code: {editPermissionsState?.user_code}
                </h5> */}
                <div>
                  Editing permissions for:{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {editPermissionsState?.description}{" "}
                  </span>
                  ({editPermissionsState?.user_code})
                </div>

                <Select
                  isMulti
                  options={allPermissions.map((permission) => {
                    return {
                      value: permission.id.toString(),
                      label: permission.code,
                    };
                  })}
                  value={editPermissionsState?.user_permissions.map(
                    (permission) => {
                      return {
                        value: permission.id.toString(),
                        label: permission.code,
                      };
                    }
                  )}
                  onChange={(value) => {
                    setEditPermissionsState({
                      id: editPermissionsState?.id || 0,
                      user_code: editPermissionsState?.user_code || "",
                      description: editPermissionsState?.description || "",
                      warehouse_code:
                        editPermissionsState?.warehouse_code || "",
                      user_permissions: value.map((permission) => {
                        return {
                          id: parseInt(permission.value),
                          code: permission.label,
                        };
                      }),
                    });
                  }}
                  getOptionLabel={(option) => t("permission." + option.label)}
                  styles={{
                    // control: (baseStyles, state) => ({
                    //   ...baseStyles,
                    //   borderColor: state.isFocused ? "grey" : "red",
                    // }),
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
                  }}
                />
                <Button
                  disabled={loading}
                  onClick={() => {
                    updateUserPermissions();
                  }}
                >
                  {loading ? (
                    <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <Modal
          show={openAddChildModal.open}
          onHide={() =>
            setOpenAddChildModal({
              open: false,
              isEdit: false,
            })
          }
          style={{
            fontFamily: "Poppins",
          }}
        >
          <Modal.Header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Modal.Title>
              {/* Request a Visit */}
              {openAddChildModal.isEdit
                ? t("edit_child_account")
                : t("add_child_account")}
            </Modal.Title>
            <button
              className="close"
              onClick={() => {
                setOpenAddChildModal({
                  open: false,
                  isEdit: false,
                });
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </Modal.Header>
          <form
            className=""
            autoComplete="off"
            // style={{
            //   display: "flex",
            //   flexDirection: "column",
            //   gap: "5px",
            // }}
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedChild.password !== selectedChild.confirm_password) {
                toast.error("Passwords do not match");
                return;
              }
              if (openAddChildModal.isEdit) {
                // edit child
                editChild({
                  first_name: selectedChild.first_name,
                  last_name: selectedChild.last_name,
                  password: selectedChild.password,
                  phone_number: selectedChild.phone_number,
                  child_id: selectedChild.id,
                })
                  .then((res) => {
                    toast.success(res.data.message);
                    fetchChildUsers();
                    setOpenAddChildModal({
                      open: false,
                      isEdit: false,
                    });
                    setSelectedChild({
                      first_name: "",
                      last_name: "",
                      password: "",
                      confirm_password: "",
                      phone_number: "",
                      id: 0,
                    });
                  })
                  .catch((error) => {
                    toast.error(error.response.data.message);
                  });
              } else {
                // create child
                createChild({
                  first_name: selectedChild.first_name,
                  last_name: selectedChild.last_name,
                  password: selectedChild.password,
                  phone_number: selectedChild.phone_number,
                })
                  .then((res) => {
                    toast.success(res.data.message);
                    fetchChildUsers();
                    setOpenAddChildModal({
                      open: false,
                      isEdit: false,
                    });
                    setSelectedChild({
                      first_name: "",
                      last_name: "",
                      password: "",
                      confirm_password: "",
                      phone_number: "",
                      id: 0,
                    });
                  })
                  .catch((error) => {
                    toast.error(error.response.data.message);
                  });
              }
            }}
          >
            <Modal.Body>
              <div className="child_form">
                <label htmlFor="first_name">{t("first_name")}</label>
                <input
                  id="first_name"
                  name={t("first_name")}
                  required
                  type="text"
                  placeholder={t("first_name")}
                  className="form-control input-lg rounded"
                  value={selectedChild.first_name}
                  onChange={(e) => {
                    setSelectedChild({
                      ...selectedChild,
                      first_name: e.target.value,
                    });
                  }}
                />
                <label htmlFor="last_name">{t("last_name")}</label>
                <input
                  id="last_name"
                  name={t("last_name")}
                  required
                  type="text"
                  placeholder={t("last_name")}
                  className="form-control input-lg rounded"
                  value={selectedChild.last_name}
                  autoComplete="off"
                  onChange={(e) => {
                    setSelectedChild({
                      ...selectedChild,
                      last_name: e.target.value,
                    });
                  }}
                />
                <label htmlFor="phone_number">{t("phone_number")}</label>
                <input
                  id="phone_number"
                  name={t("phone_number")}
                  type="text"
                  placeholder={t("phone_number")}
                  className="form-control input-lg rounded"
                  value={selectedChild.phone_number}
                  onChange={(e) => {
                    setSelectedChild({
                      ...selectedChild,
                      phone_number: e.target.value,
                    });
                  }}
                />
                <label htmlFor="password">{t("password")}</label>
                <input
                  id="password"
                  name={t("password")}
                  required
                  type="password"
                  placeholder={t("password")}
                  className="form-control input-lg rounded"
                  value={selectedChild.password}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setSelectedChild({
                      ...selectedChild,
                      password: e.target.value,
                    });
                  }}
                />
                <label htmlFor="confirm_password">
                  {t("confirm_password")}
                </label>
                <input
                  id="confirm_password"
                  name={t("confirm_password")}
                  required
                  type="password"
                  placeholder={t("confirm_password")}
                  className="form-control input-lg rounded"
                  value={selectedChild.confirm_password}
                  onChange={(e) => {
                    setSelectedChild({
                      ...selectedChild,
                      confirm_password: e.target.value,
                    });
                  }}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-primary" type="submit">
                {/* Request Visit */}
                {t("submit")}
              </button>
            </Modal.Footer>
          </form>
        </Modal>
        <AccountLayout
          title={t("child_accounts")}
          subTitle={t("you_have_full_control_to_manage_your_own_account")}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
              alignItems: "flex-end",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "100%",
              }}
            >
              <label htmlFor="name" className="form-label">
                Search
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <input
                  name="name"
                  required
                  type="text"
                  placeholder="Name"
                  className="form-control input-lg rounded"
                  style={{
                    height: "40px",
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    setOpenAddChildModal({
                      open: true,
                      isEdit: false,
                    });
                    setSelectedChild({
                      first_name: "",
                      last_name: "",
                      password: "",
                      confirm_password: "",
                      phone_number: "",
                      id: 0,
                    });
                  }}
                  style={{
                    textAlign: "center",
                  }}
                >
                  <i
                    className="fa fa-plus"
                    style={{
                      color: "white",
                      fontWeight: "normal",
                    }}
                    aria-hidden="true"
                  ></i>
                </Button>
              </div>
            </div>
          </div>

          <div className="card">
            <div
            // style={{
            //   maxHeight: "500px",
            //   overflowY: "auto",
            // }}
            >
              <table className="table mb-0 child_table">
                <thead
                  style={{
                    position: "sticky",
                    top: "0",
                    backgroundColor: "white",
                    overflow: "visible",
                  }}
                >
                  <tr>
                    <th>{t("usercode")}</th>
                    <th>{t("firstname")}</th>
                    <th>{t("lastname")}</th>
                    <th>{t("created")}</th>
                    <th>{t("status")}</th>

                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {childUsers.map((child) => (
                    <tr key={child.id}>
                      <td className="py-3">
                        <div
                          className="nav-link-style fw-medium fs-sm text-primary 
                          font-weight-bold"
                          data-bs-toggle="modal"
                        >
                          {child.code}
                        </div>
                      </td>
                      <td className="py-3">{child.first_name}</td>
                      <td className="py-3">{child.last_name}</td>
                      <td className="py-3">
                        {new Date(child.date_added).toLocaleString("default", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <span
                          className={
                            "badge m-0 text-uppercase " +
                            (child.is_blocked
                              ? "bg-soft-warning"
                              : "bg-soft-success")
                          }
                        >
                          {child.is_blocked ? t("disabled") : t("active")}
                        </span>
                      </td>
                      <td className="py-3">
                        <DropdownButton
                          as={ButtonGroup}
                          title={
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          }
                          size="sm"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                          }}
                        >
                          <Dropdown.Item
                            eventKey="1"
                            onClick={() => {
                              setSelectedChild({
                                first_name: child.first_name,
                                last_name: child.last_name,
                                password: "",
                                confirm_password: "",
                                phone_number: child.phone,
                                id: child.id,
                              });
                              setOpenAddChildModal({
                                open: true,
                                isEdit: true,
                              });
                            }}
                          >
                            {" "}
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            eventKey="2"
                            onClick={() => {
                              if (child.is_blocked) {
                                enableChild(child.id)
                                  .then((res) => {
                                    toast.success(res.data.message);
                                    fetchChildUsers();
                                  })
                                  .catch((error) => {
                                    toast.error(error.response.data.message);
                                  });
                              } else {
                                disableChild(child.id)
                                  .then((res) => {
                                    toast.success(res.data.message);
                                    fetchChildUsers();
                                  })
                                  .catch((error) => {
                                    toast.error(error.response.data.message);
                                  });
                              }
                            }}
                            style={{
                              color: child.is_blocked ? "#2f9e44" : "#ffa94d",
                            }}
                          >
                            {child.is_blocked ? "Activate" : "Disable"}
                          </Dropdown.Item>
                          <Dropdown.Item
                            eventKey="3"
                            onClick={() => {
                              setEditPermissionsState({
                                id: child.id,
                                user_code: child.code,
                                description:
                                  child.first_name + " " + child.last_name,
                                warehouse_code: "d",
                                user_permissions:
                                  child?.user_permission_assignment?.map(
                                    (permission) => {
                                      return permission.user_permission;
                                    }
                                  ),
                              });
                            }}
                          >
                            Edit Permissions
                          </Dropdown.Item>
                          <Dropdown.Item
                            eventKey="4"
                            style={{
                              color: "#fff",
                              backgroundColor: "#e03131",
                            }}
                            onClick={() => {
                              prompt(
                                "Are you sure you want to delete this user? Type 'yes' to confirm",
                                "no"
                              ) === "yes" &&
                                deleteChild(child.id)
                                  .then((res) => {
                                    toast.success(res.data.message);
                                    fetchChildUsers();
                                  })
                                  .catch((error) => {
                                    toast.error(error.response.data.message);
                                  });
                            }}
                          >
                            Delete User
                          </Dropdown.Item>

                          <Dropdown.Divider />
                          <Dropdown.Item eventKey="4">Login AS</Dropdown.Item>
                        </DropdownButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AccountLayout>
      </Layout>
    </>
  );
};

export default ChildAccountSettings;
