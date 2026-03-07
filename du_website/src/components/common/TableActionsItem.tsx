interface Props {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const TableActionsItem = ({ icon, label, onClick, danger }: Props) => {
  return (
    <button
      onClick={onClick}
      className="table-action-item d-flex align-items-center w-100 px-3 py-2 border-0 text-start"
      style={{
        fontSize: 14,
        cursor: "pointer",
        color: danger ? "#dc3545" : "#212529",
        background: "transparent",
      }}
    >
      <i className={`fa ${icon} me-2`} />
      {label}
    </button>
  );
};

export default TableActionsItem;
