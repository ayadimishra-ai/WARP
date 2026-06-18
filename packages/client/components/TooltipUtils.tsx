import { Anchor, Text, Tooltip } from "@mantine/core";
import React, { FC, useRef, useState } from "react";

// Common interface for tooltip components
interface TooltipComponentProps {
  children: React.ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
  withArrow?: boolean;
  multiline?: boolean;
  arrowSize?: number;
  openDelay?: number;
  closeDelay?: number;
  width?: number;
  [key: string]: any;
}

// Hook to handle overflow detection logic
const useOverflowDetection = <T extends HTMLElement>() => {
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<T>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      const element = ref.current;
      // Check if text is overflowing horizontally or vertically
      const isOverflowing =
        element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight;
      setShowTooltip(isOverflowing);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return {
    ref,
    showTooltip,
    handleMouseEnter,
    handleMouseLeave,
  };
};

// Reusable Text component with conditional tooltip
export const TextWithTooltip: FC<TooltipComponentProps> = ({
  children,
  text,
  position = "bottom",
  withArrow = true,
  multiline = true,
  arrowSize = 10,
  openDelay = 50,
  closeDelay = 50,
  ...props
}) => {
  const { ref, showTooltip, handleMouseEnter, handleMouseLeave } =
    useOverflowDetection<HTMLDivElement>();

  return (
    <Tooltip
      label={text}
      opened={showTooltip}
      position={position}
      withArrow={withArrow}
      multiline={multiline}
      arrowSize={arrowSize}
      openDelay={openDelay}
      closeDelay={closeDelay}
      withinPortal
    >
      <Text
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lineClamp={1}
        {...props}
      >
        {children}
      </Text>
    </Tooltip>
  );
};

// Reusable Anchor component with conditional tooltip
export const AnchorWithTooltip: FC<TooltipComponentProps> = ({
  children,
  text,
  position = "bottom",
  withArrow = true,
  multiline = true,
  arrowSize = 10,
  openDelay = 50,
  closeDelay = 50,
  ...props
}) => {
  const { ref, showTooltip, handleMouseEnter, handleMouseLeave } =
    useOverflowDetection<HTMLAnchorElement>();

  return (
    <Tooltip
      label={text}
      opened={showTooltip}
      position={position}
      withArrow={withArrow}
      multiline={multiline}
      arrowSize={arrowSize}
      openDelay={openDelay}
      closeDelay={closeDelay}
      withinPortal
    >
      <Anchor
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lineClamp={1}
        {...props}
      >
        {children}
      </Anchor>
    </Tooltip>
  );
};

// Generic wrapper component for any element with tooltip
export const ElementWithTooltip: FC<{
  element: React.ComponentType<any>;
  children: React.ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
  withArrow?: boolean;
  multiline?: boolean;
  arrowSize?: number;
  openDelay?: number;
  closeDelay?: number;
  [key: string]: any;
}> = ({
  element: Element,
  children,
  text,
  position = "bottom",
  withArrow = true,
  multiline = true,
  arrowSize = 10,
  openDelay = 50,
  closeDelay = 50,
  ...props
}) => {
  const { ref, showTooltip, handleMouseEnter, handleMouseLeave } =
    useOverflowDetection<HTMLElement>();

  return (
    <Tooltip
      label={text}
      opened={showTooltip}
      position={position}
      withArrow={withArrow}
      multiline={multiline}
      arrowSize={arrowSize}
      openDelay={openDelay}
      closeDelay={closeDelay}
    >
      <Element
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Element>
    </Tooltip>
  );
};

// Utility function to check if an element has overflow (can be used independently)
export const checkElementOverflow = (element: HTMLElement): boolean => {
  return (
    element.scrollWidth > element.clientWidth ||
    element.scrollHeight > element.clientHeight
  );
};

// Higher-order component to add tooltip functionality to any component
export const withTooltipOnOverflow = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return React.forwardRef<HTMLElement, P & { tooltipText?: string }>(
    (props, ref) => {
      const { tooltipText, ...restProps } = props;
      const [showTooltip, setShowTooltip] = useState(false);
      const elementRef = useRef<HTMLElement>(null);

      const handleMouseEnter = () => {
        const element = elementRef.current || (ref as any)?.current;
        if (element && tooltipText) {
          const isOverflowing = checkElementOverflow(element);
          setShowTooltip(isOverflowing);
        }
      };

      const handleMouseLeave = () => {
        setShowTooltip(false);
      };

      if (!tooltipText) {
        return <WrappedComponent {...(restProps as P)} ref={ref} />;
      }

      return (
        <Tooltip
          label={tooltipText}
          opened={showTooltip}
          position="bottom"
          withArrow
        >
          <WrappedComponent
            {...(restProps as P)}
            ref={ref || elementRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </Tooltip>
      );
    }
  );
};
