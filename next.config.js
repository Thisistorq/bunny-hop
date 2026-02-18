/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dgalywyr863hv.cloudfront.net", // Strava CDN for profile images
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
    ],
  },
};

module.exports = nextConfig;
