import React, { useState } from 'react';
import { View } from 'react-native';
import OptionsList from './options-list';
import OptionSetSelect from './option-set-select';
import OptionSetCreate from './option-set-create';
import OptionSetEdit from './option-set-edit';

type OptionsScreen = 'list' | 'select' | 'create' | 'edit';

interface OptionsState {
  screen: OptionsScreen;
  selectedOptionSetId?: string;
  selectedOptionSetName?: string;
  selectedOptions?: string[];
}

interface OptionsProps {
  onClose?: () => void;
  onOptionsSelected?: (optionSetId: string, selectedOptions: string[]) => void;
  initialSelectedOptions?: string[];
  mode?: 'standalone' | 'selection'; // standalone for full management, selection for product form
}

export default function Options({ 
  onClose, 
  onOptionsSelected, 
  initialSelectedOptions = [],
  mode = 'standalone' 
}: OptionsProps) {
  const [state, setState] = useState<OptionsState>({
    screen: 'list',
    selectedOptions: initialSelectedOptions,
  });

  const navigateToCreate = () => {
    setState(prev => ({ ...prev, screen: 'create' }));
  };

  const navigateToSelect = (optionSetId: string, optionSetName?: string) => {
    if (mode === 'standalone') {
      // In standalone mode, clicking an option set opens edit
      setState(prev => ({
        ...prev,
        screen: 'edit',
        selectedOptionSetId: optionSetId,
        selectedOptionSetName: optionSetName || 'Option Set',
      }));
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
        <OptionSetCreate
          onClose={handleClose}
          onSuccess={handleCreateSuccess}
        />
      )}

      {state.screen === 'edit' && state.selectedOptionSetId && state.selectedOptionSetName && (
        <OptionSetEdit
          optionSetId={state.selectedOptionSetId}
          optionSetName={state.selectedOptionSetName}
          onClose={handleClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </View>
  );
}
