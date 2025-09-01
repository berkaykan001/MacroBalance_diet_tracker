import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, OnboardingContainer } from './components/OnboardingComponents';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.navigate('BasicInfo');
  };

  return (
    <OnboardingContainer showProgress={false}>
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.appTitle}>MacroBalance</Text>
          <Text style={styles.heroText}>
            Personalized nutrition tailored to your unique body and goals
          </Text>
        </View>

        {/* Value Propositions */}
        <View style={styles.featuresSection}>
          <FeatureCard
            icon="🎯"
            title="Precision Nutrition"
            description="Get exact macro targets calculated from your age, weight, activity level, and goals"
          />
          
          <FeatureCard
            icon="🔬"
            title="Science-Backed"
            description="Using proven BMR and TDEE equations trusted by nutritionists worldwide"
          />
          
          <FeatureCard
            icon="📱"
            title="Adaptive System"
            description="Your targets automatically adjust as your body and goals change"
          />
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>
            Ready to discover your personalized nutrition plan?
          </Text>
          
          <PrimaryButton
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />
          
          <Text style={styles.disclaimerText}>
            Takes 2-3 minutes • Based on scientific calculations
          </Text>
        </View>
      </View>
    </OnboardingContainer>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Text style={styles.featureIcon}>{icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },

  // Features Section
  featuresSection: {
    paddingVertical: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // CTA Section
  ctaSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ctaText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  getStartedButton: {
    width: '100%',
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});