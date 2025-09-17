// Custom image loader for Next.js Image component
// Handles Cloudinary URLs and other external images properly

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  // If it's a Cloudinary URL, use Cloudinary's transformation API
  if (src.includes('res.cloudinary.com')) {
    // Extract the base URL and transformation parameters
    const url = new URL(src);
    const pathParts = url.pathname.split('/');
    
    // Cloudinary URL structure: /v{version}/{folder}/{filename}
    if (pathParts.length >= 4) {
      const version = pathParts[1];
      const folder = pathParts[2];
      const filename = pathParts[3];
      
      // Build optimized Cloudinary URL with width and quality
      const cloudinaryBase = `https://res.cloudinary.com/${url.hostname.split('.')[0]}`;
      const transformation = `w_${width},q_${quality},f_auto,c_fill`;
      
      return `${cloudinaryBase}/image/upload/${transformation}/v${version}/${folder}/${filename}`;
    }
    
    // Fallback: return original URL if parsing fails
    return src;
  }
  
  // If it's a placeholder service, add width parameter
  if (src.includes('via.placeholder.com')) {
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    return url.toString();
  }
  
  // For other external URLs, return as-is
  return src;
}

