

const nextConfig = {
  /* config options here */
  distDir: '.next-build',
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
    {
      protocol: 'https',
      hostname: 'placehold.co',
      port: '',
      pathname: '/**'
    }]

  },
  allowedDevOrigins: [
  'https://6000-firebase-studio-1752923022392.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev']

};

export default nextConfig;