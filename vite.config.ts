import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools({
      injectSource: {
        enabled: true,
        // React Three Fiber reads dashed props as nested paths, so the injected
        // `data-tsd-source` attribute breaks every three.js element.
        ignore: { files: [/^\/src\/components\/fold-stage\//] },
      },
    }),
    nitro(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
