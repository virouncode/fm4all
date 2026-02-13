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
import type { documentCategorieCodes } from "@/constants/codeTables";
import { deleteS3Object, uploadFileToS3 } from "@/lib/s3/upload-helper";
import { cn } from "@/lib/utils";
import {
  validateFileSize,
  validateImageDimensions,
} from "@/lib/utils/validateFile";

import { X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

export type AttachmentFormType = {
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl?: string; // URL présignée pour preview immédiat
};

type BaseProps = React.JSX.IntrinsicElements["input"];

type RhfFileInputProps<S extends FieldValues> = {
  label?: string;
  name: Path<S>;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  inputClassName?: string;
  requiredMark?: boolean;

  // S3
  proprietaireEntrepriseId: string;
  categorie: (typeof documentCategorieCodes)[number];

  onValueChange?: (value: AttachmentFormType | null) => void;
  onClear?: () => void;

  previewHeight?: number;
  withError?: boolean;
  squareMandatory?: boolean;
  maxSizeBytes?: number;

  // Optionnel: delete immédiat sur clear (souvent utile si scope=temp)
  deleteOnClear?: boolean;
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
  proprietaireEntrepriseId,
  categorie,
  onValueChange,
  onClear,
  previewHeight = 180,
  withError = true,
  accept,
  squareMandatory = false,
  maxSizeBytes = 5 * 1024 * 1024,
  deleteOnClear = true,

  ...props
}: RhfFileInputProps<S>) {
  const form = useFormContext<S>();
  const { control } = form;

  const id = idProp ?? String(name).replace(/\./g, "_");
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = field.value as AttachmentFormType | null;
        const hasError = !!fieldState.error;
        const describedBy = cn(descriptionId, hasError ? errorId : undefined);

        const currentKey = value?.storageKey ?? "";
        const currentMime = value?.mimeType ?? "";
        const currentFilename = value?.filename ?? "";
        const previewUrl = value?.previewUrl ?? null;
        const hasValue = !!currentKey;

        const isImage =
          currentMime.startsWith("image/") ||
          currentFilename.match(/\.(png|jpe?g|webp|gif)$/i);
        const isPdf =
          currentMime === "application/pdf" ||
          currentFilename.toLowerCase().endsWith(".pdf");

        const handleFileChange: React.ChangeEventHandler<
          HTMLInputElement
        > = async (e) => {
          console.log("=== handleFileChange START ===");
          const file = e.target.files?.[0];
          console.log("File selected:", file?.name, file?.type, file?.size);
          if (!file) {
            console.log("No file selected, returning");
            return;
          }

          setLocalError(null);
          setIsUploading(true);

          try {
            await validateFileSize(file, maxSizeBytes);

            if (/^image\//.test(file.type)) {
              await validateImageDimensions(file, { squareMandatory });
            }

            // 1) presign + 2) upload direct + 3) retourne key + previewUrl
            const { key, previewUrl } = await uploadFileToS3({
              file,
              proprietaireEntrepriseId,
              categorie,
            });

            const newValue: AttachmentFormType = {
              storageKey: key,
              sizeBytes: file.size,
              mimeType: file.type,
              filename: file.name,
              previewUrl, // URL présignée incluse directement
            };

            field.onChange(newValue);
            onValueChange?.(newValue);

            if (fileInputRef.current) fileInputRef.current.value = "";
          } catch (err) {
            console.error(err);
            setLocalError(
              err instanceof Error ? err.message : "Failed to upload file",
            );
            field.onChange(null);
            onValueChange?.(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          } finally {
            setIsUploading(false);
          }
        };

        const handleClear = async () => {
          setLocalError(null);

          const keyToDelete = (field.value as AttachmentFormType | null)
            ?.storageKey;

          field.onChange(null);
          onValueChange?.(null);

          if (fileInputRef.current) fileInputRef.current.value = "";

          // Optionnel: delete immédiat côté S3
          // ✅ SÉCURITÉ : Ne supprimer QUE les fichiers temporaires
          if (deleteOnClear && keyToDelete && keyToDelete.startsWith("temp/")) {
            try {
              await deleteS3Object({
                key: keyToDelete,
                proprietaireEntrepriseId,
              });
            } catch (e) {
              // On ne rebloque pas l'UX si la suppression échoue
              console.error("Failed to delete temp file:", e);
            }
          }
          // Note: Les fichiers dans documents/ ne sont jamais supprimés lors du clear.
          // Ils doivent être gérés explicitement par les actions serveur si nécessaire.

          onClear?.();
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
                <div className="flex w-full items-center gap-1">
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
                      ? "Loading..."
                      : hasValue
                        ? "Changer de fichier"
                        : "Choisir un fichier"}
                  </Button>

                  {/* {currentFilename && !isUploading && (
                    <span className="text-muted-foreground max-w-45 truncate text-xs">
                      {currentFilename}
                    </span>
                  )} */}

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => void handleClear()}
                    disabled={isUploading}
                    aria-label="Remove file"
                    className={`flex-1 ${hasValue ? "" : "invisible"}`}
                  >
                    {isUploading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {hasValue && previewUrl ? (
                  <div className="bg-muted/20 relative h-40 max-w-sm rounded-md border p-3">
                    {isImage && (
                      <Image
                        src={previewUrl}
                        alt={currentFilename || "Preview"}
                        className="object-contain"
                        fill
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
                ) : (
                  <div className="bg-muted/20 text-muted-foreground relative flex h-40 max-w-sm items-center justify-center rounded-md border p-3 text-sm">
                    Preview
                  </div>
                )}

                {description ? (
                  <FormDescription id={descriptionId}>
                    {description}
                  </FormDescription>
                ) : null}

                {withError && (
                  <div className="min-h-4.75">
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
