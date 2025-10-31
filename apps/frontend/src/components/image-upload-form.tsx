import { AlertCircle } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";

interface ImageUploadFormProps {
  onSubmit: (url: string) => Promise<void>;
}

const ImageUploadForm = ({ onSubmit }: ImageUploadFormProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url.trim()) {
      setFeedback({
        type: "error",
        message: "Por favor, insira uma URL de imagem",
      });
      return;
    }

    if (!validateUrl(url)) {
      setFeedback({
        type: "error",
        message: "URL inválida. Por favor, insira uma URL válida",
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      await onSubmit(url);
      setFeedback({
        type: "success",
        message: "Job criado com sucesso! Verifique a lista de jobs.",
      });
      setUrl("");

      setTimeout(() => {
        setFeedback({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao criar job. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Image</CardTitle>
        <CardDescription>
          Enter an image URL to start processing
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Image URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Suporte para JPG, PNG and WEBP.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer"
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Processing...
              </>
            ) : (
              "Submit Image"
            )}
          </Button>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="">Information</AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              Your image will be processed asynchronously. You can track the
              progress on the jobs list on the right.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
};

export default ImageUploadForm;
