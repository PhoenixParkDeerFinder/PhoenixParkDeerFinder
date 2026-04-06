import { useRef, useState } from 'react'

interface Props {
  onFileSelected: (file: File | null) => void
}

export default function PhotoUploader({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    onFileSelected(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    setPreview(null)
    onFileSelected(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      style={{
        border: '1.5px dashed rgba(0,0,0,0.18)',
        borderRadius: 8, padding: 12,
        cursor: 'pointer', textAlign: 'center',
        background: '#fafaf8', minHeight: 80,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 6 }}
          />
          <button onClick={clear} style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,0,0,0.5)', color: '#fff',
            border: 'none', borderRadius: '50%',
            width: 24, height: 24, cursor: 'pointer', fontSize: 12,
          }}>✕</button>
        </>
      ) : (
        <div style={{ color: '#9e9d98', fontSize: 13, paddingTop: 8 }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>+</div>
          Drag a photo here or click to browse
        </div>
      )}
    </div>
  )
}