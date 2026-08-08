"use client";

import { useEffect, useRef, useState } from "react";
import { FileIcon, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg|avif)$/i;

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) {
    if (/heic|heif/i.test(file.type)) return false;
    return true;
  }
  return IMAGE_EXTENSIONS.test(file.name);
}

function formatSize(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function AttachmentPreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setPreviewFailed(false);
    if (!isImageFile(file)) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  const showImage = Boolean(previewUrl) && !previewFailed;

  return (
    <li className="group relative overflow-hidden rounded-lg border border-border bg-background">
      {showImage ? (
        <img
          src={previewUrl!}
          alt={file.name}
          className="h-16 w-full object-cover"
          onError={() => setPreviewFailed(true)}
        />
      ) : (
        <div className="flex h-16 flex-col items-center justify-center gap-1 px-2 text-muted">
          <FileIcon className="h-5 w-5" />
          <span className="line-clamp-1 w-full text-center text-[10px] text-foreground">
            {file.name}
          </span>
        </div>
      )}
      <div className="border-t border-border px-1.5 py-1">
        <p className="truncate text-[10px] font-medium text-foreground" title={file.name}>
          {file.name}
        </p>
        <p className="text-[10px] text-muted">{formatSize(file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${file.name}`}
        className="absolute right-1 top-1 rounded-full border border-border bg-card/95 p-0.5 text-muted shadow-sm hover:bg-card hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </li>
  );
}

export function TicketFilePicker({ files, onChange, maxFiles = 10 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onChange([...files, ...Array.from(list)].slice(0, maxFiles));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
          Adjuntar archivos
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="text-xs text-muted">
          {files.length}/{maxFiles} seleccionados · máx. 10MB c/u
        </span>
      </div>

      {files.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {files.map((file, index) => (
            <AttachmentPreview
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              file={file}
              onRemove={() => onChange(files.filter((_, i) => i !== index))}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-xs text-muted">
          Ningún archivo seleccionado. Las miniaturas aparecerán aquí antes de enviar.
        </p>
      )}
    </div>
  );
}
