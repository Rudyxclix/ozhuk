import React, { useState, useRef, useEffect } from 'react';

interface ImageUploaderProps {
  label?: string;
  description?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  initialPreviewUrl?: string;
  maxSizeMB?: number;
  required?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'Blockage Evidence Photo',
  description = 'Upload a clear photo of the clogged drain, canal grate, or overflowing culvert.',
  file,
  onFileChange,
  initialPreviewUrl,
  maxSizeMB = 10,
  required = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [file, initialPreviewUrl]);

  const validateAndSetFile = (selectedFile: File) => {
    setValidationError(null);

    // Validate mime type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setValidationError('Please select a valid image file (JPEG, PNG, or WebP).');
      return false;
    }

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setValidationError(`Image size exceeds the ${maxSizeMB}MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB).`);
      return false;
    }

    onFileChange(selectedFile);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
    // reset input value so re-selecting the same file triggers change
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onFileChange(null);
    setPreviewUrl(null);
    setValidationError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-space-xs w-full">
      <div className="flex items-center justify-between">
        <label className="font-label-md font-semibold text-on-surface flex items-center gap-1">
          {label}
          {required && <span className="text-error">*</span>}
        </label>
        <span className="font-label-sm text-outline text-[12px]">Max {maxSizeMB}MB (JPEG, PNG, WebP)</span>
      </div>

      {description && <p className="font-body-sm text-on-surface-variant">{description}</p>}

      {validationError && (
        <div className="p-space-xs px-space-sm rounded-lg bg-error-container text-on-error-container font-label-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleInputChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Dropzone & Preview Container */}
      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-space-md text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary-container/10'
              : 'border-surface-container-high bg-surface-container-low hover:border-outline hover:bg-surface-container'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary mb-space-sm shadow-sm">
            <span className="material-symbols-outlined text-[28px]">photo_camera</span>
          </div>

          <p className="font-label-lg font-semibold text-primary">Click or drag image here to attach</p>
          <p className="font-body-sm text-on-surface-variant mt-1">Supports camera upload on mobile devices</p>

          <div className="flex gap-2 mt-space-md" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-space-md py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-on-surface font-label-sm font-semibold transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              Browse File
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-semibold hover:bg-primary-container transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
              Take Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full rounded-xl overflow-hidden border border-surface-container bg-surface-container-lowest shadow-sm flex flex-col">
          <div className="relative w-full h-72 bg-surface-container overflow-hidden flex items-center justify-center">
            <img src={previewUrl} alt="Attached blockage evidence" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-primary/80 backdrop-blur text-on-primary font-label-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Photo Attached
            </div>
          </div>

          <div className="p-space-sm bg-surface-container-low flex items-center justify-between gap-space-sm flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-secondary text-[20px]">image</span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm font-semibold text-on-surface truncate">
                  {file ? file.name : 'Attached Image'}
                </span>
                {file && (
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm font-semibold transition-colors"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-error-container hover:bg-error hover:text-on-error text-on-error-container font-label-sm font-semibold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
