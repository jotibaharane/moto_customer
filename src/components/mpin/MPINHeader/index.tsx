import colors from '@utils/colors';
import { fontSize, hp, wp } from '@utils/responsive';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface MPINHeaderProps {
  title: string;
  subtitle: string;
}

const MPINHeader: React.FC<MPINHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.header}>
      <Image
        source={require('@assets/moto_help_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: hp(40),
    marginBottom: hp(30),
    paddingHorizontal: wp(24),
  },
  logo: {
    width: wp(80),
    height: hp(80),
    marginBottom: hp(20),
  },
  title: {
    fontSize: fontSize(24),
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: hp(8),
  },
  subtitle: {
    fontSize: fontSize(14),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize(20),
  },
});

export default MPINHeader;
