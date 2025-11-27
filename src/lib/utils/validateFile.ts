import { toast } from "sonner";

const SQUARE_TOLERANCE = 0.1; // 10% : ratio entre 0.9 et 1.1
const MIN_SIZE = 128; // optionnel
const MAX_SIZE = 2048; // optionnel

export const validateImageDimensions = (
  file: File,
  options: {
    squareMandatory?: boolean;
    squareTolerance?: number;
    minSize?: number;
    maxSize?: number;
  },
): Promise<void> => {
  const {
    minSize = MIN_SIZE,
    maxSize = MAX_SIZE,
    squareMandatory = false,
    squareTolerance = SQUARE_TOLERANCE,
  } = options;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const ratio = width / height;

        // Vérifier carré
        if (squareMandatory) {
          if (ratio < 1 - squareTolerance || ratio > 1 + squareTolerance) {
            toast.error("L'image doit être carrée.");
            reject(new Error("L'image doit être carrée."));
            return;
          }
        }

        // Vérifier dimension min / max
        if (width < minSize || height < minSize) {
          toast.error(
            `Le logo doit mesurer au moins ${minSize}px de chaque côté.`,
          );
          reject(
            new Error(
              `Le logo doit mesurer au moins ${minSize}px de chaque côté.`,
            ),
          );
          return;
        }

        if (width > maxSize || height > maxSize) {
          toast.error(
            `Le logo ne doit pas dépasser ${maxSize}px de chaque côté.`,
          );
          reject(
            new Error(
              `Le logo ne doit pas dépasser ${maxSize}px de chaque côté.`,
            ),
          );
          return;
        }

        resolve();
      };

      img.onerror = () =>
        reject(new Error("Impossible de lire les dimensions de l'image."));

      img.src = e.target?.result as string;
    };

    reader.onerror = () =>
      reject(new Error("Impossible de lire le fichier image."));

    reader.readAsDataURL(file);
  });
};

export const validateFileSize = async (
  file: File,
  maxSizeBytes: number,
): Promise<void> => {
  if (file.size <= maxSizeBytes) return;

  const sizeMb = maxSizeBytes / (1024 * 1024);
  const sizeKb = maxSizeBytes / 1024;

  const message =
    sizeMb < 1
      ? `Le fichier doit être plus petit que ${Math.round(sizeKb)} Ko.`
      : `Le fichier doit être plus petit que ${sizeMb.toFixed(1)} Mo.`;

  toast.error(message);
  throw new Error(message);
};
