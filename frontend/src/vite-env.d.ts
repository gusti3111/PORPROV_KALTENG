/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVENT_START_AT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:galeri-photos" {
  export interface PublicGaleriPhoto {
    id: number;
    category: string;
    title: string;
    src: string;
  }
  const photos: PublicGaleriPhoto[];
  export default photos;
}

declare module "./galeriPlugin.mjs" {
  import type { Plugin } from "vite";
  export function galeriPhotosPlugin(): Plugin;
}
