import { Table, Badge, Spinner } from "react-bootstrap";
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

const getUserRole = (role: string | null) => {
  switch (role) {
    case ROLES.User:
      return { label: "User", bg: "light", text: "dark" };
    case ROLES.SysUser:
      return { label: "SysUser", bg: "primary" };
    case ROLES.Admin:
      return { label: "Admin", bg: "danger" };
    default:
      return { label: "Unknown", bg: "warning", text: "dark" };
  }
};

const UsersTable = ({
  users,
  loading,
  onEdit,
  onPermissions,
  onToggle,
}: Props) => {
  return (
    <Table hover className="mb-0 align-middle">
      <thead className="bg-light small text-uppercase text-muted">
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Role</th>
          <th>Status</th>
          <th>Joined</th>
          <th className="text-center">Actions</th>
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
            const role = getUserRole(user.role);

            return (
              <tr key={user.id}>
                <td>{user.code}</td>

                <td>
                  {user.first_name} {user.last_name}
                </td>

                <td>
                  <Badge bg={role.bg} text={role.text || "white"}>
                    {" "}
                    {role.label}{" "}
                  </Badge>
                </td>

                <td>
                  <Badge
                    bg={user.is_active ? "success" : "warning"}
                    text="white"
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>

                <td>{new Date(user.date_added).toLocaleDateString()}</td>

                <td className="text-center">
                  <TableActionsMenu>
                    <TableActionsItem
                      icon="fa-edit"
                      label="Edit"
                      onClick={() => onEdit(user.id, user.role)}
                    />

                    {user.role === ROLES.SysUser && (
                      <TableActionsItem
                        icon="fa-key"
                        label="Permissions"
                        onClick={() => onPermissions(user)}
                      />
                    )}

                    <hr className="my-1" />

                    <TableActionsItem
                      icon="fa-ban"
                      label={user.is_active ? "Deactivate" : "Activate"}
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
