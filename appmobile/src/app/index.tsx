import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Colors } from '@/shared/constants/colors';

export default function Index(): React.JSX.Element {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }}
      >
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  // Always go to Home — guest mode is handled inside the tabs
  return <Redirect href="/home" />;
}
