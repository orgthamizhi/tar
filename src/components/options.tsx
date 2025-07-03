import React, { useState } from 'react';
import { View } from 'react-native';
import OptionsScreen from '../screens/options';
import SetScreen from '../screens/set';

type OptionsScreenType = 'list' | 'set';

interface OptionsState {
  screen: OptionsScreenType;
  selectedSetId?: string;
  selectedSetName?: string;
}

interface OptionsProps {
  onClose?: () => void;
}

export default function Options({ onClose }: OptionsProps) {
  const [state, setState] = useState<OptionsState>({
    screen: 'list',
  });

  const navigateToSet = (setId: string, setName: string) => {
    setState({
      screen: 'set',
      selectedSetId: setId,
      selectedSetName: setName,
    });
  };

  const navigateToList = () => {
    setState({ screen: 'list' });
  };

  const handleSetSave = () => {
    // Navigate back to list and refresh
    navigateToList();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {state.screen === 'list' && (
        <OptionsScreen
          onNavigateToSet={navigateToSet}
          onClose={handleClose}
        />
      )}

      {state.screen === 'set' && state.selectedSetId && state.selectedSetName && (
        <SetScreen
          setId={state.selectedSetId}
          setName={state.selectedSetName}
          onClose={navigateToList}
          onSave={handleSetSave}
        />
      )}
    </View>
  );
}
