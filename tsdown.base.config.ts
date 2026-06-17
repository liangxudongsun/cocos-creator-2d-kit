import { defineConfig } from "tsdown";

export const TsdownBaseConfig = defineConfig({
    entry: "./src/index.ts",
    outDir: "./dist",
    target: "esnext",
    platform: "browser",
    sourcemap: true,
    dts: true,
    deps: {
        neverBundle: ["cc"],
    },
});
