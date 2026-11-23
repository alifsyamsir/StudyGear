import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'seller')) {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya admin dan penjual yang dapat mengunggah gambar.' },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file = data.get('file') || data.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'File gambar tidak ditemukan dalam formulir.' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap unggah gambar (JPG, PNG, WEBP) atau file PDF.' },
        { status: 400 }
      );
    }

    // Max size: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal ukuran gambar adalah 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${cleanFileName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Gagal mengunggah file ke server: ' + error.message },
      { status: 500 }
    );
  }
}
