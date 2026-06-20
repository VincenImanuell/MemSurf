import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the MemWal SDK and its crypto peers out of the bundler; they run
  // server-side in the API route as plain node modules.
  serverExternalPackages: [
    "@mysten-incubation/memwal",
    "@mysten/sui",
    "@mysten/seal",
    "@mysten/walrus",
  ],
};

export default nextConfig;
