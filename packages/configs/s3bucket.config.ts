export const getConfig = () => ({
  s3_bucket: process.env.S3_BUCKET,
  s3_bucket_region: process.env.S3_BUCKET_REGION,
  s3_bucket_access_key: process.env.S3_BUCKET_ACCESS_KEY,
  s3_bucket_secret_access_key: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
});
