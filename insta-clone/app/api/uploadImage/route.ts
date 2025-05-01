import { NextResponse } from 'next/server';
import { cloudinary } from '@/libs/cloudinary';

export async function POST(req: Request) {
  try {
    const { base64Image, folder = 'uploads' } = await req.json();

    if (!base64Image) {
      return NextResponse.json(
        { message: 'Base64 image is required', success: false },
        { status: 400 }
      );
    }

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder,
    });

    return NextResponse.json(
      { imageUrl: uploadResponse.secure_url, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    return NextResponse.json(
      { message: 'Failed to upload image', success: false },
      { status: 500 }
    );
  }
}
