import colors from '@utils/colors';
import { fontSize, hp, ms, wp } from '@utils/responsive';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: wp(5), paddingBottom: hp(10) },
  header: {
    fontSize: fontSize(24),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: hp(20),
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: ms(10),
    marginBottom: hp(20),
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSize(18),
    fontWeight: '600',
    color: colors.primary,
    marginBottom: hp(15),
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    // paddingBottom: hp(5),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: hp(8),
  },
  halfInput: { width: '48%' },
  input: { backgroundColor: colors.surface },
  submitButton: {
    borderRadius: ms(10),
    // marginTop: hp(10),
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  submitButtonContent: { height: hp(50) },
  submit: {
    color: '#fff',
    fontWeight: '500',
  },
});
