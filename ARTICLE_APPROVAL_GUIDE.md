# 📰 Article Approval & Professional Quality Guide

## 📊 **Current Article Status Analysis**

Based on your database analysis, you have:
- **📰 Total Articles**: 255
- **✅ Published**: 14 articles
- **📝 Drafts**: 241 articles (needing approval)
- **⚠️ Articles with Issues**: 241 (missing thumbnails, tags, etc.)

---

## 🎯 **Professional Article Approval Checklist**

### **✅ Essential Requirements (Must Have)**

#### **1. Content Quality**
- [ ] **Title**: Clear, engaging, 50-60 characters max
- [ ] **Description**: Compelling summary, 150-160 characters
- [ ] **Content**: Well-structured, 300+ words minimum
- [ ] **Multilingual**: Complete English AND Khmer versions
- [ ] **Grammar**: Error-free, professional language
- [ ] **Fact-checking**: Accurate information, proper sources

#### **2. Visual Elements**
- [ ] **Thumbnail**: High-quality image (1200x630px recommended)
- [ ] **Images**: Relevant photos/graphics in content
- [ ] **Alt text**: Descriptive image captions
- [ ] **Social media preview**: Optimized for sharing

#### **3. SEO & Metadata**
- [ ] **Keywords**: 5-10 relevant keywords
- [ ] **Tags**: 3-7 descriptive tags
- [ ] **Meta description**: SEO-optimized summary
- [ ] **Slug**: Clean, readable URL
- [ ] **Category**: Properly assigned

#### **4. Technical Requirements**
- [ ] **Author**: Assigned to a real user
- [ ] **Status**: Set to "published" when ready
- [ ] **Featured/Breaking**: Marked appropriately
- [ ] **Publish date**: Set correctly

---

## 🔧 **How to Approve Articles in Admin Panel**

### **Step 1: Access Article Management**
1. Go to: **Admin → News**
2. You'll see all articles with their status

### **Step 2: Review Draft Articles**
1. **Filter by "Draft" status**
2. **Click on each article** to review
3. **Check the quality checklist** above
4. **Make necessary edits** before approval

### **Step 3: Fix Common Issues**

#### **Missing Thumbnails**
```bash
# Quick fix: Use placeholder images
https://via.placeholder.com/1200x630/2563eb/ffffff?text=Article+Title
```

#### **Missing Tags**
Add relevant tags like:
- `Cambodia`, `Politics`, `Business`, `Technology`
- `Breaking News`, `Analysis`, `Feature`
- Location tags: `Phnom Penh`, `Siem Reap`

#### **Missing Keywords**
Extract 5-10 keywords from the article content

### **Step 4: Approve Articles**
1. **Edit the article** to fix issues
2. **Set status to "Published"**
3. **Add publish date**
4. **Save changes**

---

## 📋 **Article Quality Standards**

### **🟢 Excellent Quality (Ready to Publish)**
- Complete bilingual content
- Professional thumbnail
- Proper SEO optimization
- Engaging headline
- Well-structured content
- Relevant tags and keywords
- Author assigned

### **🟡 Good Quality (Minor Fixes Needed)**
- Missing thumbnail
- Incomplete tags/keywords
- Minor grammar issues
- Needs better description

### **🔴 Poor Quality (Major Work Needed)**
- Incomplete content
- Missing translations
- No visual elements
- Poor grammar/spelling
- No SEO optimization

---

## 🚀 **Quick Approval Workflow**

### **For Articles Missing Only Thumbnails:**
1. **Generate placeholder image** with article title
2. **Add relevant tags** (3-5 tags)
3. **Add keywords** (5-10 keywords)
4. **Set status to "Published"**
5. **Save**

### **For Articles with Good Content:**
1. **Review and approve** immediately
2. **Add missing metadata**
3. **Publish**

### **For Articles Needing Work:**
1. **Mark for editing**
2. **Add to editing queue**
3. **Improve content quality**
4. **Re-review before publishing**

---

## 📈 **Priority Approval Order**

### **High Priority (Publish First)**
1. **Breaking news** articles
2. **High-quality drafts** with complete content
3. **Featured articles** with good engagement potential
4. **Articles with good SEO** potential

### **Medium Priority**
1. **Articles missing only thumbnails**
2. **Articles with minor content issues**
3. **Older drafts** that are still relevant

### **Low Priority**
1. **Articles needing major rewrites**
2. **Outdated content**
3. **Poor quality drafts**

---

## 🛠️ **Tools for Quick Approval**

### **1. Bulk Thumbnail Generator**
```javascript
// Add this to your admin panel for quick thumbnail generation
const generateThumbnail = (title) => {
  return `https://via.placeholder.com/1200x630/2563eb/ffffff?text=${encodeURIComponent(title)}`;
};
```

### **2. Auto-Tag Generator**
```javascript
// Extract tags from article content
const extractTags = (content) => {
  const commonTags = ['Cambodia', 'News', 'Politics', 'Business', 'Technology'];
  // Add logic to extract relevant tags
  return commonTags.filter(tag => content.includes(tag));
};
```

### **3. SEO Optimizer**
```javascript
// Generate meta description from content
const generateMetaDescription = (content) => {
  return content.substring(0, 160) + '...';
};
```

---

## 📊 **Approval Progress Tracking**

### **Daily Goals**
- **Day 1**: Approve 50 high-quality drafts
- **Day 2**: Fix and approve 50 articles with minor issues
- **Day 3**: Review and improve 50 articles needing work
- **Day 4**: Final review and publish remaining articles

### **Quality Metrics**
- **Target**: 80% of articles meet professional standards
- **Minimum**: 300+ words per article
- **SEO Score**: 80+ for all published articles
- **Engagement**: 5+ tags per article

---

## 🎨 **Professional Article Templates**

### **News Article Template**
```
Title: [Clear, engaging headline]
Description: [Compelling 2-3 sentence summary]
Content: [Well-structured paragraphs with quotes, facts, context]
Tags: [5-7 relevant tags]
Keywords: [5-10 SEO keywords]
Thumbnail: [High-quality relevant image]
```

### **Feature Article Template**
```
Title: [In-depth, descriptive headline]
Description: [Detailed summary highlighting key points]
Content: [Comprehensive analysis with multiple sources]
Tags: [7-10 detailed tags]
Keywords: [10-15 specific keywords]
Thumbnail: [Professional feature image]
```

---

## 🔍 **Quality Control Checklist**

### **Before Publishing**
- [ ] Content is factually accurate
- [ ] Grammar and spelling are correct
- [ ] Both languages are complete
- [ ] Images are high-quality and relevant
- [ ] SEO elements are optimized
- [ ] Tags and keywords are relevant
- [ ] Author is properly assigned
- [ ] Category is correct
- [ ] Status is set to "Published"
- [ ] Publish date is set

### **After Publishing**
- [ ] Article displays correctly on website
- [ ] Social media preview works
- [ ] SEO metadata is visible
- [ ] Images load properly
- [ ] Links work correctly
- [ ] Mobile display is good

---

## 💡 **Pro Tips for Professional Articles**

1. **Use engaging headlines** that grab attention
2. **Include relevant images** to break up text
3. **Add quotes and sources** for credibility
4. **Use proper formatting** (headings, lists, paragraphs)
5. **Optimize for mobile** reading
6. **Include call-to-action** when appropriate
7. **Cross-link** to related articles
8. **Monitor performance** after publishing

---

## 🚨 **Common Issues to Avoid**

- **Duplicate content** across articles
- **Poor image quality** or irrelevant images
- **Missing translations** or incomplete content
- **Weak headlines** that don't engage readers
- **No SEO optimization** (missing keywords, tags)
- **Poor grammar** or spelling errors
- **Outdated information** or broken links
- **Inconsistent formatting** across articles

---

## 📞 **Need Help?**

If you need assistance with article approval:
1. **Check the quality checklist** above
2. **Use the quick approval workflow**
3. **Focus on high-priority articles first**
4. **Set up approval templates** for consistency
5. **Monitor quality metrics** regularly

**Remember**: Quality over quantity! It's better to publish fewer high-quality articles than many poor-quality ones.

