import { createOptionSet, createOption } from './lib/crud';

export const testCreateOptionSet = async () => {
  console.log('🧪 Testing option set creation...');
  
  try {
    // Create a test option set
    const optionSetResult = await createOptionSet({
      set: 'Size',
      storeId: 'test-store-id',
    });

    console.log('✅ Option set created:', optionSetResult);

    if (optionSetResult.success && optionSetResult.id) {
      // Create some test options
      const options = ['Small', 'Medium', 'Large'];
      
      for (let i = 0; i < options.length; i++) {
        const optionResult = await createOption({
          set: 'Size',
          identifier: '', // Empty for now
          value: options[i],
          order: i + 1,
          storeId: 'test-store-id',
        });
        
        console.log(`✅ Option "${options[i]}" created:`, optionResult);
      }
    }
  } catch (error) {
    console.error('❌ Error testing options:', error);
  }
};
