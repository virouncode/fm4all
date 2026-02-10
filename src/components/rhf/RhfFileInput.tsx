// src/components/ui/rhf/RhfFileInput.tsx

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  validateFileSize,
  validateImageDimensions,
} from "@/lib/utils/validateFile";
import { postVercelBlob } from "@/server/queries_a_classer/vercel-blob/postVercelBlob";

import { X } from "lucide-react";
import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

// Prefix temporaire
const TEMP_PREFIX = "temp";

type BaseProps = React.JSX.IntrinsicElements["input"];

export type AttachmentFieldValue = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

type RhfFileInputProps<S extends FieldValues> = {
  label?: string;
  name: Path<S>;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  inputClassName?: string;
  requiredMark?: boolean;
  folderName: string;
  onValueChange?: (value: AttachmentFieldValue | null) => void;
  onClear?: () => void;
  previewHeight?: number;
  withError?: boolean;
  squareMandatory?: boolean;
  maxSizeBytes?: number;
} & Omit<
  BaseProps,
  "name" | "type" | "value" | "defaultValue" | "onChange" | "onBlur"
>;

export function RhfFileInput<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  className,
  inputClassName,
  requiredMark,
  id: idProp,
  folderName,
  onValueChange,
  onClear,
  previewHeight = 180,
  withError = true,
  accept,
  squareMandatory = false,
  maxSizeBytes = 5 * 1024 * 1024,
  ...props
}: RhfFileInputProps<S>) {
  const form = useFormContext<S>();
  const { control, watch } = form;

  const id = idProp ?? String(name).replace(/\./g, "_");
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  const watchedValue = watch(name) as AttachmentFieldValue | null;
  const [isUploading, setIsUploading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!watchedValue || !watchedValue.url) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(watchedValue.url);
  }, [watchedValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = field.value as AttachmentFieldValue | null;
        const hasError = !!fieldState.error;
        const describedBy = cn(descriptionId, hasError ? errorId : undefined);

        const currentUrl = value?.url ?? "";
        const currentMime = value?.mimeType ?? "";
        const currentFilename = value?.filename ?? "";

        const hasValue = !!currentUrl;

        const isImage =
          currentMime.startsWith("image/") ||
          currentFilename.match(/\.(png|jpe?g|webp|gif)$/i);
        const isPdf =
          currentMime === "application/pdf" ||
          currentFilename.toLowerCase().endsWith(".pdf");

        const handleFileChange: React.ChangeEventHandler<
          HTMLInputElement
        > = async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setLocalError(null);
          setIsUploading(true);

          try {
            await validateFileSize(file, maxSizeBytes);

            if (/^image\//.test(file.type)) {
              await validateImageDimensions(file, {
                squareMandatory,
              });
            }

            const tempFolder = `${TEMP_PREFIX}/${folderName}`;
            const { url, size, mimeType, filename } = await postVercelBlob({
              file,
              filename: file.name,
              foldername: tempFolder,
            });

            const newValue: AttachmentFieldValue = {
              url,
              size,
              mimeType,
              filename,
            };

            field.onChange(newValue);
            onValueChange?.(newValue);
            setPreviewUrl(url);

            if (fileInputRef.current) fileInputRef.current.value = "";
          } catch (err) {
            console.error(err);
            setLocalError(
              err instanceof Error ? err.message : "Failed to upload file",
            );
            field.onChange(null);
            onValueChange?.(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          } finally {
            setIsUploading(false);
          }
        };

        const handleClear = () => {
          setLocalError(null);
          field.onChange(null);
          onValueChange?.(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setPreviewUrl(null);
          onClear?.(); // important pour retirer la ligne dans TicketForm
        };

        return (
          <FormItem
            className={cn(
              "gap-2",
              orientation === "horizontal"
                ? "flex flex-row items-start"
                : "flex flex-col",
              className,
            )}
          >
            {label && (
              <FormLabel htmlFor={id} className="text-sm">
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}

            <FormControl>
              <div className="flex flex-col gap-2">
                <div className="flex w-full items-center">
                  <input
                    id={id}
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="sr-only w-5/6"
                    accept={accept}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy || undefined}
                    aria-errormessage={hasError ? errorId : undefined}
                    aria-required={requiredMark || undefined}
                    {...props}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={cn("w-5/6 justify-center", inputClassName)}
                  >
                    {isUploading
                      ? "Chargement..."
                      : hasValue
                        ? "Changer de fichier"
                        : "Choisir un fichier"}
                  </Button>

                  {currentFilename && !isUploading && (
                    <span className="text-muted-foreground max-w-[180px] truncate text-xs">
                      {currentFilename}
                    </span>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleClear}
                    disabled={isUploading}
                    aria-label="Remove file"
                    className={`w-1/6 ${hasValue ? "" : "invisible"}`}
                  >
                    {isUploading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {currentUrl && previewUrl && (
                  <div className="bg-muted/20 animate-in fade-in-0 slide-in-from-top-1 max-w-sm rounded-md border p-3">
                    {isImage && (
                      <img
                        src={previewUrl}
                        alt={currentFilename || "Preview"}
                        className="max-w-full rounded object-contain shadow-sm"
                        style={{ maxHeight: previewHeight }}
                      />
                    )}
                    {isPdf && (
                      <iframe
                        src={previewUrl}
                        title={currentFilename || "PDF preview"}
                        className="w-full rounded shadow-sm"
                        style={{ height: previewHeight }}
                      />
                    )}
                    {!isImage && !isPdf && (
                      <div className="flex items-center justify-center py-4">
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:text-primary/80 text-sm underline transition-colors"
                        >
                          Ouvrir le fichier
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {description ? (
                  <FormDescription id={descriptionId}>
                    {description}
                  </FormDescription>
                ) : null}

                {withError && (
                  <div className="min-h-[19px]">
                    <FormMessage id={errorId} />
                    {localError && (
                      <p className="text-sm text-red-500">{localError}</p>
                    )}
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
