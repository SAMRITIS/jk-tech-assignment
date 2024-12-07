export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  globalPrefix: process.env.GLOBAL_PREFIX,
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  jwtSecret: process.env.JWT_SECRET,
  aws: {
    s3BaseURL: 'https://s3-us-west-2.amazonaws.com/',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },
  admin: {
    password: process.env.ADMIN_PASSWORD,
    email: process.env.ADMIN_EMAIL,
    accessType: process.env.ADMIN_ACCESS_TYPE,
  },
});
