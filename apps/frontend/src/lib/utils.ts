import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  size?: number;
}

export async function validateImageFromUrl(
  url: string,
): Promise<ImageValidationResult> {
  console.log("Validating image from URL:", url);
  try {
    const response = await fetch(url, {
      method: "HEAD",
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: `Erro ao acessar a imagem (HTTP ${response.status})`,
      };
    }

    // Verificar tipo MIME
    const contentType = response.headers.get("content-type");
    if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return {
        isValid: false,
        error: `Formato de imagem não suportado. Suportamos: JPG, PNG, WEBP`,
      };
    }

    // Verificar tamanho do arquivo
    const contentLength = response.headers.get("content-length");
    if (!contentLength) {
      // Se não conseguir pegar o tamanho pelo header, fazer download parcial
      const fullResponse = await fetch(url);
      const blob = await fullResponse.blob();

      if (blob.size > MAX_IMAGE_SIZE) {
        return {
          isValid: false,
          error: `Arquivo muito grande. Máximo: 10MB, você tem: ${(blob.size / 1024 / 1024).toFixed(2)}MB`,
          size: blob.size,
        };
      }

      return {
        isValid: true,
        size: blob.size,
      };
    }

    const size = parseInt(contentLength, 10);
    if (size > MAX_IMAGE_SIZE) {
      return {
        isValid: false,
        error: `Arquivo muito grande. Máximo: 10MB, você tem: ${(size / 1024 / 1024).toFixed(2)}MB`,
        size,
      };
    }

    return {
      isValid: true,
      size,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Erro ao validar imagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}
