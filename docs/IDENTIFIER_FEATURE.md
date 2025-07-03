# Option Identifier Feature - Label Tiles System

This document describes the implementation of the identifier feature for option values, where users can assign visual labels (color, image, or text) to option values that replace the draggable icon position.

## 🎯 Overview

The identifier feature allows users to create visual labels for option values using three types:
- **Text**: Short 2-character text labels (e.g., "XS", "LG", "BL")
- **Color**: Hex color codes for color-based options (e.g., "#FF5733" for red)
- **Image**: URLs for image-based labels (e.g., pattern swatches, material textures)

## 🎨 Visual Design

### Identifier Tile
The identifier tile is a 32x32px square that replaces the drag handle position:

```typescript
// Tile structure
<TouchableOpacity style={{
  width: 32,
  height: 32,
  borderRadius: 6,
  marginRight: 12,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: identifierType === 'color' ? identifierValue : '#F8F9FA',
  borderWidth: 1,
  borderColor: '#E8E8E8',
}}>
  {/* Content based on type */}
</TouchableOpacity>
```

### Drag Indicator Overlay
A small 12x12px circle with mini 4-dot pattern in the bottom-right corner:
- White background with subtle border
- 4 tiny dots (1.5x1.5px) in 2x2 grid
- Indicates the item is still draggable

### Type-Specific Rendering

#### Text Type
- 2-character uppercase text
- 12px font size, bold weight
- Centered in tile
- Falls back to first 2 characters of value if no custom text

#### Color Type
- 24x24px inner color square
- Rounded corners (4px radius)
- Subtle inner border for light colors
- Tile background matches the color

#### Image Type
- 28x28px image with 4px border radius
- Cover resize mode for proper aspect ratio
- Fallback to text type if image fails to load

## 🛠 Technical Implementation

### Data Structure
```typescript
interface OptionValue {
  id: string;
  value: string;
  identifier: string;
  order: number;
  identifierType?: 'color' | 'image' | 'text';
  identifierValue?: string; // hex color, image URL, or short text
}
```

### Component Architecture

#### IdentifierTile Component
```typescript
const IdentifierTile = ({ item, onPress }) => {
  // Renders appropriate content based on identifierType
  // Includes drag indicator overlay
  // Handles tap to edit
};
```

#### Identifier Editor Modal
- Full-screen modal with segmented type selector
- Type-specific input fields
- Real-time preview for colors
- Save/cancel actions with haptic feedback

### State Management
```typescript
const [editingIdentifier, setEditingIdentifier] = useState<OptionValue | null>(null);
const [identifierType, setIdentifierType] = useState<'color' | 'image' | 'text'>('text');
const [identifierValue, setIdentifierValue] = useState('');
```

## 🎯 User Experience Flow

### Creating Identifiers
1. **Tap identifier tile** on any option value
2. **Select type** using segmented control (Text/Color/Image)
3. **Enter value** based on selected type:
   - Text: 2-character input with auto-uppercase
   - Color: Quick color picker + custom hex input
   - Image: URL input field
4. **Preview** shows real-time changes
5. **Save** with haptic feedback

### Default Behavior
- New values get text identifier with first 2 characters
- Existing values without identifiers get auto-generated text labels
- All identifiers are editable at any time

### Drag Interaction
- Long-press anywhere on the row to start dragging
- Identifier tile shows mini drag indicator
- Smooth drag experience maintained

## 🎨 Design Specifications

### Colors
- **Tile Background**: #F8F9FA (for text/image types)
- **Border**: #E8E8E8 (1px solid)
- **Text Color**: #1C1C1E
- **Drag Indicator**: #C7C7CC dots on white background

### Spacing
- **Tile Size**: 32x32px
- **Border Radius**: 6px
- **Margin Right**: 12px
- **Drag Indicator**: 12x12px, positioned bottom-right with -2px offset

### Typography
- **Identifier Text**: 12px, weight 600, uppercase
- **Modal Headers**: 13px, weight 500, uppercase, letter-spacing 0.5

## 🚀 Features

### Quick Color Picker
12 predefined colors in a 2x6 grid:
- Primary colors: Red, Green, Blue
- Secondary colors: Orange, Purple, Cyan
- Variations: Pink, Yellow, Lime, etc.
- Visual selection with blue border highlight

### Smart Defaults
- Text identifiers auto-generate from value name
- Uppercase transformation for consistency
- Fallback handling for missing/invalid data

### Validation
- Text limited to 2 characters maximum
- Color validation for hex format
- Image URL validation (basic format check)

### Accessibility
- Proper touch targets (44pt minimum)
- Clear visual hierarchy
- Haptic feedback for actions
- VoiceOver support for screen readers

## 📱 Use Cases

### Fashion/Apparel
- **Sizes**: "XS", "SM", "MD", "LG", "XL"
- **Colors**: Actual color swatches for variants
- **Materials**: Texture images for fabric types

### Electronics
- **Storage**: "16", "32", "64", "128" (GB)
- **Colors**: Device color options
- **Models**: "PR", "AI", "ST" for Pro/Air/Standard

### Food/Beverage
- **Sizes**: "SM", "MD", "LG"
- **Flavors**: Color coding for different flavors
- **Types**: Images for different product types

## 🔧 Configuration Options

### Customization
- Predefined color palette can be modified
- Image size and aspect ratio configurable
- Text character limit adjustable
- Tile size and spacing customizable

### Performance
- Image caching for better performance
- Lazy loading for image identifiers
- Optimized re-renders during editing

## 🎉 Benefits

### Visual Clarity
- Instant recognition of option types
- Reduced cognitive load for users
- Professional appearance matching industry standards

### Improved UX
- Quick visual scanning of options
- Consistent with e-commerce patterns
- Maintains drag functionality

### Flexibility
- Supports various business types
- Adaptable to different product categories
- Future-proof for additional identifier types

## 🔮 Future Enhancements

### Potential Additions
- **Icon Type**: Predefined icon library
- **Gradient Type**: Gradient color support
- **Pattern Type**: Repeating pattern backgrounds
- **Emoji Type**: Emoji-based identifiers

### Advanced Features
- **Bulk Edit**: Edit multiple identifiers at once
- **Templates**: Save and apply identifier templates
- **Import**: Import identifiers from CSV/JSON
- **AI Suggestions**: Smart identifier recommendations

The identifier feature provides a simple yet powerful way to create visual labels for option values, making the options system more intuitive and professional while maintaining the smooth drag-and-drop functionality.
