/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configurar diretórios de páginas
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Configuração para imagens
  images: {
    domains: ['amenirealestate.com.br'],
  },
  // Add path aliases to match the ones from Vite
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': `${process.cwd()}/client/src`,
      '@shared': `${process.cwd()}/shared`,
      '@assets': `${process.cwd()}/attached_assets`,
    };
    return config;
  },
  // Ensure environment variables are properly exposed to the client
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_AUTH_URL: process.env.NEXT_PUBLIC_API_AUTH_URL,
    NEXT_PUBLIC_API_ME_URL: process.env.NEXT_PUBLIC_API_ME_URL,
    NEXT_PUBLIC_API_CLIENTES_URL: process.env.NEXT_PUBLIC_API_CLIENTES_URL,
    NEXT_PUBLIC_API_UNIDADES_URL: process.env.NEXT_PUBLIC_API_UNIDADES_URL,
    NEXT_PUBLIC_API_SERVICOS_URL: process.env.NEXT_PUBLIC_API_SERVICOS_URL,
    NEXT_PUBLIC_API_CONFORMIDADE_URL: process.env.NEXT_PUBLIC_API_CONFORMIDADE_URL,
    NEXT_PUBLIC_API_FOLLOWUP_URL: process.env.NEXT_PUBLIC_API_FOLLOWUP_URL,
  },
};

module.exports = nextConfig;
