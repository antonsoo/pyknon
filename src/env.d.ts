declare const __PYKNON_EDITION__: string;
declare module "virtual:notation-sources" {
  const sources: typeof import("../public/sources/notation/manifest.json");
  export default sources;
}
declare module "virtual:vina-sources" {
  const sources: typeof import("../public/sources/vina/manifest.json");
  export default sources;
}
declare module "virtual:halves-sources" {
  const sources: typeof import("../public/sources/halves/manifest.json");
  export default sources;
}
