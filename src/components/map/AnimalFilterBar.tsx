import "./AnimalFilterBar.css";
import { useAnimals } from "../../hooks/useAnimals";
import type { Animal } from "../../types";

interface Props {
  selectedId: number | null;
  onChange: (id: number | null) => void;
}

export default function AnimalFilterBar({ selectedId, onChange }: Props) {
  const { animals, loading } = useAnimals();

  if (loading) return null;

  return (
    <div className="filter-bar">
      <button
        className={`filter-chip ${selectedId === null ? "filter-chip-active" : ""}`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {animals.map((animal: Animal) => (
        <button
          key={animal.id}
          className={`filter-chip ${selectedId === animal.id ? "filter-chip-active" : ""}`}
          onClick={() => onChange(selectedId === animal.id ? null : animal.id)}
        >
          {animal.common_name}
        </button>
      ))}
    </div>
  );
}
