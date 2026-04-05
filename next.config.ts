const isGithub = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  ...(isGithub && {
    output: "export",
    basePath: "/Mera-Dukan-Mera-Godam",
  }),
  images: {
    unoptimized: true,
  }, async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups", // ✅ FIX
          },
        ],
      },
    ];
  },
};

export default nextConfig;