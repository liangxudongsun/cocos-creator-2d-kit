import { defineConfig } from "tsdown";
import { TsdownBaseConfig } from "./tsdown.base.config.ts";

export default defineConfig({
    ...TsdownBaseConfig,
    minify: true,
});
