/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // used by the mock data in lib/data.ts
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // real product images once Cloudinary uploads are wired in
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // real product images once Cloudinary uploads are wired in
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile avatars
      },
    ],
  },
};

module.exports = nextConfig;
