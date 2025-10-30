export const downloadImage = async (
  imageUrl: string
): Promise<
  | {
      data: Buffer;
      contentType: string;
      contentLength: string;
    }
  | false
> => {
  const response = await fetch(imageUrl, {
    method: "GET",
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    return false;
  }

  return {
    data: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || "",
    contentLength: response.headers.get("content-length") || "",
  };
};

export const validateImage = async (
  data: { data: Buffer; contentType: string; contentLength: string },
  maxSize: number = 10 * 1024 * 1024 // 10MB max size
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const { contentLength } = data;

    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);

      if (sizeInBytes > maxSize) {
        const sizeInMB = Math.round(sizeInBytes / 1024 / 1024);
        return {
          isValid: false,
          error: `Image too large: ${sizeInMB}MB. Maximum allowed size: 10MB`,
        };
      }
    }

    const { contentType } = data;

    if (contentType && !contentType.startsWith("image/")) {
      return {
        isValid: false,
        error: "URL does not point to a valid image",
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Error validating image" };
  }
};
