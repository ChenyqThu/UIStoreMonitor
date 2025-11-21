import { Product, ProductHistory } from '../types';

const STORAGE_KEY = 'unifi_monitor_data_v1';

// Initial Seed Data to simulate a fresh install
const SEED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Dream Machine Pro',
    sku: 'UDM-Pro',
    category: 'Network',
    currentPrice: 379.00,
    currency: 'USD',
    inStock: true,
    imageUrl: 'https://picsum.photos/200/200?random=1',
    url: 'https://store.ui.com/us/en/pro/category/all-unifi-cloud-gateways/products/udm-pro',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: '2',
    name: 'G4 Instant Camera',
    sku: 'UVC-G4-INS',
    category: 'Cameras',
    currentPrice: 99.00,
    currency: 'USD',
    inStock: false,
    imageUrl: 'https://picsum.photos/200/200?random=2',
    url: 'https://store.ui.com/us/en/pro/category/cameras-bullet/products/uvc-g4-ins',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: '3',
    name: 'Access Point U6 Pro',
    sku: 'U6-Pro',
    category: 'Network',
    currentPrice: 159.00,
    currency: 'USD',
    inStock: true,
    imageUrl: 'https://picsum.photos/200/200?random=3',
    url: 'https://store.ui.com/us/en/pro/category/wifi-flagship/products/u6-pro',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: '4',
    name: 'Switch Pro 24 PoE',
    sku: 'USW-Pro-24-PoE',
    category: 'Network',
    currentPrice: 699.00,
    currency: 'USD',
    inStock: true,
    imageUrl: 'https://picsum.photos/200/200?random=4',
    url: 'https://store.ui.com/us/en/pro/category/switching-pro-max/products/usw-pro-24-poe',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: '5',
    name: 'G5 Bullet',
    sku: 'UVC-G5-Bullet',
    category: 'Cameras',
    currentPrice: 129.00,
    currency: 'USD',
    inStock: true,
    imageUrl: 'https://picsum.photos/200/200?random=5',
    url: 'https://store.ui.com/us/en/pro/category/cameras-bullet/products/uvc-g5-bullet',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: '6',
    name: 'UniFi Access Hub',
    sku: 'UA-Hub',
    category: 'Access',
    currentPrice: 199.00,
    currency: 'USD',
    inStock: false,
    imageUrl: 'https://picsum.photos/200/200?random=6',
    url: 'https://store.ui.com/us/en/pro/category/access-control-hub/products/ua-hub',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
];

// Helper to generate simulated history
const generateInitialHistory = (basePrice: number, days: number): ProductHistory[] => {
  const history: ProductHistory[] = [];
  const today = new Date();
  
  for (let i = days; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Randomize price slightly (simulating discounts or changes)
    const priceVariance = Math.random() > 0.9 ? (Math.random() * 20 - 10) : 0; 
    const price = parseFloat((basePrice + priceVariance).toFixed(2));
    
    // Randomize stock (90% chance of staying same, 10% flip)
    const inStock = Math.random() > 0.15; 

    history.push({
      date: date.toISOString().split('T')[0],
      price,
      inStock
    });
  }
  return history;
};

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize with seed data if empty
  const seeded = SEED_PRODUCTS.map(p => ({
    ...p,
    history: generateInitialHistory(p.currentPrice, 14) // Generate 2 weeks of data
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const simulateDailyScan = (): Product[] => {
  const products = getProducts();
  const todayStr = new Date().toISOString().split('T')[0];

  const updatedProducts = products.map(product => {
    // 1. Archive current state to history if not already archived for today
    const lastHistory = product.history[product.history.length - 1];
    
    // Only add history if the last entry wasn't "today" (allowing multiple clicks for demo purposes, but logically handled)
    // For demo: we will force add a new day by advancing the date or just adding a new entry simulating "now"
    
    // Simulation Logic: Change price or stock randomly
    const changeEvent = Math.random();
    let newPrice = product.currentPrice;
    let newStock = product.inStock;

    if (changeEvent > 0.95) {
      // 5% chance price changes
      newPrice = newPrice + (Math.random() > 0.5 ? 10 : -10);
    }
    
    if (changeEvent > 0.8) {
      // 20% chance stock flips
      newStock = !newStock;
    }

    // Create a new simulated date (usually we'd use real time, but for demo we might want to see progress)
    // We will just append a new entry for "Today + N" if user spams click, or just use real time.
    // Let's use Real Time for the "Latest" status.
    
    const newHistoryEntry: ProductHistory = {
      date: new Date().toISOString(), // Use full ISO for precision in this demo
      price: product.currentPrice, // History records the PREVIOUS state usually, but let's record snapshot
      inStock: product.inStock
    };

    // Limit history to 30 entries
    const newHistory = [...product.history, newHistoryEntry].slice(-30);

    return {
      ...product,
      currentPrice: parseFloat(newPrice.toFixed(2)),
      inStock: newStock,
      lastUpdated: new Date().toISOString(),
      history: newHistory
    };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  return updatedProducts;
};

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  return getProducts();
};
