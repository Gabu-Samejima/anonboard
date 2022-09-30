/** @type {import('next').NextConfig} */

const cp = require('child_process');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  // generateBuildId: async () => {
  //   if (process.env.BUILD_ID) return process.env.BUILD_ID

  //   return new Promise((resolve, reject) => {
  //     cp.execFile("git", ["rev-parse", "HEAD"], (error, stdout) => {
  //       if (error) reject(error)
  //       resolve(stdout)
  //     })
  //   })
  // },
};

module.exports = nextConfig;
