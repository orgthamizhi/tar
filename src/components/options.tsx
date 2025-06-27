import React, { useState } from 'react';
import { View } from 'react-native';
import OptionsList from './options-list';
import OptionSetSelect from './option-set-select';
import CreateScreen from '../screens/create';
import OptionSetEditScreen from '../screens/option-set-edit-screen';
import OptionsScreen from '../screens/options';

type OptionsScreenType = 'list' | 'select' | 'create' | 'edit';

interface OptionsState {
  screen: OptionsScreenType;
  selectedOptionSetId?: string;
  selectedOptionSetName?: string;
  selectedOptions?: string[];
}

interface OptionsProps {
  onClose?: () => void;
  onOptionsSelected?: (optionSetId: string, selectedOptions: string[]) => void;
  initialSelectedOptions?: string[];
  mode?: 'standalone' | 'selection'; // standalone for full management, selection for product form
  onNavigateToCreate?: () => void;
  onNavigateToEdit?: (id: string, name: string) => void;
}

export default function Options({
  onClose,
  onOptionsSelected,
  initialSelectedOptions = [],
  mode = 'standalone',
  onNavigateToCreate,
  onNavigateToEdit
}: OptionsProps) {
  const [state, setState] = useState<OptionsState>({
    screen: 'list',
    selectedOptions: initialSelectedOptions,
  });
  const [showShopifyOptions, setShowShopifyOptions] = useState(false);
  const [shopifyOptionSetName, setShopifyOptionSetName] = useState('');

  const navigateToCreate = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    } else {
      setState(prev => ({ ...prev, screen: 'create' }));
    }
  };

  const navigateToSelect = (optionSetId: string, optionSetName?: string) => {
    if (mode === 'standalone') {
      // In standalone mode, clicking an option set opens Shopify-style options
      setShopifyOptionSetName(optionSetName || 'Option Set');
      setShowShopifyOptions(true);
    } else {
      // In selection mode, clicking an option set opens select
      setState(prev => ({
        ...prev,
        screen: 'select',
        selectedOptionSetId: optionSetId,
        selectedOptionSetName: optionSetName || 'Option Set',
      }));
    }
  };

  const navigateToList = () => {
    setState(prev => ({ ...prev, screen: 'list' }));
  };

  const handleCreateSuccess = () => {
    navigateToList();
  };

  const handleEditSuccess = () => {
    navigateToList();
  };

  const handleSelectDone = (selectedOptions: string[]) => {
    if (onOptionsSelected && state.selectedOptionSetId) {
      onOptionsSelected(state.selectedOptionSetId, selectedOptions);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (state.screen === 'list') {
      if (onClose) {
        onClose();
      }
    } else {
      navigateToList();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {state.screen === 'list' && (
        <OptionsList
          onNavigateToCreate={navigateToCreate}
          onNavigateToSelect={(optionSetId, optionSetName) =>
            navigateToSelect(optionSetId, optionSetName)
          }
          onBack={onClose}
        />
      )}

      {state.screen === 'select' && state.selectedOptionSetName && (
        <OptionSetSelect
          optionSetName={state.selectedOptionSetName}
          selectedOptions={state.selectedOptions}
          onDone={handleSelectDone}
          onClose={handleClose}
        />
      )}

      {state.screen === 'create' && (
        <CreateScreen
          navigation={{
            goBack: handleClose
          }}
          route={{}}
        />
      )}

      {state.screen === 'edit' && state.selectedOptionSetId && state.selectedOptionSetName && (
        <OptionSetEditScreen
          navigation={{
            goBack: handleClose
          }}
          route={{
            params: {
              optionSetId: state.selectedOptionSetId,
              optionSetName: state.selectedOptionSetName
            }
          }}
        />
      )}

      {/* Options Screen */}
      <OptionsScreen
        visible={showShopifyOptions}
        optionSetName={shopifyOptionSetName}
        onClose={() => setShowShopifyOptions(false)}
        onSave={() => setShowShopifyOptions(false)}
      />
    </View>
  );
}
