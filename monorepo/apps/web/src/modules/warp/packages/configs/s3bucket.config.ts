export const getConfig = () => ({
  s3_bucket: process.env.S3_BUCKET || "snowkap.warplive.files/public",
  s3_bucket_region: process.env.S3_BUCKET_REGION || "ap-south-1",
  s3_bucket_access_key: process.env.S3_BUCKET_ACCESS_KEY,
  s3_bucket_secret_access_key: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
});

const stripLeadingSlash = (key: string) =>
  key.startsWith("/") ? key.slice(1) : key;

export const s3PublicUrl = (key: string) => {
  const { s3_bucket, s3_bucket_region } = getConfig();
  return `https://s3.${s3_bucket_region}.amazonaws.com/${s3_bucket}/${stripLeadingSlash(key)}`;
};
