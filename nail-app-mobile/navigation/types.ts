import type { NavigatorScreenParams } from '@react-navigation/native';

export type PendingPhotoPayload = {
  imageUri: string;
  base64?: string;
};

export type CompareLookParam = {
  id: string;
  originalImage: string;
  transformedImage: string;
  colorName: string;
  colorHex: string;
  shapeName: string;
  createdAt: string;
};

export type MainStackParamList = {
  Camera: undefined;
  Design: { fromCamera?: boolean; photoData?: PendingPhotoPayload } | undefined;
  Feed: undefined;
  Processing: { imageUri: string; base64?: string };
  Results: {
    imageUri: string;
    originalImageUri?: string;
    transformedBase64?: string | null;
    originalBase64?: string | null;
  };
  Profile: undefined;
  CompareScreen: { look1: CompareLookParam; look2: CompareLookParam };
  Upgrade: undefined;
  DeleteAccount: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  ConnectionTest: undefined;
  Onboarding: undefined;
  AuthLanding: undefined;
  Main: NavigatorScreenParams<MainStackParamList> | undefined;
  Login: undefined;
  Signup: undefined;
  EmailVerification: { email: string } | undefined;
  LegalAcceptance: { status?: import('../lib/onboardingFlow').LegalAcceptanceStatus | null } | undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DeleteAccount: undefined;
  Home: undefined;
  MyLooks: undefined;
};
