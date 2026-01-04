import { Redirect, Slot } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function ProtectedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}
