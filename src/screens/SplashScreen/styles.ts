import colors from '@utils/colors';
import { fontSize, hp, ms, wp } from '@utils/responsive';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDarkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(24),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: wp(200),
    height: hp(200),
    marginBottom: hp(20),
  },
  appName: {
    color: colors.primaryDark,
    fontWeight: '700',
    marginBottom: hp(8),
    textTransform: 'uppercase',
    letterSpacing: ms(1.5),
  },
  tagline: {
    color: colors.background,

    fontWeight: '500',
    textAlign: 'center',
    maxWidth: wp(280),
  },
  loadingContainer: {
    marginBottom: hp(50),
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: wp(200),
    height: hp(4),
    backgroundColor: colors.divider,
    borderRadius: ms(2),
    overflow: 'hidden',
    marginBottom: hp(8),
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: ms(2),
  },
  loadingText: {
    color: colors.background,
    fontSize: fontSize(ms(14)),
  },
});
