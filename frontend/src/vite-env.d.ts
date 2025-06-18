/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_NFT_STORAGE_KEY?: string;
  readonly VITE_HORSE_FACTORY_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
