/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVENT_START_AT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
