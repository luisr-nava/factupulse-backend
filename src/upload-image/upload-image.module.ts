import { Module } from '@nestjs/common';
import { UploadImageService } from './upload-image.service';
import { UploadIamgeProvider } from './upload-image';

@Module({
  providers: [UploadImageService, UploadIamgeProvider],
  exports: [UploadImageService, UploadIamgeProvider],
})
export class UploadImageModule {}
