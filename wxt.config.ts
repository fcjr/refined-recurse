import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Refined Recurse',
    description: 'Small quality-of-life tweaks for recurse.com.',
    author: 'Left Shift Logical LLC',
    // No host_permissions needed — the content script only runs on recurse.com.
    // Firefox requires an explicit data collection disclosure; this extension
    // collects none. Chrome ignores browser_specific_settings.
    browser_specific_settings: {
      gecko: {
        id: 'refined-recurse@leftshift.com',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      96: '/icon/96.png',
      128: '/icon/128.png',
    },
    action: {
      default_title: 'Refined Recurse',
      default_icon: {
        16: '/icon/16.png',
        32: '/icon/32.png',
        48: '/icon/48.png',
        128: '/icon/128.png',
      },
    },
  },
});
