import { Button } from "react-bootstrap";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Alternative {
  alternative_item_code: string;
  priority: number;
  name: string;
  image?: string; // optional image URL
}

interface Props {
  alternatives: Alternative[];
  setAlternatives: (alts: Alternative[]) => void;
}

// =========================
// Single draggable item
// =========================
const SortableItem = ({
  id,
  index,
  alt,
  onRemove,
}: {
  id: string;
  index: number;
  alt: Alternative;
  onRemove: (index: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="d-flex justify-content-between align-items-center border rounded p-2 mb-2 bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: "grab" }}
        className="d-flex align-items-center gap-2"
      >
        <span style={{ fontWeight: "bold", width: 24 }}>{index + 1}</span>

        {/* Item Image */}
        {alt.image && (
          <img
            src={alt.image}
            alt={alt.name}
            style={{
              width: 32,
              height: 32,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        )}

        {/* Item Info */}
        <div>
          <div style={{ fontWeight: 500 }}>{alt.name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {alt.alternative_item_code}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => onRemove(index)}
      >
        ✕
      </Button>
    </div>
  );
};

// =========================
// Drag & Drop Container
// =========================
const SortableAlternatives = ({ alternatives, setAlternatives }: Props) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = alternatives.findIndex(
      (a) => a.alternative_item_code === active.id,
    );
    const newIndex = alternatives.findIndex(
      (a) => a.alternative_item_code === over.id,
    );

    const newArr = arrayMove(alternatives, oldIndex, newIndex);
    setAlternatives(newArr.map((a, i) => ({ ...a, priority: i + 1 })));
  };

  const removeItem = (index: number) => {
    setAlternatives(
      alternatives
        .filter((_, i) => i !== index)
        .map((a, i) => ({ ...a, priority: i + 1 })),
    );
  };

  return (
    <div
      className="border rounded p-2 mt-2"
      style={{ maxHeight: "20rem", overflowY: "auto", background: "#fafafa" }}
    >
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={alternatives.map((a) => a.alternative_item_code)}
          strategy={verticalListSortingStrategy}
        >
          {alternatives.map((alt, index) => (
            <SortableItem
              key={alt.alternative_item_code}
              id={alt.alternative_item_code}
              index={index}
              alt={alt}
              onRemove={removeItem}
            />
          ))}
        </SortableContext>
      </DndContext>

      {alternatives.length === 0 && (
        <div className="text-center text-muted p-2">
          No alternatives selected
        </div>
      )}
    </div>
  );
};

export default SortableAlternatives;
