import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions, UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }

  @Delete()
  async deleteFile(@Body('filename') filename: string) {
    if (!filename) {
      throw new BadRequestException('Filename is required');
    }
    this.uploadsService.deleteFile(filename);
    return { message: 'File deleted' };
  }
}
