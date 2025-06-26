// CRUD operations for Products and Collections
import { id, lookup } from '@instantdb/react-native';
import { db, getCurrentTimestamp, Product, Collection } from './instant';

// ============================================================================
// PRODUCTS CRUD OPERATIONS
// ============================================================================

export interface CreateProductData {
  title: string;
  image?: string;
  medias?: any;
  excerpt?: string;
  notes?: string;
  type?: string;
  category?: string;
  unit?: string;
  price?: number;
  saleprice?: number;
  vendor?: string;
  brand?: string;
  options?: any;
  modifiers?: any;
  metafields?: any;
  saleinfo?: any;
  stores?: any;
  pos?: boolean;
  website?: boolean;
  seo?: any;
  tags?: string;
  cost?: number;
  qrcode?: string;
  stock?: number;
  publishAt?: number | string;
  publish?: boolean;
  promoinfo?: any;
  featured?: boolean;
  relproducts?: any;
  sellproducts?: any;
}

// Option Set interfaces
export interface OptionSet {
  id: string;
  set: string; // Option set name (e.g., "Size", "Color")
  storeId: string;
}

export interface Option {
  id: string;
  set: string; // Option set name
  identifier: string; // Square identifier (image/color/label)
  value: string; // Option name (e.g., "Small", "Red")
  order: number; // Order in the list
  storeId: string;
}

export interface CreateOptionSetData {
  set: string;
  storeId: string;
}

export interface CreateOptionData {
  set: string;
  identifier: string;
  value: string;
  order: number;
  storeId: string;
}

export interface IdentifierData {
  type: 'image' | 'color' | 'label';
  value: string; // URL for image, hex code for color, text for label
}

export interface UpdateProductData {
  title?: string;
  image?: string;
  medias?: any;
  excerpt?: string;
  notes?: string;
  type?: string;
  category?: string;
  unit?: string;
  price?: number;
  saleprice?: number;
  vendor?: string;
  brand?: string;
  options?: any;
  modifiers?: any;
  metafields?: any;
  saleinfo?: any;
  stores?: any;
  pos?: boolean;
  website?: boolean;
  seo?: any;
  tags?: string;
  cost?: number;
  qrcode?: string;
  stock?: number;
  publishAt?: number | string;
  publish?: boolean;
  promoinfo?: any;
  featured?: boolean;
  relproducts?: any;
  sellproducts?: any;
}

// Create a new product
export const createProduct = async (data: CreateProductData) => {
  try {
    const productId = id();
    const timestamp = getCurrentTimestamp();

    const productData: any = {
      title: data.title,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Add optional fields if provided
    if (data.image !== undefined) productData.image = data.image;
    if (data.medias !== undefined) productData.medias = data.medias;
    if (data.excerpt !== undefined) productData.excerpt = data.excerpt;
    if (data.notes !== undefined) productData.notes = data.notes;
    if (data.type !== undefined) productData.type = data.type;
    if (data.category !== undefined) productData.category = data.category;
    if (data.unit !== undefined) productData.unit = data.unit;
    if (data.price !== undefined) productData.price = data.price;
    if (data.saleprice !== undefined) productData.saleprice = data.saleprice;
    if (data.vendor !== undefined) productData.vendor = data.vendor;
    if (data.brand !== undefined) productData.brand = data.brand;
    if (data.options !== undefined) productData.options = data.options;
    if (data.modifiers !== undefined) productData.modifiers = data.modifiers;
    if (data.metafields !== undefined) productData.metafields = data.metafields;
    if (data.saleinfo !== undefined) productData.saleinfo = data.saleinfo;
    if (data.stores !== undefined) productData.stores = data.stores;
    if (data.pos !== undefined) productData.pos = data.pos;
    if (data.website !== undefined) productData.website = data.website;
    if (data.seo !== undefined) productData.seo = data.seo;
    if (data.tags !== undefined) productData.tags = data.tags;
    if (data.cost !== undefined) productData.cost = data.cost;
    if (data.qrcode !== undefined) productData.qrcode = data.qrcode;
    if (data.stock !== undefined) productData.stock = data.stock;
    if (data.publishAt !== undefined) productData.publishAt = data.publishAt;
    if (data.publish !== undefined) productData.publish = data.publish;
    if (data.promoinfo !== undefined) productData.promoinfo = data.promoinfo;
    if (data.featured !== undefined) productData.featured = data.featured;
    if (data.relproducts !== undefined) productData.relproducts = data.relproducts;
    if (data.sellproducts !== undefined) productData.sellproducts = data.sellproducts;

    await db.transact([db.tx.products[productId].update(productData)]);
    return { success: true, id: productId };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update an existing product
export const updateProduct = async (productId: string, data: UpdateProductData) => {
  try {
    const timestamp = getCurrentTimestamp();

    // Update product data
    const updateData: any = {
      updatedAt: timestamp,
    };

    // Add all possible fields if provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.medias !== undefined) updateData.medias = data.medias;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.saleprice !== undefined) updateData.saleprice = data.saleprice;
    if (data.vendor !== undefined) updateData.vendor = data.vendor;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.options !== undefined) updateData.options = data.options;
    if (data.modifiers !== undefined) updateData.modifiers = data.modifiers;
    if (data.metafields !== undefined) updateData.metafields = data.metafields;
    if (data.saleinfo !== undefined) updateData.saleinfo = data.saleinfo;
    if (data.stores !== undefined) updateData.stores = data.stores;
    if (data.pos !== undefined) updateData.pos = data.pos;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.seo !== undefined) updateData.seo = data.seo;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.qrcode !== undefined) updateData.qrcode = data.qrcode;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.publishAt !== undefined) updateData.publishAt = data.publishAt;
    if (data.publish !== undefined) updateData.publish = data.publish;
    if (data.promoinfo !== undefined) updateData.promoinfo = data.promoinfo;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.relproducts !== undefined) updateData.relproducts = data.relproducts;
    if (data.sellproducts !== undefined) updateData.sellproducts = data.sellproducts;

    await db.transact([db.tx.products[productId].update(updateData)]);
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete a product
export const deleteProduct = async (productId: string) => {
  try {
    await db.transact(db.tx.products[productId].delete());
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get product by title
export const getProductByTitle = async (title: string) => {
  try {
    const { data } = await db.queryOnce({
      products: {
        $: { where: { title } }
      }
    });
    return { success: true, product: data.products[0] || null };
  } catch (error) {
    console.error('Error getting product by title:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ============================================================================
// COLLECTIONS CRUD OPERATIONS
// ============================================================================

export interface CreateCollectionData {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Create a new collection
export const createCollection = async (data: CreateCollectionData) => {
  try {
    const collectionId = id();
    const timestamp = getCurrentTimestamp();
    
    await db.transact(
      db.tx.collections[collectionId].update({
        name: data.name,
        description: data.description || '',
        isActive: true,
        sortOrder: data.sortOrder || 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    );

    return { success: true, id: collectionId };
  } catch (error) {
    console.error('Error creating collection:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update an existing collection
export const updateCollection = async (collectionId: string, data: UpdateCollectionData) => {
  try {
    const timestamp = getCurrentTimestamp();
    const updateData: any = {
      updatedAt: timestamp,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    await db.transact(db.tx.collections[collectionId].update(updateData));
    return { success: true };
  } catch (error) {
    console.error('Error updating collection:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete a collection
export const deleteCollection = async (collectionId: string) => {
  try {
    await db.transact(db.tx.collections[collectionId].delete());
    return { success: true };
  } catch (error) {
    console.error('Error deleting collection:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get collection by name
export const getCollectionByName = async (name: string) => {
  try {
    const { data } = await db.queryOnce({
      collections: {
        $: { where: { name } },
        products: {}
      }
    });
    return { success: true, collection: data.collections[0] || null };
  } catch (error) {
    console.error('Error getting collection by name:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Bulk operations
export const bulkDeleteProducts = async (productIds: string[]) => {
  try {
    const transactions = productIds.map(id => db.tx.products[id].delete());
    await db.transact(transactions);
    return { success: true };
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const bulkUpdateProductsCollection = async (productIds: string[], collectionId: string | null) => {
  try {
    const transactions = productIds.map(id => {
      if (collectionId) {
        return db.tx.products[id].link({ collection: collectionId });
      } else {
        return db.tx.products[id].unlink({ collection: '*' });
      }
    });
    await db.transact(transactions);
    return { success: true };
  } catch (error) {
    console.error('Error bulk updating products collection:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ============================================================================
// OPTION SETS CRUD OPERATIONS
// ============================================================================

// Create a new option set
export const createOptionSet = async (data: CreateOptionSetData) => {
  try {
    const optionSetId = id();

    // Create a marker entry for the option set
    await db.transact([
      db.tx.options[optionSetId].update({
        set: data.set,
        identifier: 'SET_MARKER', // Special marker to identify this as an option set
        value: data.set,
        order: 0,
        storeId: data.storeId,
      })
    ]);

    return { success: true, id: optionSetId };
  } catch (error) {
    console.error('Error creating option set:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Create a new option within an option set
export const createOption = async (data: CreateOptionData) => {
  try {
    const optionId = id();

    await db.transact([
      db.tx.options[optionId].update({
        set: data.set,
        identifier: data.identifier,
        value: data.value,
        order: data.order,
        storeId: data.storeId,
      })
    ]);

    return { success: true, id: optionId };
  } catch (error) {
    console.error('Error creating option:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update an option set
export const updateOptionSet = async (optionSetId: string, data: Partial<CreateOptionSetData>) => {
  try {
    const updateData: any = {};

    if (data.set !== undefined) {
      updateData.set = data.set;
      updateData.value = data.set;
    }

    await db.transact([db.tx.options[optionSetId].update(updateData)]);
    return { success: true };
  } catch (error) {
    console.error('Error updating option set:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update an option
export const updateOption = async (optionId: string, data: Partial<CreateOptionData>) => {
  try {
    const updateData: any = {};

    if (data.value !== undefined) updateData.value = data.value;
    if (data.identifier !== undefined) updateData.identifier = data.identifier;
    if (data.order !== undefined) updateData.order = data.order;

    await db.transact([db.tx.options[optionId].update(updateData)]);
    return { success: true };
  } catch (error) {
    console.error('Error updating option:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete an option set and all its options
export const deleteOptionSet = async (optionSetId: string, setName: string) => {
  try {
    // First get all options in this set
    const { data } = await db.queryOnce({
      options: {
        $: { where: { set: setName } }
      }
    });

    // Delete all options in the set
    const transactions = data.options.map(option => db.tx.options[option.id].delete());

    await db.transact(transactions);
    return { success: true };
  } catch (error) {
    console.error('Error deleting option set:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete a single option
export const deleteOption = async (optionId: string) => {
  try {
    await db.transact([db.tx.options[optionId].delete()]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting option:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get all option sets for a store
export const getOptionSets = async (storeId: string) => {
  try {
    const { data } = await db.queryOnce({
      options: {}
    });

    // Filter for option sets (those with SET_MARKER identifier) and matching store
    const optionSets = data.options.filter(option =>
      option.identifier === 'SET_MARKER' && option.storeId === storeId
    );

    return { success: true, optionSets };
  } catch (error) {
    console.error('Error getting option sets:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get all options for a specific option set
export const getOptionsForSet = async (setName: string) => {
  try {
    const { data } = await db.queryOnce({
      options: {}
    });

    // Filter for options in this set (excluding the set marker) and sort by order
    const options = data.options
      .filter(option => option.set === setName && option.identifier !== 'SET_MARKER')
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return { success: true, options };
  } catch (error) {
    console.error('Error getting options for set:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
