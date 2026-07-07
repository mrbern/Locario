import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export const runtime = "nodejs";

const utapi = new UTApi();
const maxFileSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (extensionFromName && /^[a-z0-9]+$/.test(extensionFromName)) {
    return extensionFromName;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function createSafeFileName(file: File) {
  const extension = getFileExtension(file);
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).slice(2, 10);

  return `locario-company-${timestamp}-${randomValue}.${extension}`;
}

function getUploadThingImageUrl(data: unknown) {
  if (!data || typeof data !== "object") {
    return "";
  }

  const uploadData = data as {
    ufsUrl?: string;
    appUrl?: string;
    url?: string;
  };

  return uploadData.ufsUrl || uploadData.url || uploadData.appUrl || "";
}

export async function POST(request: Request) {
  try {
    if (!process.env.UPLOADTHING_TOKEN) {
      return NextResponse.json(
        {
          message: "UploadThing ist nicht konfiguriert.",
        },
        {
          status: 500,
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "Keine Bilddatei übergeben.",
        },
        {
          status: 400,
        }
      );
    }

    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json(
        {
          message: "Nur JPG, PNG und WebP sind erlaubt.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          message: "Das Bild darf maximal 5 MB gross sein.",
        },
        {
          status: 400,
        }
      );
    }

    const uploadFile = new File([file], createSafeFileName(file), {
      type: file.type,
      lastModified: Date.now(),
    });

    const uploadResponse = await utapi.uploadFiles(uploadFile);

    if (uploadResponse.error) {
      return NextResponse.json(
        {
          message:
            uploadResponse.error.message || "Bild konnte nicht hochgeladen werden.",
        },
        {
          status: 500,
        }
      );
    }

    const imageUrl = getUploadThingImageUrl(uploadResponse.data);

    if (!imageUrl) {
      return NextResponse.json(
        {
          message: "Upload war erfolgreich, aber es wurde keine Bild-URL zurückgegeben.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      imageUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Beim Hochladen des Bildes ist ein unbekannter Fehler passiert.",
      },
      {
        status: 500,
      }
    );
  }
}
