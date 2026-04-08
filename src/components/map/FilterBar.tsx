import { useState } from "react";
import { useAnimals } from "../../hooks/useAnimals";
import "./FilterBar.css";

export interface FilterState {
  animalId: number | null;
  verifiedOnly: boolean;
  hasPhoto: boolean;
  maxAgeHours: number;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const MAX_AGE_MAX = 48;
const MAX_AGE_MIN = 2;
const MAX_AGE_DEFAULT = 12;

function activeFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.animalId !== null) count++;
  if (filters.verifiedOnly) count++;
  if (filters.hasPhoto) count++;
  if (filters.maxAgeHours < MAX_AGE_MAX) count++;
  return count;
}

function formatAge(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

export default function FilterBar({ filters, onChange }: Props) {
  const { animals, loading } = useAnimals();
  const [open, setOpen] = useState(false);

  function update(patch: Partial<FilterState>) {
    onChange({ ...filters, ...patch });
  }

  function reset() {
    onChange({
      animalId: null,
      verifiedOnly: false,
      hasPhoto: false,
      maxAgeHours: MAX_AGE_DEFAULT,
    });
  }

  const count = activeFilterCount(filters);

  return (
    <div className="filter-root">
      <div className="filter-bar">
        <button
          className={`filter-toggle ${open ? "filter-toggle-open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle filters"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M1 3h13M3 7.5h9M5.5 12h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Filters
          {count > 0 && <span className="filter-count">{count}</span>}
        </button>

        {count > 0 && (
          <button
            className="filter-reset"
            onClick={reset}
            aria-label="Clear filters"
          >
            Clear
          </button>
        )}

        <div className="filter-summary">
          {filters.animalId !== null && !loading && (
            <span className="filter-pill">
              {animals.find((a) => a.id === filters.animalId)?.common_name}
            </span>
          )}
          {filters.verifiedOnly && (
            <span className="filter-pill filter-pill-green">Verified</span>
          )}
          {filters.hasPhoto && (
            <span className="filter-pill filter-pill-green">Has Photo</span>
          )}
          {filters.maxAgeHours < MAX_AGE_MAX && (
            <span className="filter-pill">
              ≤ {formatAge(filters.maxAgeHours)}
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="filter-panel" role="region" aria-label="Filter options">
          <div className="filter-section">
            <label className="filter-label" htmlFor="animal-select">
              Species
            </label>
            <select
              id="animal-select"
              className="filter-select"
              value={filters.animalId ?? ""}
              onChange={(e) =>
                update({
                  animalId:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              disabled={loading}
            >
              <option value="">All species</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.common_name}
                  {a.species ? ` — ${a.species}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <div className="filter-row">
              <label className="filter-label" htmlFor="verified-toggle">
                Verified sightings only
              </label>
              <button
                id="verified-toggle"
                role="switch"
                aria-checked={filters.verifiedOnly}
                className={`filter-switch ${filters.verifiedOnly ? "filter-switch-on" : ""}`}
                onClick={() => update({ verifiedOnly: !filters.verifiedOnly })}
              >
                <span className="filter-switch-thumb" />
              </button>
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-row">
              <label className="filter-label" htmlFor="photo-toggle">
                Sightings with a photo
              </label>
              <button
                id="photo-toggle"
                role="switch"
                aria-checked={filters.hasPhoto}
                className={`filter-switch ${filters.hasPhoto ? "filter-switch-on" : ""}`}
                onClick={() => update({ hasPhoto: !filters.hasPhoto })}
              >
                <span className="filter-switch-thumb" />
              </button>
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-row filter-row-spaced">
              <label className="filter-label" htmlFor="age-slider">
                Max pin age
              </label>
              <span className="filter-age-value">
                {filters.maxAgeHours === MAX_AGE_MAX
                  ? "Any"
                  : `≤ ${formatAge(filters.maxAgeHours)}`}
              </span>
            </div>
            <input
              id="age-slider"
              type="range"
              className="filter-slider"
              min={MAX_AGE_MIN}
              max={MAX_AGE_MAX}
              step={2}
              value={filters.maxAgeHours}
              onChange={(e) => update({ maxAgeHours: Number(e.target.value) })}
            />
            <div className="filter-slider-labels">
              <span>{formatAge(MAX_AGE_MIN)}</span>
              <span>{formatAge(MAX_AGE_MAX)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
