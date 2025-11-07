/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gspmrhanymtnzllaitiu.supabase.co", // domain Supabase kamu
        pathname: "/storage/v1/object/public/**",     // path ke bucket Supabase
      },
      {
        protocol: "https",
        hostname: "placehold.co", // kalau kamu masih pakai ini untuk dummy image
      },
    ],
  },
}

module.exports = nextConfig;
