import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the webpage with timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract metadata
    const getMetaContent = (name: string, property?: string) => {
      // Try property first (OpenGraph)
      if (property) {
        const meta = document.querySelector(`meta[property="${property}"]`);
        if (meta) return meta.getAttribute('content');
      }
      
      // Try name attribute
      const meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) return meta.getAttribute('content');
      
      return null;
    };

    const getTitle = () => {
      // Try OpenGraph title first
      const ogTitle = getMetaContent('', 'og:title');
      if (ogTitle) return ogTitle;
      
      // Try Twitter title
      const twitterTitle = getMetaContent('twitter:title');
      if (twitterTitle) return twitterTitle;
      
      // Fall back to document title
      return document.title || validUrl.hostname;
    };

    const getDescription = () => {
      // Try OpenGraph description first
      const ogDesc = getMetaContent('', 'og:description');
      if (ogDesc) return ogDesc;
      
      // Try Twitter description
      const twitterDesc = getMetaContent('twitter:description');
      if (twitterDesc) return twitterDesc;
      
      // Try meta description
      const metaDesc = getMetaContent('description');
      if (metaDesc) return metaDesc;
      
      return null;
    };

    const getImage = () => {
      // Try OpenGraph image first
      const ogImage = getMetaContent('', 'og:image');
      if (ogImage) {
        // Convert relative URLs to absolute
        if (ogImage.startsWith('//')) {
          return `https:${ogImage}`;
        } else if (ogImage.startsWith('/')) {
          return `${validUrl.protocol}//${validUrl.host}${ogImage}`;
        } else if (!ogImage.startsWith('http')) {
          return `${validUrl.protocol}//${validUrl.host}/${ogImage}`;
        }
        return ogImage;
      }
      
      // Try Twitter image
      const twitterImage = getMetaContent('twitter:image');
      if (twitterImage) {
        if (twitterImage.startsWith('//')) {
          return `https:${twitterImage}`;
        } else if (twitterImage.startsWith('/')) {
          return `${validUrl.protocol}//${validUrl.host}${twitterImage}`;
        } else if (!twitterImage.startsWith('http')) {
          return `${validUrl.protocol}//${validUrl.host}/${twitterImage}`;
        }
        return twitterImage;
      }
      
      return null;
    };

    const getSiteName = () => {
      // Try OpenGraph site name first
      const ogSiteName = getMetaContent('', 'og:site_name');
      if (ogSiteName) return ogSiteName;
      
      // Try Twitter site
      const twitterSite = getMetaContent('twitter:site');
      if (twitterSite) return twitterSite;
      
      // Fall back to hostname
      return validUrl.hostname;
    };

    const getFavicon = () => {
      // Try to find favicon
      const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      if (favicon) {
        const href = favicon.getAttribute('href');
        if (href) {
          if (href.startsWith('//')) {
            return `https:${href}`;
          } else if (href.startsWith('/')) {
            return `${validUrl.protocol}//${validUrl.host}${href}`;
          } else if (!href.startsWith('http')) {
            return `${validUrl.protocol}//${validUrl.host}/${href}`;
          }
          return href;
        }
      }
      
      // Fall back to default favicon location
      return `${validUrl.protocol}//${validUrl.host}/favicon.ico`;
    };

    const getPublishedTime = () => {
      // Try article:published_time
      const publishedTime = getMetaContent('', 'article:published_time');
      if (publishedTime) return publishedTime;
      
      // Try other date formats
      const datePublished = getMetaContent('datePublished');
      if (datePublished) return datePublished;
      
      return null;
    };

    const getAuthor = () => {
      // Try article:author
      const author = getMetaContent('', 'article:author');
      if (author) return author;
      
      // Try author meta tag
      const metaAuthor = getMetaContent('author');
      if (metaAuthor) return metaAuthor;
      
      return null;
    };

    const previewData = {
      title: getTitle(),
      description: getDescription(),
      image: getImage(),
      siteName: getSiteName(),
      favicon: getFavicon(),
      publishedTime: getPublishedTime(),
      author: getAuthor(),
    };

    return NextResponse.json(previewData);

  } catch (error) {
    console.error('Link preview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link preview' },
      { status: 500 }
    );
  }
}
