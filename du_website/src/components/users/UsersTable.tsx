import { Table, Badge, Spinner } from "react-bootstrap";
import { useTranslations } from "next-intl";
import TableActionsMenu from "@/components/common/TableActionsMenu";
import TableActionsItem from "@/components/common/TableActionsItem";
import { User } from "@/types/usersTypes";
import { ROLES } from "@/utils/data";

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
      return { label: t("users.table.role_user"), bg: "light", text: "dark" };
    case ROLES.SysUser:
      return { label: t("users.table.role_sysuser"), bg: "primary" };
    case ROLES.Admin:
      return { label: t("users.table.role_admin"), bg: "danger" };
    default:
      return {
        label: t("users.table.role_unknown"),
        bg: "warning",
        text: "dark",
      };
  }
};

const UsersTable = ({
  users,
  loading,
  onEdit,
  onPermissions,
  onToggle,
}: Props) => {
  const t = useTranslations();

  return (
    <Table hover className="mb-0 align-middle">
      <thead className="bg-light small text-uppercase text-muted">
        <tr>
          <th>{t("users.table.code")}</th>
          <th>{t("users.table.name")}</th>
          <th>{t("users.table.role")}</th>
          <th>{t("users.table.status")}</th>
          <th>{t("users.table.joined")}</th>
          <th className="text-center">{t("users.table.actions")}</th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={6} className="text-center py-5">
              <Spinner animation="border" />
            </td>
          </tr>
        ) : (
          users.map((user) => {
            const role = getUserRole(user.role, t);

            return (
              <tr key={user.id}>
                <td>{user.code}</td>

                <td>
                  {user.first_name} {user.last_name}
                </td>

                <td>
                  <Badge bg={role.bg} text={role.text || "white"}>
                    {role.label}
                  </Badge>
                </td>

                <td>
                  <Badge
                    bg={user.is_active ? "success" : "warning"}
                    text="white"
                  >
                    {user.is_active
                      ? t("users.table.active")
                      : t("users.table.inactive")}
                  </Badge>
                </td>

                <td>{new Date(user.date_added).toLocaleDateString()}</td>

                <td className="text-center">
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
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </Table>
  );
};

export default UsersTable;
