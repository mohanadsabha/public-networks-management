declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    NODE_ENV: "development" | "production" | "test";
    JWT_SECRET: string;
    JWT_TTL: string;
    EMAIL: string;
    PASSWORD: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USERNAME: string;
    EMAIL_PASSWORD: string;
    FRONTEND_URL: string;
    FRONTEND_URL_WWW: string;
    TWEETSMS_USER?: string;
    TWEETSMS_PASSWORD?: string;
    TWEETSMS_API_KEY?: string;
    SMS_SENDER?: string;
    OVPN_PASS: string;
    OVPN_USER: string;
    OVPN_HOST: string;
    OVPN_PORT: string;
    MIKROTIK_SSH_PORT: number;
    syncTime: number;
  }
}
