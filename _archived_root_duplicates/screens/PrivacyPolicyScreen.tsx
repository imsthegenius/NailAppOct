import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

type Props = {
  navigation: PrivacyPolicyScreenNavigationProp;
};

export default function PrivacyPolicyScreen({ navigation }: Props) {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <Text style={styles.paragraph}>
          NailGlow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect the following types of information:
        </Text>
        <Text style={styles.bulletPoint}>• Email address (for account creation and authentication)</Text>
        <Text style={styles.bulletPoint}>• Photos of your nails (for AI transformation)</Text>
        <Text style={styles.bulletPoint}>• Usage data (app interactions, features used)</Text>
        <Text style={styles.bulletPoint}>• Device information (iOS version, device model)</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide nail visualization services</Text>
        <Text style={styles.bulletPoint}>• Maintain and improve our app</Text>
        <Text style={styles.bulletPoint}>• Send important updates about your account</Text>
        <Text style={styles.bulletPoint}>• Respond to your requests and support needs</Text>

        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is stored securely using industry-standard encryption. Photos are stored in Supabase Storage with user-specific access controls. Authentication tokens are stored in the iOS Keychain for maximum security.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal information to third parties. We may share your data only:
        </Text>
        <Text style={styles.bulletPoint}>• With your explicit consent</Text>
        <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
        <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>• Access your personal data</Text>
        <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
        <Text style={styles.bulletPoint}>• Delete your account and data</Text>
        <Text style={styles.bulletPoint}>• Export your data</Text>
        <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your data as long as your account is active. You can delete your account at any time through the app settings, which will remove all your personal data from our servers within 30 days.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our app is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe we have collected data from a child, please contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date and sending an in-app notification for significant changes.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, please contact us at:
        </Text>
        <TouchableOpacity onPress={() => openExternalLink('mailto:privacy@nailglow.app')}>
          <Text style={styles.link}>privacy@nailglow.app</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>10. Legal Basis for Processing</Text>
        <Text style={styles.paragraph}>
          We process your data based on:
        </Text>
        <Text style={styles.bulletPoint}>• Your consent</Text>
        <Text style={styles.bulletPoint}>• Contract fulfillment (providing our services)</Text>
        <Text style={styles.bulletPoint}>• Legal obligations</Text>
        <Text style={styles.bulletPoint}>• Legitimate interests (improving our services)</Text>

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
  link: {
    fontSize: 16,
    color: '#FF69B4',
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  bottomSpacing: {
    height: 40,
  },
});