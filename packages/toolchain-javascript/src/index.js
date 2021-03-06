/* imports */
import build from "./cmd/build";
import watch from "./cmd/watch";
import lint from "./cmd/lint";
import serve from "./cmd/serve";

const defaultConfig = {
    targets: "> 1.5%, not dead",
    minify: true,
    sourcemap: false,
    preamble: null,
    mappings: null,
    devServer: null
};

export { build, watch, lint, serve, defaultConfig };