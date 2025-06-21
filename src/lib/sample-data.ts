// Sample data creation for testing the product list functionality
import { createProduct, createCollection } from './crud';

export const sampleProducts = [
  {
    title: 'iPhone 15 Pro',
    excerpt: 'Latest iPhone with advanced camera system',
    price: 999.99,
    category: 'Electronics',
    brand: 'Apple',
    vendor: 'Apple Inc.',
    stock: 25,
    pos: true,
    website: true,
    publish: true,
    featured: true,
    tags: 'smartphone, apple, premium'
  },
  {
    title: 'Samsung Galaxy S24',
    excerpt: 'Premium Android smartphone with AI features',
    price: 899.99,
    category: 'Electronics',
    brand: 'Samsung',
    vendor: 'Samsung Electronics',
    stock: 18,
    pos: true,
    website: true,
    publish: true,
    tags: 'smartphone, android, samsung'
  },
  {
    title: 'MacBook Air M3',
    excerpt: '13-inch laptop with M3 chip',
    price: 1299.99,
    category: 'Computers',
    brand: 'Apple',
    vendor: 'Apple Inc.',
    stock: 12,
    pos: true,
    website: true,
    publish: true,
    featured: true,
    tags: 'laptop, apple, m3'
  },
  {
    title: 'AirPods Pro 2',
    excerpt: 'Wireless earbuds with active noise cancellation',
    price: 249.99,
    category: 'Audio',
    brand: 'Apple',
    vendor: 'Apple Inc.',
    stock: 45,
    pos: true,
    website: true,
    publish: true,
    tags: 'earbuds, wireless, apple'
  },
  {
    title: 'iPad Pro 12.9"',
    excerpt: 'Professional tablet with M2 chip',
    price: 1099.99,
    category: 'Tablets',
    brand: 'Apple',
    vendor: 'Apple Inc.',
    stock: 8,
    pos: true,
    website: true,
    publish: true,
    featured: true,
    tags: 'tablet, apple, professional'
  },
  {
    title: 'Apple Watch Series 9',
    excerpt: 'Advanced smartwatch with health monitoring',
    price: 399.99,
    category: 'Wearables',
    brand: 'Apple',
    vendor: 'Apple Inc.',
    stock: 22,
    pos: true,
    website: true,
    publish: true,
    tags: 'smartwatch, apple, health'
  },
  {
    title: 'Sony WH-1000XM5',
    excerpt: 'Premium noise-canceling headphones',
    price: 349.99,
    category: 'Audio',
    brand: 'Sony',
    vendor: 'Sony Corporation',
    stock: 15,
    pos: true,
    website: true,
    publish: true,
    tags: 'headphones, sony, noise-canceling'
  },
  {
    title: 'Nintendo Switch OLED',
    excerpt: 'Gaming console with OLED display',
    price: 349.99,
    category: 'Gaming',
    brand: 'Nintendo',
    vendor: 'Nintendo Co., Ltd.',
    stock: 30,
    pos: true,
    website: true,
    publish: true,
    featured: true,
    tags: 'gaming, nintendo, console'
  }
];

export const sampleCollections = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    sortOrder: 1
  },
  {
    name: 'Audio',
    description: 'Headphones, speakers, and audio equipment',
    sortOrder: 2
  },
  {
    name: 'Gaming',
    description: 'Gaming consoles and accessories',
    sortOrder: 3
  }
];

export const createSampleData = async () => {
  console.log('Creating sample data...');
  
  try {
    // Create collections first
    const collectionResults = [];
    for (const collection of sampleCollections) {
      const result = await createCollection(collection);
      if (result.success) {
        collectionResults.push({ ...collection, id: result.id });
        console.log(`✅ Created collection: ${collection.name}`);
      } else {
        console.error(`❌ Failed to create collection ${collection.name}:`, result.error);
      }
    }

    // Create products
    for (const product of sampleProducts) {
      const result = await createProduct(product);
      if (result.success) {
        console.log(`✅ Created product: ${product.title}`);
      } else {
        console.error(`❌ Failed to create product ${product.title}:`, result.error);
      }
    }

    console.log('✅ Sample data creation completed!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return { success: false, error };
  }
};
