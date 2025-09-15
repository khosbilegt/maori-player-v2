import * as React from "react";
import { cn } from "@/lib/utils";

// Simple chevron down icon component
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: () => void;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

function Select({
  value,
  onValueChange,
  placeholder,
  children,
  disabled,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);

  return (
    <span className={cn(!value && "text-muted-foreground")}>
      {value || placeholder}
    </span>
  );
}

function SelectContent({ children }: SelectContentProps) {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
      <div className="p-1">{children}</div>
    </div>
  );
}

function SelectItem({ value, children, onSelect }: SelectItemProps) {
  const {
    value: selectedValue,
    onValueChange,
    setIsOpen,
  } = React.useContext(SelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    setIsOpen(false);
    onSelect?.();
  };

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        selectedValue === value && "bg-accent text-accent-foreground"
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

// Click outside to close
function SelectOverlay() {
  const { setIsOpen } = React.useContext(SelectContext);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-select]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return null;
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectOverlay,
};
