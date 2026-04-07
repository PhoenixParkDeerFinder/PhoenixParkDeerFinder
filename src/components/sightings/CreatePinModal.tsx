import { useState, useEffect } from "react";
import type { LatLng } from "leaflet";
import { useAnimals } from "../../hooks/useAnimals";
import { useCreatePin } from "../../hooks/useCreatePin";
import PhotoUploader from "./PhotoUploader";

interface Props {
  latlng: LatLng;
  parkId: number;
  onClose: () => void;
}

type Step = "form" | "submitting" | "success" | "blocked";

export default function CreatePinModal({ latlng, parkId, onClose }: Props) {
  const { animals, loading: animalsLoading } = useAnimals();
  const { createPin, error: createError } = useCreatePin();

  const [step, setStep] = useState<Step>("form");
  const [animalId, setAnimalId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!animalId) {
      setErrorMsg("Please select an animal.");
      return;
    }
    setErrorMsg(null);
    setStep("submitting");

    const result = await createPin({ latlng, parkId, animalId, photoFile });

    if (result === "blocked") {
      setStep("blocked");
      return;
    }
    if (result === "error") {
      setStep("form");
      setErrorMsg(createError ?? "Something went wrong.");
      return;
    }
    setStep("success");
  }

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {step === "form" && (
          <>
            <ModalHeader title="Log a sighting" onClose={onClose} />
            <div>
              {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
            </div>

            <form onSubmit={handleSubmit}>
              <label>Animal</label>
              {animalsLoading ? (
                <div>Loading animals…</div>
              ) : (
                <select
                  value={animalId ?? ""}
                  onChange={(e) => setAnimalId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    Select a species…
                  </option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.common_name}
                      {a.species ? ` — ${a.species}` : ""}
                    </option>
                  ))}
                </select>
              )}

              <label>
                Photo <span>(optional)</span>
              </label>
              <PhotoUploader onFileSelected={setPhotoFile} />

              {errorMsg && <div>{errorMsg}</div>}

              <button type="submit">Submit sighting</button>
            </form>
          </>
        )}

        {step === "submitting" && (
          <div style={styles.centered}>
            <div style={styles.muted}>Saving your sighting…</div>
          </div>
        )}

        {step === "success" && (
          <div style={styles.centered}>
            <div style={styles.successIcon}>✓</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Sighting logged!
            </div>
            <div style={styles.muted}>
              Your pin will appear on the map shortly.
            </div>
            <button
              style={{ ...styles.btnPrimary, marginTop: 20 }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}

        {step === "blocked" && (
          <div style={styles.centered}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🚫</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Too many sightings
            </div>
            <div style={styles.muted}>
              You've reached the limit for anonymous submissions. Please try
              again later.
            </div>
            <button
              style={{ ...styles.btnSecondary, marginTop: 20 }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
      <button onClick={onClose} style={styles.btnClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    color: "#1a1a18",
    borderRadius: 12,
    padding: 24,
    width: 340,
    maxWidth: "90vw",
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
  },
  coords: {
    fontSize: 12,
    color: "#6b6a65",
    fontFamily: "monospace",
    marginBottom: 16,
    background: "#f5f4f0",
    padding: "4px 8px",
    borderRadius: 6,
    display: "inline-block",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    marginTop: 14,
  },
  optional: { fontWeight: 400, color: "#9e9d98" },
  select: {
    width: "100%",
    padding: "8px 10px",
    fontSize: 13,
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 8,
    background: "#fff",
    color: "#1a1a18",
    appearance: "auto",
  },
  error: {
    fontSize: 12,
    color: "#A32D2D",
    background: "#FCEBEB",
    borderRadius: 6,
    padding: "6px 10px",
    marginTop: 12,
  },
  btnPrimary: {
    width: "100%",
    marginTop: 20,
    padding: "10px 0",
    background: "#1D9E75",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnSecondary: {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    color: "#6b6a65",
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
  },
  btnClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#6b6a65",
    padding: 4,
  },
  centered: { textAlign: "center", padding: "16px 0" },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#E1F5EE",
    color: "#0F6E56",
    fontSize: 22,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  muted: { fontSize: 13, color: "#6b6a65" },
};
