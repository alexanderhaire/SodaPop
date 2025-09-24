/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_TOKEN_FACTORY_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
