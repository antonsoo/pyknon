declare const __PYKNON_EDITION__: string;
declare module "virtual:vina-sources" {
  const sources: typeof import("../public/sources/vina/manifest.json");
  export default sources;
}
