import { useState } from "react";
import { useAdminPins, DEFAULT_ADMIN_FILTERS } from "../../hooks/useAdminPins";
import { useAnimals } from "../../hooks/useAnimals";
import { usePark } from "../../hooks/usePark";
import PinReviewCard from "./PinReviewCard";
import type {
  AdminPinFilters,
  SortField,
  SortDir,
  VerifiedFilter,
} from "../../hooks/useAdminPins";
import "./AdminPanel.css";

interface Props {
  onClose: () => void;
}

function SortIcon({
  active,
  dir,
}: {
  field: string;
  active: boolean;
  dir: SortDir;
}) {
  return (
    <svg
      className={`sort-icon ${active ? "sort-icon-active" : ""}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      {active && dir === "asc" ? (
        <path d="M6 2l4 6H2l4-6z" fill="currentColor" />
      ) : active && dir === "desc" ? (
        <path d="M6 10L2 4h8L6 10z" fill="currentColor" />
      ) : (
        <path
          d="M6 2l3 4H3l3-4zM6 10L3 6h6L6 10z"
          fill="currentColor"
          opacity=".4"
        />
      )}
    </svg>
  );
}

const MAX_AGE_MAX = 48;
const MAX_AGE_MIN = 2;

function formatAge(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}
//TODO: Move to separate class

export default function AdminPanel({ onClose }: Props) {
  const { park } = usePark();
  const { animals } = useAnimals();
  const [filters, setFilters] = useState<AdminPinFilters>(
    DEFAULT_ADMIN_FILTERS,
  );

  const {
    pins,
    total,
    loading,
    page,
    totalPages,
    nextPage,
    prevPage,
    verifyPin,
    deletePin,
  } = useAdminPins(park?.id ?? null, filters);

  function update(patch: Partial<AdminPinFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
  }

  function toggleSort(field: SortField) {
    if (filters.sortField === field) {
      update({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" });
    } else {
      update({ sortField: field, sortDir: "desc" });
    }
  }

  const from = total === 0 ? 0 : page * 20 + 1;
  const to = Math.min((page + 1) * 20, total);

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Admin panel</h2>
            <div className="admin-subtitle">{park?.name ?? "Loading…"}</div>
          </div>
          <button
            className="btn btn-ghost admin-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-filter-row">
            <div className="admin-filter-group">
              <label className="admin-filter-label">Status</label>
              <div className="admin-seg">
                {(["all", "pending", "verified"] as VerifiedFilter[]).map(
                  (v) => (
                    <button
                      key={v}
                      className={`admin-seg-btn ${filters.verified === v ? "admin-seg-btn-active" : ""}`}
                      onClick={() => update({ verified: v })}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="admin-filter-group">
              <label className="admin-filter-label" htmlFor="admin-animal">
                Species
              </label>
              <select
                id="admin-animal"
                className="filter-select admin-select"
                value={filters.animalId ?? ""}
                onChange={(e) =>
                  update({
                    animalId:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              >
                <option value="">All species</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.common_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-filter-group admin-filter-search">
              <label className="admin-filter-label" htmlFor="admin-search">
                Search
              </label>
              <input
                id="admin-search"
                className="form-input"
                type="search"
                placeholder="Species or username…"
                value={filters.search}
                onChange={(e) => update({ search: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-filter-row">
            <div className="admin-filter-group">
              <div className="" style={{
                display: "flex",
                justifyContent: "space-between"
              }}>
                  <label htmlFor="age-slider">
                    Max pin age
                  </label>
                  <span>
                    {formatAge(filters.maxAgeHours)}
                  </span>
                </div>
              <div className="">
                <input
                  id="age-slider"
                  type="range"
                  className="filter-slider"
                  min={MAX_AGE_MIN}
                  max={MAX_AGE_MAX}
                  step={2}
                  value={filters.maxAgeHours}
                  onChange={(e) =>
                    update({ maxAgeHours: Number(e.target.value) })
                  }
                />
                <div className="filter-slider-labels">
                  <span>{formatAge(MAX_AGE_MIN)}</span>
                  <span>{formatAge(MAX_AGE_MAX)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sort bar */}
          <div className="admin-sort-bar">
            <span className="admin-sort-label">Sort by</span>
            {(
              [
                { field: "observed_at", label: "Observed" },
                { field: "created_at", label: "Submitted" },
                { field: "animal", label: "Species" },
              ] as { field: SortField; label: string }[]
            ).map(({ field, label }) => (
              <button
                key={field}
                className={`admin-sort-btn ${filters.sortField === field ? "admin-sort-btn-active" : ""}`}
                onClick={() => toggleSort(field)}
              >
                {label}
                <SortIcon
                  field={field}
                  active={filters.sortField === field}
                  dir={filters.sortDir}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="admin-results-bar">
          <span className="admin-results-count">
            {loading
              ? "Loading…"
              : total === 0
                ? "No pins found"
                : `${from}–${to} of ${total} pins`}
          </span>
          {filters.verified === "pending" && total > 0 && (
            <span className="badge badge-pending">{total} awaiting review</span>
          )}
        </div>

        {/* Pin list */}
        <div className="admin-list">
          {loading ? (
            <div className="state-centered">Loading pins…</div>
          ) : pins.length === 0 ? (
            <div className="state-centered">
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              Nothing to review
            </div>
          ) : (
            pins.map((pin) => (
              <PinReviewCard
                key={pin.id}
                pin={pin}
                onVerify={verifyPin}
                onDelete={deletePin}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="btn btn-secondary"
              onClick={prevPage}
              disabled={page === 0 || loading}
            >
              ← Previous
            </button>
            <span className="admin-page-info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={nextPage}
              disabled={page >= totalPages - 1 || loading}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
