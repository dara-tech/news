"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import AuthorProfile from "@/components/news/AuthorProfile"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import TwitterLikeLayout from "@/components/hero/TwitterLikeLayout"

// ----- INTERFACES -----
interface AuthorData {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  role: string;
  stats: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    joinDate: string;
  };
}

interface AuthorArticle {
  _id: string;
  title: string | { en: string; kh: string };
  thumbnail?: string;
  createdAt: string;
  publishedAt: string;
  views: number;
  likes: number;
  category: {
    _id: string;
    name: string | { en: string; kh: string };
    color?: string;
    slug?: string;
  };
  slug?: string | { en: string; kh: string };
}

interface AuthorProfileData {
  success: boolean;
  author: AuthorData;
  articles: AuthorArticle[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
  };
}

interface AuthorPageProps {
  params: Promise<{ lang: string; authorId: string }>
  authorData: AuthorProfileData | null
}

// ----- HELPER FUNCTIONS -----
const getLocalizedText = (text: string | { en?: string; kh?: string } | undefined, lang: "en" | "kh" = "en"): string => {
  const safeLang = lang;
  if (!text) return "";
  if (typeof text === "string") return text;
  if (typeof text === "object") {
    if (typeof text[safeLang] === 'string') return text[safeLang]!;
    const values = Object.values(text).filter(Boolean);
    if (values.length > 0) return values[0] as string;
  }
  return "";
}

// Helper function for simple string translations
const getSimpleLocalizedText = (en: string, kh: string, locale: 'en' | 'kh'): string => {
  return locale === 'kh' ? kh : en;
};

// ----- PAGE COMPONENT -----
export default function AuthorPageClient({ params, authorData }: AuthorPageProps) {
  const { lang, authorId } = use(params);
  const safeLang = (lang === 'kh' ? 'kh' : 'en') as 'en' | 'kh';
  

  if (!authorData) {
    // Mobile error content
    const mobileErrorContent = (
      <div className="w-full p-4">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" className="mb-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
{getSimpleLocalizedText("Back to Home", "ត្រលប់ទៅទំព័រដើម", safeLang)}
            </Button>
          </Link>
        </div>
        
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {getSimpleLocalizedText("Author Not Found", "រកមិនឃើញអ្នកនិពន្ធ", safeLang)}
            </h2>
            <p className="text-base text-muted-foreground mb-6">
              {getSimpleLocalizedText("The author you are looking for does not exist.", "អ្នកនិពន្ធដែលអ្នកកំពុងស្វែងរកមិនមាន។", safeLang)}
            </p>
            <Link href="/">
              <Button className="w-full">
                {getSimpleLocalizedText("Go Back Home", "ត្រលប់ទៅទំព័រដើម", safeLang)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );

    // Desktop error content
    const desktopErrorContent = (
      <div className="w-full p-8">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6 sm:p-8 text-center">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              {getSimpleLocalizedText("Author Not Found", "រកមិនឃើញអ្នកនិពន្ធ", safeLang)}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {getSimpleLocalizedText("The author you are looking for does not exist.", "អ្នកនិពន្ធដែលអ្នកកំពុងស្វែងរកមិនមាន។", safeLang)}
            </p>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                {getSimpleLocalizedText("Go Back Home", "ត្រលប់ទៅទំព័រដើម", safeLang)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );

    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Layout - Full Width */}
        <div className="block lg:hidden">
          <div className="w-full">
            {mobileErrorContent}
          </div>
        </div>

        {/* Desktop Layout - Twitter-like */}
        <div className="hidden lg:block">
          <TwitterLikeLayout
            breaking={[]}
            featured={[]}
            latestNews={[]}
            categories={[]}
            locale={safeLang}
            isLoading={false}
            customMainContent={desktopErrorContent}
          />
        </div>
      </div>
    );
  }

  // Transform the data to match the AuthorProfile component interface
  const transformedAuthor = {
    _id: authorData.author._id,
    username: authorData.author.username,
    email: authorData.author.email,
    avatar: authorData.author.avatar,
    profileImage: authorData.author.profileImage,
    role: authorData.author.role
  };

  const transformedArticles = authorData.articles.map(article => ({
    _id: article._id,
    title: article.title,
    thumbnail: article.thumbnail,
    createdAt: article.publishedAt,
    views: article.views || 0,
    likes: article.likes || 0,
    comments: 0, // Not available in current API
    category: typeof article.category.name === 'string' 
      ? article.category.name 
      : getLocalizedText(article.category.name, safeLang),
    slug: article.slug || article._id // Add slug property
  }));

  // Mobile content
  const mobileAuthorContent = (
    <div className="w-full p-4">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" className="mb-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
{getSimpleLocalizedText("Back to Home", "ត្រលប់ទៅទំព័រដើម", safeLang)}
          </Button>
        </Link>
      </div>
      
      <AuthorProfile 
        author={transformedAuthor}
        authorStats={{
          totalArticles: authorData.author.stats.totalArticles,
          totalViews: authorData.author.stats.totalViews,
          totalLikes: authorData.author.stats.totalLikes,
          totalComments: 0, // Not available in current API
          joinDate: new Date(authorData.author.stats.joinDate)
        }}
        authorArticles={transformedArticles}
        pagination={authorData.pagination}
      />
    </div>
  );

  // Desktop content (Twitter-style)
  const desktopAuthorContent = (
    <div className="w-full">
      <AuthorProfile 
        author={transformedAuthor}
        authorStats={{
          totalArticles: authorData.author.stats.totalArticles,
          totalViews: authorData.author.stats.totalViews,
          totalLikes: authorData.author.stats.totalLikes,
          totalComments: 0, // Not available in current API
          joinDate: new Date(authorData.author.stats.joinDate)
        }}
        authorArticles={transformedArticles}
        pagination={authorData.pagination}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout - Full Width */}
      <div className="block lg:hidden">
        <div className="w-full">
          {mobileAuthorContent}
        </div>
      </div>

      {/* Desktop Layout - Twitter-like */}
      <div className="hidden lg:block">
        <TwitterLikeLayout
          breaking={[]}
          featured={[]}
          latestNews={[]}
          categories={[]}
          locale={safeLang}
          isLoading={false}
          customMainContent={desktopAuthorContent}
        />
      </div>
    </div>
  );
}
