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

const ImageUploadForm = () => {
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

  const handleImageSubmit = async (url: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ao criar job: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Job criado com sucesso:", data);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao criar job");
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
      await handleImageSubmit(url);
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
              Supported formats: JPG, PNG and WEBP. Maximum size: 10MB.
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
          {feedback.type === "error" && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="">Error</AlertTitle>
              <AlertDescription className="text-muted-foreground text-xs">
                {feedback.message}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ImageUploadForm;
