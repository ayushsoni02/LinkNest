# Live Preview Hover-Board Documentation

## Overview

A sophisticated hover preview system for LinkNest cards that displays YouTube embeds and website iframes in a floating preview window. Features React Portal rendering, Framer Motion blur animations, smart viewport positioning, and 1-second hover delay.

## Components

### 1. LivePreviewPortal.tsx
The main preview window component rendered via React Portal.

### 2. SmartLinkCard.tsx (Updated)
Link card component with hover detection and preview management.

## Features

### ✨ Core Functionality

1. **1-Second Hover Delay**
   - Preview only appears after hovering for 1 second
   - Cancels if mouse leaves before timeout
   - Optimizes bandwidth and reduces accidental previews

2. **React Portal Rendering**
   - Renders into `#preview-root` div
   - Prevents z-index and overflow issues
   - Ensures preview stays above all content

3. **Smart Positioning**
   - Automatically calculates optimal position
   - Stays within viewport bounds
   - Tries positions in order: above → below → right → left

4. **YouTube Embed Support**
   - Auto-detects YouTube URLs
   - Extracts video ID
   - Embeds with `autoplay=1&mute=1`
   - Fully functional player with controls

5. **Website Iframe**
   - Attempts to load websites in iframe
   - Fallback message for sites with X-Frame-Options
   - "Open in New Tab" button for restricted sites

6. **Mini-Browser Chrome**
   - Realistic browser window design
   - Traffic light buttons (red, yellow, green)
   - URL bar showing the preview URL
   - Close button

### 🎨 Animations

**Entry Animation (Blur Entry):**
```typescript
initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
transition={{ duration: 0.3, ease: 'easeOut' }}
```

**Exit Animation:**
```typescript
exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
```

**Backdrop:**
```typescript
bg-black/20 backdrop-blur-sm
```

## Implementation Details

### Hover Logic

```typescript
const handleMouseEnter = () => {
  // Get card position
  const rect = cardRef.current.getBoundingClientRect();
  setCardPosition({
    x: rect.left,
    y: rect.top,
    cardWidth: rect.width,
    cardHeight: rect.height
  });

  // Set 1-second timeout
  hoverTimeoutRef.current = setTimeout(() => {
    setShowPreview(true);
  }, 1000);
};

const handleMouseLeave = () => {
  // Clear timeout if mouse leaves early
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
  }
  setShowPreview(false);
};
```

### Viewport Positioning Algorithm

```typescript
const getOptimalPosition = () => {
  const previewWidth = 640;  // 16:9 aspect ratio
  const previewHeight = 360;
  const padding = 20;

  let top = position.y - previewHeight - 20; // Try above first
  let left = position.x;

  // If not enough space above, place below
  if (top < padding) {
    top = position.y + position.cardHeight + 20;
  }

  // If not enough space below, try right side
  if  (top + previewHeight > viewportHeight - padding) {
    top = position.y;
    left = position.x + position.cardWidth + 20;
  }

  // If not enough space on right, try left side
  if (left + previewWidth > viewportWidth - padding) {
    left = position.x - previewWidth - 20;
  }

  // Final bounds check
  top = Math.max(padding, Math.min(top, viewportHeightHeight - previewHeight - padding));
  left = Math.max(padding, Math.min(left, viewportWidth - previewWidth - padding));

  return { top, left };
};
```

### YouTube URL Extraction

```typescript
const getYouTubeEmbedUrl = (youtubeUrl: string): string | null => {
  const parts = youtubeUrl.split('v=');
  const videoId = parts.length > 1 ? parts[1].split('&')[0] : null;
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1`;
  }
  return null;
};
```

## Styling

### Preview Window
```css
/* Size: 16:9 aspect ratio */
width: 640px
height: 360px

/* Background & Border */
bg-slate-800
rounded-2xl
border border-slate-700

/* Shadow */
shadow-2xl

/* Glow Effect */
bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl
```

### Mini-Browser Chrome
```css
/* Top Bar */
height: 40px (h-10)
bg-slate-900/95 backdrop-blur-sm
border-b border-slate-700

/* Traffic Lights */
w-3 h-3 rounded-full
bg-red-500/80 (close)
bg-yellow-500/80 (minimize)
bg-green-500/80 (maximize)

/* URL Bar */
flex-1 mx-4 px-3 py-1
bg-slate-800
rounded-md
border border-slate-600
text-xs text-slate-400
```

## Usage

The system is automatically integrated into `SmartLinkCard`. Simply hover over any card for 1 second to trigger the preview.

### Testing

1. **Navigate to Dashboard:**
   ```
   http://localhost:5173/Dashboard
   ```

2. **Find a YouTube link card**

3. **Hover over the card for 1+ seconds**

4. **Preview should appear with autoplaying video**

5. **Try moving mouse away before 1 second (should cancel)**

6. **Try clicking backdrop to close**

7. **Try pressing Escape to close**

## Performance Optimizations

### 1. Lazy Loading
- Iframe only creates after 1-second delay
- No bandwidth wasted on short hovers
- Reduces initial render cost

### 2. Cleanup on Unmount
```typescript
useEffect(() => {
  return () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };
}, []);
```

### 3. Portal Rendering
- Prevents unnecessary re-renders of parent components
- Isolated z-index stacking context
- Better performance for complex layouts

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close preview |
| Click backdrop | Close preview |
| Red dot | Close preview |

## Browser Compatibility

### Supported
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Requirements
- CSS `backdrop-filter` support
- `filter: blur()` support
- React 18+
- Framer Motion 10+

## Limitations

### X-Frame-Options
Many websites block iframe embedding for security. When this happens:
- Fallback message is shown
- "Open in New Tab" button provided
- No error thrown to console

Example sites that block iframes:
- Google
- Facebook
- Twitter (X)
- Instagram
- Many banking sites

### YouTube-Specific
- Videos auto-play muted
- Full player controls available
- Modest branding mode enabled
- Works for all public YouTube videos

## Future Enhancements

- [ ] Preview for Twitter/X embeds
- [ ] Preview for article cards (reader mode)
- [ ] Adjustable preview size
- [ ] Pin preview in place
- [ ] Preview history
- [ ] Keyboard navigation between previews
- [ ] Touch/mobile support (long-press)
- [ ] Multiple previews simultaneously
- [ ] Preview caching
- [ ] Custom preview delay setting

## Troubleshooting

### Preview Not Appearing

**Cause:** No `#preview-root` div in HTML  
**Solution:** Check that `index.html` has:
```html
<div id="preview-root"></div>
```

### Preview Positioning Wrong

**Cause:** Card ref not yet mounted  
**Solution:** Preview automatically calculates position on hover

### YouTube Not Auto-playing

**Cause:** Browser autoplay policy  
**Solution:** Video is muted by default (`mute=1`) which allows autoplay

### Website Shows "Preview Not Available"

**Cause:** Site has X-Frame-Options header  
**Solution:** This is expected behavior - use "Open in New Tab" button

### Preview Appears Too Quickly

**Cause:** Timeout value too low  
**Solution:** Adjust timeout in `handleMouseEnter`:
```typescript
hoverTimeoutRef.current = setTimeout(() => {
  setShowPreview(true);
}, 2000); // Change to 2 seconds
```

## Technical Stack

| Technology | Purpose |
|------------|---------|
| React | Component framework |
| React Portal | Render preview outside DOM hierarchy |
| Framer Motion | Blur animations and transitions |
| Tailwind CSS | Styling |
| TypeScript | Type safety |

## File Structure

```
src/
├── components/
│   ├── LivePreviewPortal.tsx    # Preview window component
│   └── SmartLinkCard.tsx         # Card with hover logic
└── index.html                     # Has #preview-root div
```

## Z-Index Hierarchy

| Layer | Z-Index | Element |
|-------|---------|---------|
| Dialog/Modal | 50 | Slide-over panel |
| Backdrop | 60 | Preview backdrop |
| Preview | 70 | Preview window |

## Example Use Cases

1. **Quick YouTube Preview** - Hover over video to see if it's worth watching
2. **Website Peek** - Check if link goes to expected page
3. **Content Verification** - Confirm link still works
4. **Fast Navigation** - Preview before deciding to open

---

**Created:** 2026-01-10  
**Version:** 1.0.0  
**Component:** LivePreviewPortal + SmartLinkCard
