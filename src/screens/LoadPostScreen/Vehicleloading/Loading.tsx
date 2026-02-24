import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import LoadingStatusModalUI from '@screens/DashboardScreen/component/LoadpostImage/LoadingStatusModalUI';
import { useState } from 'react';

export default function Loading() {
  const [modalVisible, setModalVisible] = useState(true);

  //   useEffect(() => {
  //     if (!modalVisible) return;

  //     const timer = setTimeout(() => {
  //       setModalVisible(false);
  //     }, 5000);

  //     return () => clearTimeout(timer);
  //   }, [modalVisible]);
  return (
    <View style={styles.container}>
      <LoadingStatusModalUI
        visible={modalVisible}
        setVisible={setModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
