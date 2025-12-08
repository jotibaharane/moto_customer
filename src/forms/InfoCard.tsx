import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';

type Props = {
  title: string;
  address: string;
  onEdit: () => void;
};

export function formatAddress(
  name: string,
  mobile: string,
  line1: string,
  line2: string,
  state: string,
  pincode: string,
) {
  return `${name}, ${mobile}\n${line1}, ${line2}\n${state}\n${pincode}`;
}

export default function InfoCard({ title, address, onEdit }: Props) {
  return (
    <Card style={styles.card}>
      <Card.Title
        title={title}
        right={() => <IconButton icon="pencil" size={22} onPress={onEdit} />}
      />
      <Card.Content>
        <Text style={styles.address}>{address}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 12,
  },
  address: {
    fontSize: 15,
    marginTop: 4,
  },
});
