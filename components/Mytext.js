import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const Mytext = props => {
  return <Text style={styles.text}>{props.text}</Text>;
};

export const MytextTwo = props => {
  return <Text style={styles.textTwo}>{props.text}</Text>;
};
const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  textTwo: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});