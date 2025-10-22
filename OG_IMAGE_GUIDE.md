# Creating Your Open Graph (OG) Image

An Open Graph image is what appears when someone shares your link on social media (Facebook, Twitter, LinkedIn, etc.).

## Image Specifications

- **Size:** 1200 x 630 pixels (required)
- **Format:** PNG or JPG
- **File size:** Under 5MB (ideally under 300KB)
- **Location:** `public/og-image.png`

## What to Include

1. **Your Logo/Brand Name** - "Aury Marketplace"
2. **Tagline** - "Handmade Marketplace for Creators"
3. **Visual Elements** - Crochet/craft imagery
4. **Colors** - Match your brand colors

## Design Template (Canva/Figma)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    [YOUR LOGO]                         │
│                                                        │
│                  Aury Marketplace                      │
│                                                        │
│        Discover Unique Handmade Crafts                 │
│          Shop • Sell • Create                          │
│                                                        │
│                                                        │
│  [Decorative crochet/craft icons or patterns]         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Quick Tools

### Option 1: Canva (Easiest)
1. Go to canva.com
2. Search "Open Graph Image" template
3. Customize with your brand
4. Download as PNG
5. Save to `public/og-image.png`

### Option 2: Figma
1. Create 1200x630px frame
2. Add your branding
3. Export as PNG
4. Save to `public/og-image.png`

### Option 3: Online Generator
- Use https://www.opengraph.xyz/
- Input your brand details
- Download and save

## Example Design Ideas

### Minimalist
```
Clean white background
Large "Aury" logo center
Small tagline below
Subtle craft pattern border
```

### Vibrant
```
Gradient background (blue to purple)
Large text: "Handmade Marketplace"
Product showcase grid
Aury logo in corner
```

### Community-Focused
```
Photos of handmade items
"Join 10K+ Creators"
Aury branding
Call to action
```

## Testing Your OG Image

After creating and deploying:

1. **Facebook Debugger:** https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
3. **LinkedIn Inspector:** https://www.linkedin.com/post-inspector/

Just paste your URL and see how it looks!

## Color Suggestions

Based on your brand:
- Primary: #6366f1 (Blue/Purple)
- Accent: #8b5cf6 (Purple)
- Background: White or light gradient

## Typography

- **Headline:** Bold, 72-96px
- **Subheading:** Medium, 36-48px
- **Body:** Regular, 24-32px

Make sure text is readable even when thumbnail is small!

## Pro Tips

✅ Keep text large and readable
✅ Use high contrast
✅ Test on both light and dark backgrounds
✅ Make it recognizable even when small
✅ Use your brand colors consistently

❌ Don't use too much text
❌ Avoid tiny details
❌ Don't make it cluttered
❌ Avoid copyrighted images

---

Once you create your `og-image.png`, place it in the `public/` folder and redeploy. Your site will automatically use it for social shares!
