import { useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { Button } from "react-bootstrap";

interface Props {
  children: React.ReactNode;
}

const TableActionsMenu = ({ children }: Props) => {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <>
      <Button
        variant="light"
        size="sm"
        ref={refs.setReference}
        {...getReferenceProps()}
        className="border rounded-circle px-2"
        style={{ width: 36, height: 36 }}
      >
        <i className="fa fa-ellipsis-v"></i>
      </Button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="shadow rounded-3 bg-white border"
          >
            {children}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default TableActionsMenu;
