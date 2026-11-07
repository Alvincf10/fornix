export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/fornix',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT ?? 'http://localhost:9000',
    bucket: process.env.STORAGE_BUCKET ?? 'fornix',
    accessKey: process.env.STORAGE_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.STORAGE_SECRET_KEY ?? 'minioadmin',
    maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE ?? '26214400', 10),
  },
});
