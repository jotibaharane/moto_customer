import colors from '@utils/colors';
import { fontSize, hp, ms, wp } from '@utils/responsive';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: wp(24),
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp(20),
  },
  logoBackground: {
    backgroundColor: colors.primary,
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(10),
    borderWidth: 3,
    borderColor: colors.accent,
  },
  logo: {
    width: wp(60),
    height: hp(60),
    tintColor: colors.textOnPrimary,
  },
  companyName: {
    fontSize: fontSize(24),
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: hp(5),
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: fontSize(14),
    color: colors.textSecondary,
    marginTop: hp(4),
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: ms(12),
    paddingHorizontal: wp(20),
    paddingVertical: hp(24),
    marginBottom: hp(20),
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: fontSize(20),
    marginBottom: hp(8),
    textAlign: 'center',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize(14),
    textAlign: 'center',
    marginBottom: hp(24),
    lineHeight: fontSize(20),
  },
  input: {
    marginBottom: hp(16),
    backgroundColor: colors.surface,
    fontSize: fontSize(16),
  },
  otpContainer: {
    marginBottom: hp(16),
    alignItems: 'center',
  },
  otpInput: {
    position: 'absolute',
    width: '100%',
    height: hp(60),
    opacity: 0,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  otpBox: {
    width: wp(48),
    height: hp(60),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  otpBoxActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20', // Add opacity
  },
  otpText: {
    fontSize: fontSize(24),
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  errorText: {
    marginBottom: hp(16),
    fontSize: fontSize(14),
    textAlign: 'center',
    color: colors.error,
  },
  button: {
    marginTop: hp(8),
    borderRadius: ms(8),
    backgroundColor: colors.primary,
    paddingVertical: hp(2),
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonLabel: {
    color: colors.textOnPrimary,
    fontSize: fontSize(16),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: hp(48),
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(24),
  },
  resendText: {
    color: colors.textSecondary,
    fontSize: fontSize(14),
  },
  resendButton: {
    fontSize: fontSize(14),
    color: colors.primary,
    marginLeft: wp(4),
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: hp(10),
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize(12),
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLink: {
    fontSize: fontSize(12),
    color: colors.primary,
    fontWeight: 'bold',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
