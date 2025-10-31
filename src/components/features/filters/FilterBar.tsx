import { memo } from "react";
import FloatingFilterBar from "./FloatingFilterBar";
import ActivitiesFilterBar from "@/components/pages/_Activities/components/ActivitiesFilterBar";
import type { Prestador } from "@/components/pages/_Activities/types";

type FilterBarProps =
  | {
      variant: "home";
    }
  | {
      variant: "activities";
      onResults: (prestadores: Prestador[]) => void;
      basePrestadores: Prestador[];
      onOpenPanel?: () => void;
      panelOpen?: boolean;
    };

const FilterBar = memo((props: FilterBarProps) => {
  if (props.variant === "home") {
    return <FloatingFilterBar />;
  }
  return (
    <ActivitiesFilterBar
      onResults={props.onResults}
      basePrestadores={props.basePrestadores}
      onOpenPanel={props.onOpenPanel}
      panelOpen={props.panelOpen}
    />
  );
});

FilterBar.displayName = "FilterBar";

export default FilterBar;
