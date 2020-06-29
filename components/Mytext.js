import React from 'react';
import { TouchableHighlight, Text, StyleSheet } from 'react-native';
const Mytext = props => {
  return <Text style={styles.text}>{props.text}</Text>;
};
const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 142,
    marginRight: 35,
  },
});
export default Mytext;