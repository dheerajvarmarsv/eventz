import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Crown,
  Users,
  Image,
  Filter,
  Cloud,
  Zap,
  Check,
} from 'lucide-react-native';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

export function PremiumModal({ visible, onClose, theme }: PremiumModalProps) {
  const features = [
    {
      icon: Users,
      title: 'Unlimited Guests',
      description: 'Invite as many guests as you want to your events',
      free: '25 guests',
      premium: 'Unlimited',
    },
    {
      icon: Image,
      title: 'Advanced Photo Features',
      description: 'AI enhancement, bulk downloads, and premium filters',
      free: 'Basic features',
      premium: 'All features',
    },
    {
      icon: Filter,
      title: 'Premium Filters',
      description: '50+ professional photo filters and effects',
      free: '5 filters',
      premium: '50+ filters',
    },
    {
      icon: Cloud,
      title: 'Unlimited Storage',
      description: 'Store unlimited photos and videos in the cloud',
      free: '1GB storage',
      premium: 'Unlimited',
    },
    {
      icon: Zap,
      title: 'Priority Support',
      description: '24/7 priority customer support and assistance',
      free: 'Email support',
      premium: '24/7 priority',
    },
  ];

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      period: 'per month',
      popular: false,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$99.99',
      period: 'per year',
      popular: true,
      savings: 'Save 17%',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Crown size={20} color="#F59E0B" />
            <Text style={[styles.title, { color: theme.text }]}>
              EventSnap Premium
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              Unlock the Full EventSnap Experience
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Create unlimited events, invite unlimited guests, and capture unlimited memories
            </Text>
          </View>

          <View style={styles.features}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[styles.feature, { backgroundColor: theme.surface }]}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <feature.icon size={24} color={theme.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    {feature.description}
                  </Text>
                  <View style={styles.featureComparison}>
                    <View style={styles.comparisonItem}>
                      <Text style={[styles.comparisonLabel, { color: theme.textSecondary }]}>
                        Free:
                      </Text>
                      <Text style={[styles.comparisonValue, { color: theme.textSecondary }]}>
                        {feature.free}
                      </Text>
                    </View>
                    <View style={styles.comparisonItem}>
                      <Text style={[styles.comparisonLabel, { color: theme.primary }]}>
                        Premium:
                      </Text>
                      <Text style={[styles.comparisonValue, { color: theme.primary }]}>
                        {feature.premium}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.pricing}>
            <Text style={[styles.pricingTitle, { color: theme.text }]}>
              Choose Your Plan
            </Text>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.pricingCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: plan.popular ? theme.primary : theme.border,
                    borderWidth: plan.popular ? 2 : 1,
                  },
                ]}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                <View style={styles.pricingHeader}>
                  <Text style={[styles.planName, { color: theme.text }]}>
                    {plan.name}
                  </Text>
                  {plan.savings && (
                    <Text style={[styles.savings, { color: theme.success }]}>
                      {plan.savings}
                    </Text>
                  )}
                </View>
                <View style={styles.pricingPrice}>
                  <Text style={[styles.price, { color: theme.text }]}>
                    {plan.price}
                  </Text>
                  <Text style={[styles.period, { color: theme.textSecondary }]}>
                    {plan.period}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
          </TouchableOpacity>

          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <Check size={16} color={theme.success} />
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                7-day free trial
              </Text>
            </View>
            <View style={styles.benefit}>
              <Check size={16} color={theme.success} />
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                Cancel anytime
              </Text>
            </View>
            <View style={styles.benefit}>
              <Check size={16} color={theme.success} />
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                No commitment required
              </Text>
            </View>
          </View>

          <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
            Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 16,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureComparison: {
    gap: 4,
  },
  comparisonItem: {
    flexDirection: 'row',
    gap: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    minWidth: 50,
  },
  comparisonValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  pricing: {
    marginBottom: 32,
  },
  pricingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 20,
  },
  pricingCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  savings: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  pricingPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  period: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  benefits: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 32,
  },
});