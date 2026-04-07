import { useRef, useState } from "react";
import "./PhotoUploader.css"

interface Props {
  onFileSelected: (file: File | null) => void;
}

export default function PhotoUploader({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    onFileSelected(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0] ?? null);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="photo-uploader"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <>
          <img className="photo-uploader-preview" src={preview} alt="Preview" />
          <button className="photo-uploader-clear" onClick={clear}>✕</button>
        </>
      ) : (
        <div className="photo-uploader-empty">
          <div className="photo-uploader-icon">+</div>
          Drag a photo here or click to browse
        </div>
      )}
    </div>
  );
}
