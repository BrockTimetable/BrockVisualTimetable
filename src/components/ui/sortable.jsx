import PropTypes from "prop-types";
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  defaultDropAnimationSideEffects,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const orientationConfig = {
  vertical: {
    modifiers: [restrictToVerticalAxis, restrictToParentElement],
    strategy: verticalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  horizontal: {
    modifiers: [restrictToHorizontalAxis, restrictToParentElement],
    strategy: horizontalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  mixed: {
    modifiers: [restrictToParentElement],
    strategy: undefined,
    collisionDetection: closestCorners,
  },
};

const ROOT_NAME = "Sortable";
const CONTENT_NAME = "SortableContent";
const ITEM_NAME = "SortableItem";
const ITEM_HANDLE_NAME = "SortableItemHandle";
const OVERLAY_NAME = "SortableOverlay";

const SortableRootContext = React.createContext(null);

function useSortableContext(consumerName) {
  const context = React.useContext(SortableRootContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function Sortable(props) {
  const {
    value,
    onValueChange,
    collisionDetection,
    modifiers,
    strategy,
    onMove,
    orientation = "vertical",
    flatCursor = false,
    getItemValue: getItemValueProp,
    accessibility,
    onDragStart: onDragStartProp,
    onDragEnd: onDragEndProp,
    onDragCancel: onDragCancelProp,
    ...sortableProps
  } = props;

  const id = React.useId();
  const [activeId, setActiveId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const config = React.useMemo(
    () => orientationConfig[orientation],
    [orientation],
  );

  const getItemValue = React.useCallback(
    (item) => {
      if (typeof item === "object" && !getItemValueProp) {
        throw new Error(
          "`getItemValue` is required when using array of objects",
        );
      }
      return getItemValueProp ? getItemValueProp(item) : item;
    },
    [getItemValueProp],
  );

  const items = React.useMemo(() => {
    return value.map((item) => getItemValue(item));
  }, [value, getItemValue]);

  const onDragStart = React.useCallback(
    (event) => {
      onDragStartProp?.(event);

      if (event.activatorEvent.defaultPrevented) return;

      setActiveId(event.active.id);
    },
    [onDragStartProp],
  );

  const onDragEnd = React.useCallback(
    (event) => {
      onDragEndProp?.(event);

      if (event.activatorEvent.defaultPrevented) return;

      const { active, over } = event;
      if (over && active.id !== over?.id) {
        const activeIndex = value.findIndex(
          (item) => getItemValue(item) === active.id,
        );
        const overIndex = value.findIndex(
          (item) => getItemValue(item) === over.id,
        );

        if (onMove) {
          onMove({ ...event, activeIndex, overIndex });
        } else {
          onValueChange?.(arrayMove(value, activeIndex, overIndex));
        }
      }
      setActiveId(null);
    },
    [value, onValueChange, onMove, getItemValue, onDragEndProp],
  );

  const onDragCancel = React.useCallback(
    (event) => {
      onDragCancelProp?.(event);

      if (event.activatorEvent.defaultPrevented) return;

      setActiveId(null);
    },
    [onDragCancelProp],
  );

  const announcements = React.useMemo(
    () => ({
      onDragStart({ active }) {
        const activeValue = active.id.toString();
        return `Grabbed sortable item "${activeValue}". Current position is ${active.data.current?.sortable.index + 1} of ${value.length}. Use arrow keys to move, space to drop.`;
      },
      onDragOver({ active, over }) {
        if (over) {
          const overIndex = over.data.current?.sortable.index ?? 0;
          const activeIndex = active.data.current?.sortable.index ?? 0;
          const moveDirection = overIndex > activeIndex ? "down" : "up";
          const activeValue = active.id.toString();
          return `Sortable item "${activeValue}" moved ${moveDirection} to position ${overIndex + 1} of ${value.length}.`;
        }
        return "Sortable item is no longer over a droppable area. Press escape to cancel.";
      },
      onDragEnd({ active, over }) {
        const activeValue = active.id.toString();
        if (over) {
          const overIndex = over.data.current?.sortable.index ?? 0;
          return `Sortable item "${activeValue}" dropped at position ${overIndex + 1} of ${value.length}.`;
        }
        return `Sortable item "${activeValue}" dropped. No changes were made.`;
      },
      onDragCancel({ active }) {
        const activeIndex = active.data.current?.sortable.index ?? 0;
        const activeValue = active.id.toString();
        return `Sorting cancelled. Sortable item "${activeValue}" returned to position ${activeIndex + 1} of ${value.length}.`;
      },
      onDragMove({ active, over }) {
        if (over) {
          const overIndex = over.data.current?.sortable.index ?? 0;
          const activeIndex = active.data.current?.sortable.index ?? 0;
          const moveDirection = overIndex > activeIndex ? "down" : "up";
          const activeValue = active.id.toString();
          return `Sortable item "${activeValue}" is moving ${moveDirection} to position ${overIndex + 1} of ${value.length}.`;
        }
        return "Sortable item is no longer over a droppable area. Press escape to cancel.";
      },
    }),
    [value],
  );

  const screenReaderInstructions = React.useMemo(
    () => ({
      draggable: `
      To pick up a sortable item, press space or enter.
      While dragging, use the ${orientation === "vertical" ? "up and down" : orientation === "horizontal" ? "left and right" : "arrow"} keys to move the item.
      Press space or enter again to drop the item in its new position, or press escape to cancel.
    `,
    }),
    [orientation],
  );

  const contextValue = React.useMemo(
    () => ({
      id,
      items,
      modifiers: modifiers ?? config.modifiers,
      strategy: strategy ?? config.strategy,
      activeId,
      setActiveId,
      getItemValue,
      flatCursor,
    }),
    [
      id,
      items,
      modifiers,
      strategy,
      config.modifiers,
      config.strategy,
      activeId,
      getItemValue,
      flatCursor,
    ],
  );

  return (
    <SortableRootContext.Provider value={contextValue}>
      <DndContext
        collisionDetection={collisionDetection ?? config.collisionDetection}
        modifiers={modifiers ?? config.modifiers}
        sensors={sensors}
        {...sortableProps}
        id={id}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions,
          ...accessibility,
        }}
      />
    </SortableRootContext.Provider>
  );
}

const SortableContentContext = React.createContext(false);

function SortableContent(props) {
  const {
    strategy: strategyProp,
    asChild,
    withoutSlot,
    children,
    ref,
    ...contentProps
  } = props;

  const context = useSortableContext(CONTENT_NAME);

  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SortableContentContext.Provider value={true}>
      <SortableContext
        items={context.items}
        strategy={strategyProp ?? context.strategy}
      >
        {withoutSlot ? (
          children
        ) : (
          <ContentPrimitive
            data-slot="sortable-content"
            {...contentProps}
            ref={ref}
          >
            {children}
          </ContentPrimitive>
        )}
      </SortableContext>
    </SortableContentContext.Provider>
  );
}

const SortableItemContext = React.createContext(null);

function useSortableItemContext(consumerName) {
  const context = React.useContext(SortableItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

function SortableItem(props) {
  const {
    value,
    style,
    asHandle,
    asChild,
    disabled,
    className,
    ref,
    ...itemProps
  } = props;

  const inSortableContent = React.useContext(SortableContentContext);
  const inSortableOverlay = React.useContext(SortableOverlayContext);

  if (!inSortableContent && !inSortableOverlay) {
    throw new Error(
      `\`${ITEM_NAME}\` must be used within \`${CONTENT_NAME}\` or \`${OVERLAY_NAME}\``,
    );
  }

  if (value === "") {
    throw new Error(`\`${ITEM_NAME}\` value cannot be an empty string`);
  }

  const context = useSortableContext(ITEM_NAME);
  const id = React.useId();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value, disabled });

  const composedRef = useComposedRefs(ref, (node) => {
    if (disabled) return;
    setNodeRef(node);
    if (asHandle) setActivatorNodeRef(node);
  });

  const composedStyle = React.useMemo(() => {
    return {
      transform: CSS.Translate.toString(transform),
      transition,
      ...style,
    };
  }, [transform, transition, style]);

  const itemContext = React.useMemo(
    () => ({
      id,
      attributes,
      listeners,
      setActivatorNodeRef,
      isDragging,
      disabled,
    }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled],
  );

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SortableItemContext.Provider value={itemContext}>
      <ItemPrimitive
        id={id}
        data-disabled={disabled}
        data-dragging={isDragging ? "" : undefined}
        data-slot="sortable-item"
        {...itemProps}
        {...(asHandle && !disabled ? attributes : {})}
        {...(asHandle && !disabled ? listeners : {})}
        ref={composedRef}
        style={composedStyle}
        className={cn(
          "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
          {
            "touch-none select-none": asHandle,
            "cursor-default": context.flatCursor,
            "data-dragging:cursor-grabbing": !context.flatCursor,
            "cursor-grab": !isDragging && asHandle && !context.flatCursor,
            "opacity-50": isDragging,
            "pointer-events-none opacity-50": disabled,
          },
          className,
        )}
      />
    </SortableItemContext.Provider>
  );
}

function SortableItemHandle(props) {
  const { asChild, disabled, className, ref, style, ...itemHandleProps } =
    props;

  const context = useSortableContext(ITEM_HANDLE_NAME);
  const itemContext = useSortableItemContext(ITEM_HANDLE_NAME);

  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = useComposedRefs(ref, (node) => {
    if (isDisabled) return;
    itemContext.setActivatorNodeRef(node);
  });

  const HandlePrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-disabled={isDisabled}
      data-dragging={itemContext.isDragging ? "" : undefined}
      data-slot="sortable-item-handle"
      {...itemHandleProps}
      {...(isDisabled ? {} : itemContext.attributes)}
      {...(isDisabled ? {} : itemContext.listeners)}
      ref={composedRef}
      style={{ touchAction: "none", WebkitTouchCallout: "none", ...style }}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

const SortableOverlayContext = React.createContext(false);

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

function SortableOverlay(props) {
  const { container: containerProp, children, ...overlayProps } = props;

  const context = useSortableContext(OVERLAY_NAME);

  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => setMounted(true), []);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  return ReactDOM.createPortal(
    <DragOverlay
      dropAnimation={dropAnimation}
      modifiers={context.modifiers}
      className={cn(!context.flatCursor && "cursor-grabbing")}
      {...overlayProps}
    >
      <SortableOverlayContext.Provider value={true}>
        {context.activeId
          ? typeof children === "function"
            ? children({ value: context.activeId })
            : children
          : null}
      </SortableOverlayContext.Provider>
    </DragOverlay>,
    container,
  );
}

export {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
};

const refPropType = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({ current: PropTypes.any }),
]);

Sortable.propTypes = {
  value: PropTypes.array.isRequired,
  onValueChange: PropTypes.func,
  collisionDetection: PropTypes.func,
  modifiers: PropTypes.array,
  strategy: PropTypes.func,
  onMove: PropTypes.func,
  orientation: PropTypes.oneOf(["vertical", "horizontal", "mixed"]),
  flatCursor: PropTypes.bool,
  getItemValue: PropTypes.func,
  accessibility: PropTypes.object,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragCancel: PropTypes.func,
  children: PropTypes.node,
};

SortableContent.propTypes = {
  strategy: PropTypes.func,
  asChild: PropTypes.bool,
  withoutSlot: PropTypes.bool,
  children: PropTypes.node,
  ref: refPropType,
  className: PropTypes.string,
};

SortableItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  style: PropTypes.object,
  asHandle: PropTypes.bool,
  asChild: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  ref: refPropType,
  children: PropTypes.node,
};

SortableItemHandle.propTypes = {
  asChild: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  ref: refPropType,
  style: PropTypes.object,
  children: PropTypes.node,
};

SortableOverlay.propTypes = {
  container: PropTypes.instanceOf(
    typeof Element === "undefined" ? Object : Element,
  ),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
