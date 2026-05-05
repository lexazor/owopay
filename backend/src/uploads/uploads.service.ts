import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/image\/(jpg|jpeg|png|webp|gif)/)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
};

@Injectable()
export class UploadsService {
  deleteFile(filename: string) {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  deleteFileByUrl(url: string) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    if (filename) this.deleteFile(filename);
  }
}
