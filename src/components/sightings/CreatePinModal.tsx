import { useState, useEffect } from "react";
import type { LatLng } from "leaflet";
import { useAnimals } from "../../hooks/useAnimals";
import { useCreatePin } from "../../hooks/useCreatePin";
import PhotoUploader from "./PhotoUploader";
import "./CreatePinModal.css";

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {step === "form" && (
          <>
            <ModalHeader title="Log a sighting" onClose={onClose} />
            <div className="modal-coords">
              {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
            </div>

            <form onSubmit={handleSubmit}>
              <label>Animal</label>
              {animalsLoading ? (
                <div>Loading animals…</div>
              ) : (
                <select
                  className="form-select"
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

              <label className="form-label">
                Photo <span className="form-label-options">(optional)</span>
              </label>
              <PhotoUploader onFileSelected={setPhotoFile} />

              {errorMsg && <div className="form-error">{errorMsg}</div>}

              <button className="btn btn-primary" type="submit">Submit sighting</button>
            </form>
          </>
        )}

        {step === "submitting" && (
          <div className="modal-centered">
            <div className="modal-text">Saving your sighting…</div>
          </div>
        )}

        {step === "success" && (
          <div className="modal-centered">
            <div className="modal-success-icon">✓</div>
            <div className="modal-text">Sighting logged!</div>
            <div className="modal-text">
              Your pin will appear on the map shortly.
            </div>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        )}

        {step === "blocked" && (
          <div className="modal-centered">
            <div>🚫</div>
            <div className="modal-text">Too many sightings</div>
            <div className="modal-text">
              You've reached the limit for anonymous submissions. Please try
              again later.
            </div>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
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
    <div className="modal-header">
      <div className="modal-title">{title}</div>
      <button className="modal-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
