import { Badge } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { User } from "@/types/usersTypes";
import { ROLES } from "@/utils/data";
import TableActionsMenu from "@/components/common/TableActionsMenu";
import TableActionsItem from "@/components/common/TableActionsItem";

interface Props {
  users: User[];
  loading: boolean;
  onEdit: (id: number, role: string) => void;
  onPermissions: (user: User) => void;
  onToggle: (id: number) => void;
}

const getUserRole = (role: string | null, t: any) => {
  switch (role) {
    case ROLES.User:
      return {
        label: t("users.table.role_user"),
        bg: "light",
        text: "dark",
      };

    case ROLES.SysUser:
      return {
        label: t("users.table.role_sysuser"),
        bg: "primary",
      };

    case ROLES.Admin:
      return {
        label: t("users.table.role_admin"),
        bg: "danger",
      };

    default:
      return {
        label: t("users.table.role_unknown"),
        bg: "warning",
        text: "dark",
      };
  }
};

const UsersCards = ({
  users,
  loading,
  onEdit,
  onPermissions,
  onToggle,
}: Props) => {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="users-mobile-loading">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <div className="users-mobile-view">
      {users.map((user) => {
        const role = getUserRole(user.role, t);

        return (
          <div key={user.id} className="users-mobile-card">
            <div className="users-mobile-card-body">
              {/* Header */}
              <div className="users-mobile-header">
                <div>
                  <div className="users-mobile-name">
                    {user.first_name} {user.last_name}
                  </div>

                  <div className="users-mobile-code">#{user.code}</div>
                </div>

                <TableActionsMenu>
                  <TableActionsItem
                    icon="fa-edit"
                    label={t("users.table.edit")}
                    onClick={() => onEdit(user.id, user.role)}
                  />

                  {user.role === ROLES.SysUser && (
                    <TableActionsItem
                      icon="fa-key"
                      label={t("users.table.permissions")}
                      onClick={() => onPermissions(user)}
                    />
                  )}

                  <hr className="my-1" />

                  <TableActionsItem
                    icon="fa-ban"
                    label={
                      user.is_active
                        ? t("users.table.deactivate")
                        : t("users.table.activate")
                    }
                    onClick={() => onToggle(user.id)}
                    danger
                  />
                </TableActionsMenu>
              </div>

              {/* Details */}
              <div className="users-mobile-info">
                <div className="users-mobile-field">
                  <span className="users-mobile-label">
                    {t("users.table.role")}
                  </span>

                  <Badge bg={role.bg} text={role.text || "white"}>
                    {role.label}
                  </Badge>
                </div>

                <div className="users-mobile-field">
                  <span className="users-mobile-label">
                    {t("users.table.status")}
                  </span>

                  <Badge bg={user.is_active ? "success" : "warning"}>
                    {user.is_active
                      ? t("users.table.active")
                      : t("users.table.inactive")}
                  </Badge>
                </div>

                <div className="users-mobile-field">
                  <span className="users-mobile-label">
                    {t("users.table.joined")}
                  </span>

                  <span className="users-mobile-value">
                    {new Date(user.date_added).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsersCards;
