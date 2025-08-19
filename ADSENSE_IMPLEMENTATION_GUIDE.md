# 🚀 Google AdSense Implementation Guide

## ✅ **Legal Pages Created Successfully!**

All required legal pages have been implemented and are now accessible:

- ✅ **Privacy Policy**: `/privacy` - Complete with AdSense compliance
- ✅ **Terms of Service**: `/terms` - Complete with AdSense compliance  
- ✅ **Cookie Policy**: `/cookie-policy` - Complete with AdSense compliance
- ✅ **About Page**: `/about` - Complete with contact information
- ✅ **Footer Links**: All legal pages linked in footer

---

## 📋 **Next Steps for AdSense Approval**

### **1. Apply for Google AdSense**
1. **Visit**: https://www.google.com/adsense
2. **Sign in** with your Google account
3. **Click "Get Started"**
4. **Enter your website**: `https://www.razewire.online`
5. **Fill out the application form**:
   - Contact information
   - Payment information
   - Content language (English/Khmer)
   - Site category (News)

### **2. Wait for Review (1-2 weeks)**
- Google will review your site for compliance
- They'll check the legal pages we just created
- They'll verify content quality and site structure
- You'll receive an email with the decision

### **3. Upon Approval - Implement AdSense Code**

#### **Step 1: Get Your AdSense Code**
After approval, Google will provide you with a code snippet like this:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

#### **Step 2: Add to Your Layout**
Add the AdSense code to your main layout file:

```typescript
// frontend/src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

#### **Step 3: Create Ad Components**

**Header Ad Component:**
```typescript
// frontend/src/components/ads/HeaderAd.tsx
export default function HeaderAd() {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 text-center">
      <ins className="adsbygoogle"
           style={{display: 'block'}}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
  );
}
```

**Sidebar Ad Component:**
```typescript
// frontend/src/components/ads/SidebarAd.tsx
export default function SidebarAd() {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <ins className="adsbygoogle"
           style={{display: 'block'}}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
  );
}
```

**In-Content Ad Component:**
```typescript
// frontend/src/components/ads/InContentAd.tsx
export default function InContentAd() {
  return (
    <div className="my-8 text-center">
      <ins className="adsbygoogle"
           style={{display: 'block'}}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
  );
}
```

#### **Step 4: Place Ads in Your Layout**

**Header Ad (in layout):**
```typescript
// frontend/src/components/layout/Header.tsx
import HeaderAd from '@/components/ads/HeaderAd';

export default function Header() {
  return (
    <header>
      <HeaderAd />
      {/* Your existing header content */}
    </header>
  );
}
```

**Sidebar Ad (in news pages):**
```typescript
// frontend/src/app/[lang]/news/page.tsx
import SidebarAd from '@/components/ads/SidebarAd';

export default function NewsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        {/* News content */}
      </div>
      <div className="lg:col-span-1">
        <SidebarAd />
        {/* Other sidebar content */}
      </div>
    </div>
  );
}
```

**In-Content Ad (in article pages):**
```typescript
// frontend/src/app/[lang]/news/[slug]/page.tsx
import InContentAd from '@/components/ads/InContentAd';

export default function ArticlePage() {
  return (
    <article>
      {/* Article header */}
      <div className="prose max-w-none">
        {/* First paragraph */}
        <InContentAd />
        {/* Rest of article content */}
      </div>
    </article>
  );
}
```

---

## 🎯 **AdSense Best Practices**

### **1. Ad Placement Guidelines**
- **Don't place too many ads** - Keep it reasonable
- **Don't place ads too close together** - Maintain good spacing
- **Don't place ads in navigation areas** - Keep navigation clean
- **Don't place ads in pop-ups** - Avoid intrusive placements

### **2. Content Guidelines**
- **Keep content high quality** - Continue publishing good articles
- **Avoid prohibited content** - No adult content, violence, etc.
- **Maintain site functionality** - Don't let ads break the site
- **Follow AdSense policies** - Read and follow all guidelines

### **3. Technical Guidelines**
- **Mobile responsive** - Ensure ads work on all devices
- **Fast loading** - Don't let ads slow down your site
- **Proper implementation** - Follow Google's implementation guidelines
- **Testing** - Test ads in different browsers and devices

---

## 📊 **Expected Timeline**

### **Week 1-2: Application & Review**
- Submit AdSense application
- Wait for Google review
- Address any issues if application is rejected

### **Week 3: Implementation**
- Receive approval email
- Implement AdSense code
- Place ads strategically
- Test functionality

### **Week 4+: Optimization**
- Monitor performance
- Optimize ad placement
- Track revenue
- Scale content production

---

## 💡 **Tips for Success**

### **1. Content Quality**
- Continue publishing high-quality articles
- Maintain regular posting schedule
- Focus on original, valuable content
- Keep content family-friendly

### **2. Site Performance**
- Ensure fast loading times
- Maintain mobile responsiveness
- Keep site navigation clean
- Regular maintenance and updates

### **3. User Experience**
- Don't overwhelm users with ads
- Maintain good content-to-ad ratio
- Keep ads relevant and non-intrusive
- Provide value to users first

### **4. Compliance**
- Follow AdSense policies strictly
- Keep legal pages updated
- Monitor for policy changes
- Address any compliance issues promptly

---

## 🎉 **You're Ready for AdSense!**

Your site now has all the required legal pages and compliance elements for Google AdSense approval. The implementation guide above will help you get started once you receive approval.

**Key Strengths for Approval:**
- ✅ Complete legal compliance
- ✅ High-quality content (268 articles)
- ✅ Professional site structure
- ✅ Mobile responsive design
- ✅ Clean, family-friendly content
- ✅ Proper contact information

**Next Action:** Apply for Google AdSense at https://www.google.com/adsense

Good luck! 🚀
