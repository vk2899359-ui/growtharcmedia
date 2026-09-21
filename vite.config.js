import { defineConfig } from 'vite';
import { resolve } from 'path';

// `__dirname` is not defined under Vite's native config loader.
const root = import.meta.dirname;

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        work: resolve(root, 'work.html'),
        // Dedicated Case Studies
        auricJewels: resolve(root, 'work/auric-jewels.html'),
        gemhub: resolve(root, 'work/gemhub.html'),
        kisaansay: resolve(root, 'work/kisaansay.html'),
        superup: resolve(root, 'work/superup-home-solution.html'),
        kabeer: resolve(root, 'work/kabeer-confectionery.html'),
        vedaClub: resolve(root, 'work/veda-club.html'),
        akiso: resolve(root, 'work/akiso.html'),
        rupeenest: resolve(root, 'work/rupeenest-capital.html'),
        // Service Pages
        brandStrategy: resolve(root, 'services/brand-strategy.html'),
        brandIdentity: resolve(root, 'services/brand-identity.html'),
        creativeContent: resolve(root, 'services/creative-content.html'),
        digitalMarketing: resolve(root, 'services/digital-marketing.html'),
        performanceMarketing: resolve(root, 'services/performance-marketing.html'),
        webDevelopment: resolve(root, 'services/web-development.html'),
      },
    },
  },
});
