/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      PORT?: string;
      DATABASE_URL?: string;
      JWT_SECRET?: string;
      JWT_EXPIRES_IN?: string;
      REDIS_URL?: string;
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
    }
  }
}

export {};

