import "../global.css";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "../components/ui/error-boundary";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Slot />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
