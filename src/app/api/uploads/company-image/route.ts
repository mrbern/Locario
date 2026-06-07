import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSizeInBytes = 5 * 1024 * 1024;

function getFileExtension(file: File) {
  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "";
}

export async function POST(request: Request) {
  try {
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

    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message: "Nur JPG, PNG und WebP Bilder sind erlaubt.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > maxFileSizeInBytes) {
      return NextResponse.json(
        {
          message: "Das Bild darf maximal 5 MB gross sein.",
        },
        {
          status: 400,
        }
      );
    }

    const extension = getFileExtension(file);

    if (!extension) {
      return NextResponse.json(
        {
          message: "Bildformat konnte nicht erkannt werden.",
        },
        {
          status: 400,
        }
      );
    }

    const uploadsDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "companies"
    );

    await mkdir(uploadsDirectory, {
      recursive: true,
    });

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = path.join(uploadsDirectory, fileName);

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, fileBuffer);

    return NextResponse.json({
      imageUrl: `/uploads/companies/${fileName}`,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Bild konnte nicht hochgeladen werden.",
      },
      {
        status: 500,
      }
    );
  }
}

