"use client";

import { useEffect, useState } from "react";
import { Download, FileIcon, Loader2, X } from "lucide-react";
import {
  downloadAdminAttachment,
  fetchAdminAttachmentBlob,
} from "@/features/tickets/data-access/admin-tickets-api";
import type { SupportTicketAttachment } from "@/features/tickets/models/ticket.model";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg|avif)$/i;

export function isImageAttachment(attachment: SupportTicketAttachment): boolean {
  if (attachment.contentType?.startsWith("image/")) {
    if (/heic|heif/i.test(attachment.contentType)) return false;
    return true;
  }
  return IMAGE_EXTENSIONS.test(attachment.fileName);
}

function formatSize(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

type TicketAttachmentListProps = {
  ticketId: string;
  attachments: SupportTicketAttachment[];
};

export function TicketAttachmentList({ ticketId, attachments }: TicketAttachmentListProps) {
  const [viewer, setViewer] = useState<{
    url: string;
    fileName: string;
    attachmentId: string;
  } | null>(null);

  const images = attachments.filter(isImageAttachment);
  const files = attachments.filter((item) => !isImageAttachment(item));

  useEffect(() => {
    return () => {
      if (viewer?.url) URL.revokeObjectURL(viewer.url);
    };
  }, [viewer]);

  const openViewer = async (attachment: SupportTicketAttachment) => {
    const { blob } = await fetchAdminAttachmentBlob(ticketId, attachment.id);
    const url = URL.createObjectURL(blob);
    setViewer((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return {
        url,
        fileName: attachment.fileName,
        attachmentId: attachment.id,
      };
    });
  };

  const closeViewer = () => {
    setViewer((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  useEffect(() => {
    if (!viewer) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewer]);

  return (
    <>
      <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
        {images.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {images.map((attachment) => (
              <ImageThumb
                key={attachment.id}
                ticketId={ticketId}
                attachment={attachment}
                onOpen={() => void openViewer(attachment)}
              />
            ))}
          </ul>
        )}

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((attachment) => (
              <li key={attachment.id}>
                <button
                  type="button"
                  className="inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:border-primary/40 hover:text-primary"
                  onClick={() =>
                    void downloadAdminAttachment(
                      ticketId,
                      attachment.id,
                      attachment.fileName
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{attachment.fileName}</span>
                  <span className="shrink-0 text-xs text-muted">
                    ({formatSize(attachment.sizeBytes)})
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={viewer.fileName}
          onClick={closeViewer}
        >
          <div
            className="relative flex max-h-full max-w-5xl flex-col gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm text-white">{viewer.fileName}</p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white hover:bg-white/20"
                  onClick={() =>
                    void downloadAdminAttachment(
                      ticketId,
                      viewer.attachmentId,
                      viewer.fileName
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </button>
                <button
                  type="button"
                  className="rounded-md border border-white/20 bg-white/10 p-1.5 text-white hover:bg-white/20"
                  aria-label="Cerrar"
                  onClick={closeViewer}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img
              src={viewer.url}
              alt={viewer.fileName}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

function ImageThumb({
  ticketId,
  attachment,
  onOpen,
}: {
  ticketId: string;
  attachment: SupportTicketAttachment;
  onOpen: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    setLoading(true);
    setFailed(false);

    void (async () => {
      try {
        const { blob } = await fetchAdminAttachmentBlob(ticketId, attachment.id);
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ticketId, attachment.id]);

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver imagen: ${attachment.fileName}`}
        className="group relative h-14 w-14 overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-primary/50"
        title={attachment.fileName}
      >
        {loading ? (
          <span className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          </span>
        ) : url && !failed ? (
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted">
            <FileIcon className="h-4 w-4" />
          </span>
        )}
      </button>
    </li>
  );
}
