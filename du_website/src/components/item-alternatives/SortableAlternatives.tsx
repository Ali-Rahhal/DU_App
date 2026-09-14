import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

interface Alternative {
  alternative_item_code: string;
  priority: number;
  name: string;
  image?: string;
}

interface Props {
  alternatives: Alternative[];
  setAlternatives: (alts: Alternative[]) => void;
}

// =========================================================
// Single draggable item
// =========================================================

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
    <div ref={setNodeRef} style={style} className="sortable-alternative-item">
      <button
        type="button"
        className="sortable-alternative-drag"
        {...attributes}
        {...listeners}
        aria-label="Drag alternative"
      >
        <GripVertical size={18} />
      </button>

      <div className="sortable-alternative-priority">{index + 1}</div>

      <div className="sortable-alternative-image">
        {alt.image && <img src={alt.image} alt={alt.name} />}
      </div>

      <div className="sortable-alternative-info">
        <strong>{alt.name}</strong>

        <span>{alt.alternative_item_code}</span>
      </div>

      <button
        type="button"
        className="sortable-alternative-remove"
        onClick={() => onRemove(index)}
        aria-label={`Remove ${alt.name}`}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// =========================================================
// Drag & Drop Container
// =========================================================

const SortableAlternatives = ({ alternatives, setAlternatives }: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = alternatives.findIndex(
      (a) => a.alternative_item_code === active.id,
    );

    const newIndex = alternatives.findIndex(
      (a) => a.alternative_item_code === over.id,
    );

    const newArr = arrayMove(alternatives, oldIndex, newIndex);

    setAlternatives(
      newArr.map((a, i) => ({
        ...a,
        priority: i + 1,
      })),
    );
  };

  const removeItem = (index: number) => {
    setAlternatives(
      alternatives
        .filter((_, i) => i !== index)
        .map((a, i) => ({
          ...a,
          priority: i + 1,
        })),
    );
  };

  return (
    <div className="sortable-alternatives-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
        <div className="sortable-alternatives-empty">
          <span>No alternatives selected</span>
        </div>
      )}
    </div>
  );
};

export default SortableAlternatives;
