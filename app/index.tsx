import { Redirect } from "expo-router";

export default function Index() {
  const isSignedIn = true; // পরে আপনার Auth Logged-in State থাকলে সেটা দিয়ে চেক করবেন

  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}

