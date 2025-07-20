import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Add a rule to handle PDF files
    config.module.rules.push({
      test: /\.pdf$/,
      use: 'raw-loader',
    });
    
    // This is required by react-pdf to correctly load its worker
    config.resolve.alias['pdfjs-dist'] = path.join(
      __dirname,
      './node_modules/pdfjs-dist/legacy/build/pdf.js'
    );
    config.resolve.alias['pdfjs-dist/build/pdf.worker.entry.js'] = path.join(
      __dirname,
      './node_modules/pdfjs-dist/legacy/build/pdf.worker.entry.js'
    );

    return config;
  },
};

export default nextConfig;
