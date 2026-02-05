import 'dotenv/config';
import { Storage } from '@google-cloud/storage';

async function main() {
  try {
    const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './glassnik-7d5600b7230e.json' });
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:', buckets.map(b => b.name));

    const bucketName = process.env.GCP_BUCKET_NAME || 'glassnik';
    await storage.bucket(bucketName).file('test-connection.txt').save('Hello from Glassnik Backend!');
    console.log(`Upload successful file 'test-connection.txt' bucket '${bucketName}'`);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
