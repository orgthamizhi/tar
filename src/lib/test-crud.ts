// Test file to verify CRUD operations work correctly
// This file can be used for testing the CRUD operations

import {
  createProduct,
  createCollection,
  updateProduct,
  updateCollection,
  deleteProduct,
  deleteCollection,
  getProductByTitle,
  getCollectionByName
} from './crud';

// Test data
const testCollection = {
  name: 'Test Electronics',
  description: 'Test collection for electronics',
  sortOrder: 1
};

const testProduct = {
  title: 'Test Smartphone',
  excerpt: 'A test smartphone product',
  price: 599.99,
  category: 'Electronics',
  stock: 50,
  image: 'https://example.com/phone.jpg'
};

// Test functions
export const runCrudTests = async () => {
  console.log('Starting CRUD tests...');
  
  try {
    // Test 1: Create Collection
    console.log('Test 1: Creating collection...');
    const collectionResult = await createCollection(testCollection);
    if (!collectionResult.success) {
      throw new Error(`Failed to create collection: ${collectionResult.error}`);
    }
    console.log('✅ Collection created successfully');
    const collectionId = collectionResult.id!;

    // Test 2: Create Product
    console.log('Test 2: Creating product...');
    const productResult = await createProduct(testProduct);
    if (!productResult.success) {
      throw new Error(`Failed to create product: ${productResult.error}`);
    }
    console.log('✅ Product created successfully');
    const productId = productResult.id!;

    // Test 3: Update Product
    console.log('Test 3: Updating product...');
    const updateResult = await updateProduct(productId, {
      price: 649.99,
      stock: 45
    });
    if (!updateResult.success) {
      throw new Error(`Failed to update product: ${updateResult.error}`);
    }
    console.log('✅ Product updated successfully');

    // Test 4: Get Product by Title
    console.log('Test 4: Getting product by title...');
    const getProductResult = await getProductByTitle(testProduct.title);
    if (!getProductResult.success || !getProductResult.product) {
      throw new Error(`Failed to get product by title: ${getProductResult.error}`);
    }
    console.log('✅ Product retrieved by title successfully');

    // Test 5: Update Collection
    console.log('Test 5: Updating collection...');
    const updateCollectionResult = await updateCollection(collectionId, {
      description: 'Updated test collection description'
    });
    if (!updateCollectionResult.success) {
      throw new Error(`Failed to update collection: ${updateCollectionResult.error}`);
    }
    console.log('✅ Collection updated successfully');

    // Test 6: Get Collection by Name
    console.log('Test 6: Getting collection by name...');
    const getCollectionResult = await getCollectionByName(testCollection.name);
    if (!getCollectionResult.success || !getCollectionResult.collection) {
      throw new Error(`Failed to get collection by name: ${getCollectionResult.error}`);
    }
    console.log('✅ Collection retrieved by name successfully');

    // Test 7: Delete Product
    console.log('Test 7: Deleting product...');
    const deleteProductResult = await deleteProduct(productId);
    if (!deleteProductResult.success) {
      throw new Error(`Failed to delete product: ${deleteProductResult.error}`);
    }
    console.log('✅ Product deleted successfully');

    // Test 8: Delete Collection
    console.log('Test 8: Deleting collection...');
    const deleteCollectionResult = await deleteCollection(collectionId);
    if (!deleteCollectionResult.success) {
      throw new Error(`Failed to delete collection: ${deleteCollectionResult.error}`);
    }
    console.log('✅ Collection deleted successfully');

    console.log('🎉 All CRUD tests passed successfully!');
    return { success: true, message: 'All tests passed' };

  } catch (error) {
    console.error('❌ CRUD test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Helper function to run tests in development
export const testCrudOperations = () => {
  if (__DEV__) {
    runCrudTests().then(result => {
      if (result.success) {
        console.log('CRUD tests completed successfully');
      } else {
        console.error('CRUD tests failed:', result.error);
      }
    });
  }
};
