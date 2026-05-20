import "server-only";
import crypto from "crypto";

type BunnyEmbedUrlInput = {
  libraryId?: string | null;
  videoId: string;
  expiresInSeconds?: number;
};

export function getBunnyStreamEmbedUrl({
  libraryId,
  videoId,
  expiresInSeconds = 300,
}: BunnyEmbedUrlInput) {
  const resolvedLibraryId =
    libraryId || process.env.BUNNY_STREAM_LIBRARY_ID;

  const securityKey = process.env.BUNNY_STREAM_TOKEN_SECURITY_KEY;

  if (!resolvedLibraryId) {
    throw new Error("Missing Bunny Stream library ID");
  }

  if (!securityKey) {
    throw new Error("Missing Bunny Stream token security key");
  }

  if (!videoId) {
    throw new Error("Missing Bunny video ID");
  }

  const expires =
    Math.floor(Date.now() / 1000) + expiresInSeconds;

  const token = crypto
    .createHash("sha256")
    .update(`${securityKey}${videoId}${expires}`)
    .digest("hex");

  const url = new URL(
    `https://iframe.mediadelivery.net/embed/${resolvedLibraryId}/${videoId}`,
  );

  url.searchParams.set("token", token);
  url.searchParams.set("expires", expires.toString());
  url.searchParams.set("autoplay", "false");
  url.searchParams.set("loop", "false");
  url.searchParams.set("muted", "false");
  url.searchParams.set("preload", "true");
  url.searchParams.set("responsive", "true");

  return url.toString();
}