import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import fs from "fs"

// A custom plugin to rename the extension manifest during the build process
const extensionManifestPlugin = () => {
    return {
        name: 'extension-manifest',
        closeBundle() {
            // Copy the specific extension manifest over the PWA manifest in the dist-ext folder
            const src = path.resolve(__dirname, 'public/manifest.ext.json');
            const dest = path.resolve(__dirname, 'dist-ext/manifest.json');
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
            }
        }
    }
}

export default defineConfig({
    plugins: [react(), extensionManifestPlugin()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        outDir: "dist-ext",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                // Prevent hashing to keep entry files predictable for the extension
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
})
