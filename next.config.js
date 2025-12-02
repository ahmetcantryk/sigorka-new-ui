/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // Webpack 5 uyumluluğu için
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // __webpack_require__.n hatası için
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
    }
    
    return config;
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      // Development için CSP bypass ve domain maskeleme
      ...(process.env.NODE_ENV === 'development' ? [{
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *; frame-src *;",
          },
          {
            key: 'X-Forwarded-Host',
            value: 'sigorka.com',
          },
          {
            key: 'Host',
            value: 'sigorka.com',
          },
          {
            key: 'X-Real-IP',
            value: '127.0.0.1',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      }] : []),
      {
        source: '/proxy-paratika/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:3001 https://localhost:3001;",
          },
        ],
      },
      {
        source: '/odeme/paratika-3d-verify',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.paratika.com.tr https://*.merchantsafe.com https://vpos.paratika.com.tr http://localhost:3000 https://sigorka.com;",
          },
        ],
      },
      {
        source: '/defaultAgencyConfig.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Config dosyasından gelen yönlendirmeler (productAnchors.ts - offerToProductRedirects)
      {
        source: '/kasko-teklif',
        destination: '/kasko-sigortasi',
        permanent: true,
      },
      {
        source: '/imm-teklif',
        destination: '/imm',
        permanent: true,
      },
      {
        source: '/dask-teklif',
        destination: '/dask',
        permanent: true,
      },
      {
        source: '/tss-teklif',
        destination: '/tamamlayici-saglik-sigortasi',
        permanent: true,
      },  
      {
        source: '/trafik-teklif',
        destination: '/zorunlu-trafik-sigortasi',
        permanent: true,
      },
      {
        source: '/konut-teklif',
        destination: '/konut-sigortasi',
        permanent: true,
      },
      {
        source: '/acil-saglik-teklif',
        destination: '/acil-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/yabanci-saglik-teklif',
        destination: '/yabanci-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/ozel-saglik-teklif',
        destination: '/ozel-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/ferdi-kaza-teklif',
        destination: '/ferdi-kaza-sigortasi',
        permanent: true,
      },  
      {
        source: '/seyahat-saglik-teklif',
        destination: '/seyahat-saglik-sigortasi',
        permanent: true,
      },
      // Eski URL'lerden yeni URL'lere 301 yönlendirmeleri
      {
        source: '/page/tamamlayici-saglik-sigortasi',
        destination: '/tamamlayici-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/page/ferdi-kaza-sigortasi',
        destination: '/ferdi-kaza-sigortasi',
        permanent: true,
      },
      {
        source: '/page/konut-sigortasi',
        destination: '/konut-sigortasi',
        permanent: true,
      },
      {
        source: '/page/turkiye-katilim-sigorta',
        destination: '/anlasmali-sigorta-sirketleri/turkiye-katilim-sigorta',
        permanent: true,
      },
      {
        source: '/page/yuvam',
        destination: '/yuvam',
        permanent: true,
      },
      {
        source: '/page/bereket-sigorta',
        destination: '/anlasmali-sigorta-sirketleri/bereket-sigorta',
        permanent: true,
      },
      {
        source: '/page/dask',
        destination: '/dask',
        permanent: true,
      },
      {
        source: '/page/katilim-emeklilik',
        destination: '/anlasmali-sigorta-sirketleri/katilim-emeklilik',
        permanent: true,
      },
      {
        source: '/page/yabanci-saglik-sigortasi',
        destination: '/yabanci-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/page/neden-katilim-sigortaciligi',
        destination: '/neden-katilim-sigortaciligi',
        permanent: true,
      },
      {
        source: '/page/seyahat-saglik-sigortasi',
        destination: '/seyahat-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/page/ozel-saglik-sigortasi',
        destination: '/ozel-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/saglik/ferdi-kaza',
        destination: '/ferdi-kaza-teklif',
        permanent: true,
      },
      {
        source: '/page/zorunlu-trafik-sigortasi',
        destination: '/zorunlu-trafik-sigortasi',
        permanent: true,
      },
      {
        source: '/page/kasko-sigortasi',
        destination: '/kasko-sigortasi',
        permanent: true,
      },
      {
        source: '/page/imm',
        destination: '/imm',
        permanent: true,
      },
      {
        source: '/page/blog-post',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/saglik/tamamlayici-saglik-sigortasi-satin-al',
        destination: '/tamamlayici-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/page/kvkk',
        destination: '/kvkk',
        permanent: true,
      },
      {
        source: '/dask/dask-sigortasi-al',
        destination: '/dask',
        permanent: true,
      },
      {
        source: '/konut/konut-sigortasi-edin',
        destination: '/konut-sigortasi',
        permanent: true,
      },
      {
        source: '/oto/trafik-sigortasi-satin-al',
        destination: '/zorunlu-trafik-sigortasi',
        permanent: true,
      },
      {
        source: '/oto/kapsamli-kasko-teklifi-al',
        destination: '/kasko-sigortasi',
        permanent: true,
      },
      {
        source: '/oto/trafik-sigortasi',
        destination: '/zorunlu-trafik-sigortasi',
        permanent: true,
      },
      {
        source: '/oto/hesapli-kasko',
        destination: '/sozluk/dar-kasko',
        permanent: true,
      },
      {
        source: '/oto/standart-trafik',
        destination: '/sozluk/tazminat-talebi',
        permanent: true,
      },
      {
        source: '/saglik/imm',
        destination: '/imm',
        permanent: true,
      },
      {
        source: '/saglik/yabanci-saglik',
        destination: '/yabanci-saglik-sigortasi',
        permanent: true,
      },
      {
        source: '/page/kampanyalar',
        destination: '/kampanyalar',
        permanent: true,
      },
      {
        source: '/page/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/page/aracim',
        destination: '/aracim',
        permanent: true,
      },
      {
        source: '/page/biz-kimiz',
        destination: '/biz-kimiz',
        permanent: true,
      },
      {
        source: '/page/cerez-politikasi',
        destination: '/cerez-politikasi',
        permanent: true,
      },
      {
        source: '/page/iletisim',
        destination: '/iletisim',
        permanent: true,
      },
      {
        source: '/page/sagligim',
        destination: '/sagligim',
        permanent: true,
      },
      {
        source: '/page/sikca-sorulan-sorular',
        destination: '/sikca-sorulan-sorular',
        permanent: true,
      },
      {
        source: '/page/sozluk',
        destination: '/sozluk',
        permanent: true,
      },
      {
        source: '/page/sozluk-detay',
        destination: '/sozluk',
        permanent: true,
      },
      {
        source: '/page/kullanici-sozlesmesi',
        destination: '/kullanici-sozlesmesi',
        permanent: true,
      },
      {
        source: '/page/anlasmali-sigorta-sirketleri',
        destination: '/anlasmali-sigorta-sirketleri',
        permanent: true,
      },
      {
        source: '/page/kampanya-detay',
        destination: '/kampanyalar',
        permanent: true,
      },
      {
        source: '/page/anlasmali-sigorta-sirketi-detay',
        destination: '/anlasmali-sigorta-sirketleri',
        permanent: true,
      },
      {
        source: '/page/hdi-katilim-sigorta',
        destination: '/anlasmali-sigorta-sirketleri/hdi-katilim-sigorta',
        permanent: true,
      },
      {
        source: '/page/mesafeli-satis-sozlesmesi',
        destination: '/mesafeli-satis-sozlesmesi',
        permanent: true,
      },
      {
        source: '/page/acik-riza-metni',
        destination: '/acik-riza-metni',
        permanent: true,
      },
      {
        source: '/page/elektronik-ileti-onayi',
        destination: '/elektronik-ileti-onayi',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/proxy-paratika/:path*',
        destination: 'https://vpos.paratika.com.tr/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://api.insurup.com/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig