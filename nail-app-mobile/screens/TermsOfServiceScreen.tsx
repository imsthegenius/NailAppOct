import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLORS } from '../src/theme/colors';

type TermsOfServiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TermsOfService'>;

type Props = {
  navigation: TermsOfServiceScreenNavigationProp;
};

export default function TermsOfServiceScreen({ navigation }: Props) {
  const openExternalLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Effective Date: January 2025</Text>

        <Text style={styles.paragraph}>
          Welcome to NailGlow! These Terms of Service ("Terms") govern your use of the NailGlow mobile application ("App") provided by NailGlow ("we", "our", or "us"). By using our App, you agree to these Terms.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using NailGlow, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our App.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 13 years old to use this App. If you are under 18, you must have parental consent. By using the App, you represent that you meet these requirements.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Registration</Text>
        <Text style={styles.paragraph}>
          To use certain features, you must create an account. You agree to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide accurate and complete information</Text>
        <Text style={styles.bulletPoint}>• Maintain the security of your password</Text>
        <Text style={styles.bulletPoint}>• Notify us of any unauthorized use</Text>
        <Text style={styles.bulletPoint}>• Be responsible for all activities under your account</Text>

        <Text style={styles.sectionTitle}>4. Permitted Use</Text>
        <Text style={styles.paragraph}>
          You may use NailGlow for personal, non-commercial purposes to:
        </Text>
        <Text style={styles.bulletPoint}>• Visualize nail polish colors and shapes</Text>
        <Text style={styles.bulletPoint}>• Save and organize your nail designs</Text>
        <Text style={styles.bulletPoint}>• Share designs with nail technicians</Text>

        <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
        <Text style={styles.paragraph}>
          You agree NOT to:
        </Text>
        <Text style={styles.bulletPoint}>• Use the App for illegal purposes</Text>
        <Text style={styles.bulletPoint}>• Upload inappropriate or offensive content</Text>
        <Text style={styles.bulletPoint}>• Attempt to reverse engineer the App</Text>
        <Text style={styles.bulletPoint}>• Scrape or copy content without permission</Text>
        <Text style={styles.bulletPoint}>• Impersonate others or provide false information</Text>
        <Text style={styles.bulletPoint}>• Interfere with the App's operation</Text>

        <Text style={styles.sectionTitle}>6. Content and Intellectual Property</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Your Content:</Text> You retain ownership of photos you upload. By uploading, you grant us a license to process and display your images for providing our services.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Our Content:</Text> The App, including its design, features, and content (excluding user content), is owned by NailGlow and protected by intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>7. AI Services and Limitations</Text>
        <Text style={styles.paragraph}>
          Our AI-powered visualization is for entertainment and planning purposes only. Results may vary from actual nail polish application. We do not guarantee accuracy or suitability for any specific purpose.
        </Text>

        <Text style={styles.sectionTitle}>8. Privacy and Data</Text>
        <Text style={styles.paragraph}>
          Your use of NailGlow is also governed by our Privacy Policy. We respect your privacy and handle your data in accordance with applicable laws.
        </Text>

        <Text style={styles.sectionTitle}>9. Disclaimers</Text>
        <Text style={styles.paragraph}>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </Text>

        <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, NAILGLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP.
        </Text>

        <Text style={styles.sectionTitle}>11. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify and hold NailGlow harmless from any claims, damages, or expenses arising from your violation of these Terms or misuse of the App.
        </Text>

        <Text style={styles.sectionTitle}>12. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account at any time for violations of these Terms. You may delete your account at any time through the App settings.
        </Text>

        <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the new Terms.
        </Text>

        <Text style={styles.sectionTitle}>14. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of the United States and the State of California, without regard to conflict of law principles.
        </Text>

        <Text style={styles.sectionTitle}>15. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, please contact us at:
        </Text>
        <TouchableOpacity onPress={() => openExternalLink('mailto:legal@nailglow.app')}>
          <Text style={styles.link}>legal@nailglow.app</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 25,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginLeft: 10,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    color: BRAND_COLORS.accent,
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  bottomSpacing: {
    height: 40,
  },
});
