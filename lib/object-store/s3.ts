/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { default as AWS } from 'aws-sdk';
import { URL } from 'url';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const parseS3Url = (s3Url: string) => {
  const url = new URL(s3Url);
  const Bucket = url.hostname.split('.')[0];
  const Key = decodeURIComponent(url.pathname.slice(1));
  return { Bucket, Key };
};

export const readS3File = async (s3Url: string) => {
  const { Bucket, Key } = parseS3Url(s3Url);

  const params = {
    Bucket,
    Key,
  };

  try {
    const data = await s3.getObject(params).promise();
    return data?.Body?.toString('utf-8');
  } catch (error) {
    console.error('Error reading file from S3:', error);
    throw new Error('Failed to read file from S3');
  }
};
