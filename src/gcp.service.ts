import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class GcpService {
  private storage: Storage;
  private bucketName = process.env.GCP_BUCKET_NAME || 'glassnik'; 

  constructor() {
    this.storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './glassnik-7d5600b7230e.json', 
    });
  }

  async uploadFile(filename: string, content: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filename);

    await file.save(content);

    return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
  }
}