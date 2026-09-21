import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        work: resolve(__dirname, 'work.html'),
        // Dedicated Case Studies
        auricJewels: resolve(__dirname, 'work/auric-jewels.html'),
        gemhub: resolve(__dirname, 'work/gemhub.html'),
        kisaansay: resolve(__dirname, 'work/kisaansay.html'),
        superup: resolve(__dirname, 'work/superup-home-solution.html'),
        kabeer: resolve(__dirname, 'work/kabeer-confectionery.html'),
        vedaClub: resolve(__dirname, 'work/veda-club.html'),
        akiso: resolve(__dirname, 'work/akiso.html'),
        rupeenest: resolve(__dirname, 'work/rupeenest-capital.html'),
        // Service Pages
        brandStrategy: resolve(__dirname, 'services/brand-strategy.html'),
        brandIdentity: resolve(__dirname, 'services/brand-identity.html'),
        creativeContent: resolve(__dirname, 'services/creative-content.html'),
        digitalMarketing: resolve(__dirname, 'services/digital-marketing.html'),
        performanceMarketing: resolve(__dirname, 'services/performance-marketing.html'),
        webDevelopment: resolve(__dirname, 'services/web-development.html'),
      },
    },
  },
});
