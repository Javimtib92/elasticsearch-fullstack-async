import { Filter } from "@/components/filter";
import { ComboBoxResponsive } from "@/components/ui/combo-box";

const options = [
  { label: "Hombre", value: "Hombre" },
  { label: "Mujer", value: "Mujer" },
];

export function GenderFilter({
  initialValue,
  onSelectedChange,
}: { initialValue?: string; onSelectedChange?: (value: string) => void }) {
  return (
    <ComboBoxResponsive
      label="Filtrar genero"
      initialValue={options.find((o) => o.value === initialValue) || null}
      content={<Filter options={options} onSelectedChange={onSelectedChange} />}
    />
  );
}
