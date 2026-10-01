import manifest from "../package.json";

export const versionMetadata = {
  version: manifest.version,
  build: manifest.build,
} as const;
