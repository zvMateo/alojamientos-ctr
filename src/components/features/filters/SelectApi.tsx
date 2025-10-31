import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface SelectApiProps {
  value?: string;
  onChange: (value?: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  widthClass?: string; // por defecto w-48
}

const SelectApi = memo(
  ({
    value,
    onChange,
    options,
    placeholder,
    disabled,
    className,
    widthClass,
  }: SelectApiProps) => {
    return (
      <Select
        value={value || ""}
        onValueChange={(v) => onChange(v || undefined)}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${widthClass || "w-48"} h-10 ${className || ""}`}
        >
          <SelectValue placeholder={placeholder || "Seleccionar"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

SelectApi.displayName = "SelectApi";

export default SelectApi;
