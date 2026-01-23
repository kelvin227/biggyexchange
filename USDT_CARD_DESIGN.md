# USDT Card Design - Multi-Network Support

## Overview
Created a comprehensive USDT wallet card with multi-network deposit and transfer functionality. The card is now a dedicated, visually distinct component with network selection capabilities.

## Design Features

### 1. **Visual Design**
- **Color Scheme**: Green/Emerald gradient theme (differentiates from BNB's yellow theme)
- **Card Style**: `backdrop-blur-lg bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700`
- **Typography**: USDT title uses green gradient text (`text-green-400`)
- **Buttons**: Green gradient buttons (`from-green-500 via-emerald-500 to-teal-600`)

### 2. **Network Selection UI**
The card displays a network selector in two places:

#### a) **Main Card View** (Quick Network Selector)
- Shows pill-shaped buttons for each network
- Clicked network is highlighted with green background
- Networks available:
  - BSC (BEP20)
  - Ethereum (ERC20)
  - Tron (TRC20)
  - Polygon (MATIC)

#### b) **Deposit/Transfer Views** (Dropdown Selector)
- Full dropdown with chain IDs for technical users
- Easy selection between networks
- Shows current network selection

### 3. **Key Features**

#### Responsive Network Information
- Displays selected network name prominently
- Shows corresponding chain ID in dropdown
- Network-specific warning messages update dynamically

#### Balance Display
- Total balance in USDT tokens
- USD equivalent price
- Visual distinction with dark background panels

#### Deposit Flow
1. Click Deposit button
2. Select or confirm network
3. Copy wallet address for selected network
4. See network-specific warning
5. Cancel or navigate back

#### Transfer Flow
1. Click Transfer button
2. Select network
3. Enter recipient address (with paste option)
4. Enter transfer amount (with USDT label)
5. Execute transfer
6. See network-specific warning

### 4. **User Experience Enhancements**

#### Network Warnings
- Yellow-highlighted warning box
- ⚠️ Icon for visual emphasis
- Network-specific messages (e.g., "Binance Smart Chain (BEP20) Network")
- Prevents fund loss from wrong network transfers

#### Interactive Elements
- Network pills are clickable for quick selection
- Dropdown allows detailed network selection
- Copy/Paste buttons for addresses
- All buttons have hover effects and scale transitions

#### Visual Feedback
- Hover scale effects on buttons
- Color-coded buttons (green = USDT, gray = cancel)
- Loading states during transfers
- Toast notifications for user actions

### 5. **Supported Networks**

```typescript
const usdtNetworks = {
  bsc: {
    name: "BSC (BEP20)",
    chainId: "56",
  },
  ethereum: {
    name: "Ethereum (ERC20)",
    chainId: "1",
  },
  tron: {
    name: "Tron (TRC20)",
    chainId: "tron",
  },
  polygon: {
    name: "Polygon (MATIC)",
    chainId: "137",
  },
}
```

### 6. **Mobile Responsive**
- Full-width buttons on mobile
- Responsive network selector layout
- Readable text on all screen sizes
- Touch-friendly button sizes

## State Management

### New States Added
```typescript
const [usdtShow, setUsdtShow] = useState(false);        // Toggle deposit view
const [usdtTransfer, setUsdtTransfer] = useState(false); // Toggle transfer view
const [selectedUsdtNetwork, setSelectedUsdtNetwork] = useState("bsc"); // Current network
```

## Translations
Added to both English and Chinese translations:
- `selectNetwork`: "Select Network" / "選擇網絡"
- `ethereum`: "Ethereum (ERC20)" / "以太坊 (ERC20)"
- `tron`: "Tron (TRC20)" / "波場 (TRC20)"
- `polygon`: "Polygon (MATIC)" / "Polygon (MATIC)"

## Implementation Notes

1. **Backward Compatibility**: The old TON card is preserved below the new USDT card
2. **Consistent API**: Uses existing `handleTransfer()` function for USDT transfers
3. **Theme Consistency**: Follows existing design patterns but with distinct green color
4. **Accessible**: Warning messages and network info clearly displayed
5. **Expandable**: Easy to add more networks by updating the `usdtNetworks` object

## Future Enhancements
- Add USDT balance tracking per network (if needed)
- Integrate real-time network gas fees
- Add historical network performance metrics
- QR code generation for deposit addresses
- Network status indicators (mainnet/testnet)
