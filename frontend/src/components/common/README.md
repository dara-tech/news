# Share Components

This directory contains advanced share components for social media sharing functionality across the application.

## Components Overview

### 1. ShareComponent
Basic share component with essential social platforms and features.

**Features:**
- Multiple social platforms (Facebook, Twitter, LinkedIn, WhatsApp, Email)
- Copy link functionality with clipboard API
- QR code generation (placeholder)
- Social share counts display
- Multiple size variants (sm, md, lg)
- Multiple style variants (default, minimal, floating)
- Dark mode support
- Toast notifications for user feedback

**Usage:**
```tsx
import ShareComponent from '@/components/common/ShareComponent';

<ShareComponent
  url="https://example.com/article"
  title="Article Title"
  description="Article description"
  image="https://example.com/image.jpg"
  variant="default"
  size="md"
  showSocialCounts={true}
  showQRCode={true}
  onShare={(platform) => console.log(`Shared on ${platform}`)}
/>
```

### 2. AdvancedShareComponent
Enhanced share component with advanced features and mobile optimization.

**Features:**
- All features from ShareComponent
- Mobile-optimized sharing with native app support
- Share analytics tracking
- Customizable platform selection
- Sheet view on mobile devices
- Callback support for tracking
- More social platforms (Telegram, Pinterest, Reddit)

**Usage:**
```tsx
import AdvancedShareComponent from '@/components/common/AdvancedShareComponent';

<AdvancedShareComponent
  url="https://example.com/article"
  title="Article Title"
  description="Article description"
  image="https://example.com/image.jpg"
  variant="default"
  size="md"
  showSocialCounts={true}
  showQRCode={true}
  showAnalytics={true}
  platforms={['facebook', 'twitter', 'whatsapp', 'telegram']}
  onShare={(platform) => {
    // Track share analytics
    console.log(`Shared on ${platform}`);
  }}
/>
```

### 3. FloatingShareButton
Fixed position share button that appears on scroll.

**Features:**
- Fixed position in bottom-right corner
- Scroll-triggered visibility
- Smooth animations
- High z-index for overlay
- Customizable scroll threshold
- Responsive design

**Usage:**
```tsx
import FloatingShareButton from '@/components/common/FloatingShareButton';

<FloatingShareButton
  url="https://example.com/article"
  title="Article Title"
  description="Article description"
  image="https://example.com/image.jpg"
  showOnScroll={true}
  scrollThreshold={300}
/>
```

## Props Reference

### ShareComponent & AdvancedShareComponent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | - | The URL to share (required) |
| `title` | `string` | - | The title to share (required) |
| `description` | `string` | `''` | The description to share |
| `image` | `string` | `''` | The image URL to share |
| `variant` | `'default' \| 'minimal' \| 'floating' \| 'inline'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `className` | `string` | - | Additional CSS classes |
| `showSocialCounts` | `boolean` | `false` | Show social share counts |
| `showQRCode` | `boolean` | `false` | Show QR code section |
| `showAnalytics` | `boolean` | `false` | Show share analytics (Advanced only) |
| `platforms` | `string[]` | `['facebook', 'twitter', 'linkedin', 'whatsapp', 'email']` | Custom platform selection (Advanced only) |
| `onShare` | `(platform: string) => void` | - | Callback when sharing |

### FloatingShareButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | - | The URL to share (required) |
| `title` | `string` | - | The title to share (required) |
| `description` | `string` | `''` | The description to share |
| `image` | `string` | `''` | The image URL to share |
| `className` | `string` | - | Additional CSS classes |
| `showOnScroll` | `boolean` | `true` | Show button on scroll |
| `scrollThreshold` | `number` | `300` | Scroll threshold in pixels |

## Supported Platforms

### Basic Platforms
- **Facebook**: Opens Facebook share dialog (FaFacebook)
- **Twitter/X**: Opens Twitter share dialog (SiX)
- **LinkedIn**: Opens LinkedIn share dialog (FaLinkedin)
- **WhatsApp**: Opens WhatsApp share dialog (FaWhatsapp, mobile-optimized)
- **Email**: Opens email client with pre-filled content (FaEnvelope)

### Advanced Platforms (AdvancedShareComponent only)
- **Telegram**: Opens Telegram share dialog (FaTelegram)
- **Pinterest**: Opens Pinterest share dialog (FaPinterest)
- **Reddit**: Opens Reddit submit dialog (FaReddit)
- **Instagram**: Opens Instagram share dialog (FaInstagram)
- **YouTube**: Opens YouTube share dialog (FaYoutube)
- **Discord**: Opens Discord share dialog (FaDiscord)

## Mobile Optimization

The AdvancedShareComponent automatically detects mobile devices and:
- Uses Sheet component instead of Popover on mobile
- Utilizes native app URLs when available (WhatsApp, Telegram)
- Provides better touch interactions
- Optimizes layout for smaller screens

## Analytics Integration

The AdvancedShareComponent includes built-in analytics tracking:
- Tracks share counts per platform
- Provides callback for custom analytics
- Displays analytics in the UI when enabled

## Styling

All components support:
- Dark mode through CSS variables
- Custom className prop for additional styling
- Responsive design
- Smooth animations and transitions
- Hover effects and visual feedback

## Demo

Visit `/share-demo` to see all components in action with interactive examples.

## Dependencies

- `react-icons`: Social media and UI icons
- `lucide-react`: UI icons (Share, Copy, Check, Link, X)
- `@/components/ui/*`: UI components
- `@/lib/utils`: Utility functions
- `sonner`: Toast notifications
- `@/hooks/use-mobile`: Media query hook

## Browser Support

- Modern browsers with ES6+ support
- Clipboard API for copy functionality
- CSS Grid and Flexbox for layout
- CSS Custom Properties for theming 