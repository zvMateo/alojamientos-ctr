import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  onSubmit?: () => void;
}

const SearchInput = memo(
  ({
    value,
    onChange,
    placeholder,
    isLoading,
    className,
    onSubmit,
  }: SearchInputProps) => {
    return (
      <div className={`relative ${className || ""}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={placeholder || "Buscar..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 h-10 text-sm"
          aria-label="Buscar"
          inputMode="search"
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit?.();
            }
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {!!value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center text-gray-500 hover:text-gray-700"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
