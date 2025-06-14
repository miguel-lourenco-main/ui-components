export default function imageLoader({ src, width, quality }) {
  // For GitLab Pages deployments, images are served from the same domain
  // No need to transform the src for local images
  return src;
} 