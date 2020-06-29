import React from 'react';
import { TouchableHighlight, Text, StyleSheet } from 'react-native';
const Mytext = props => {
  return <Text style={styles.text}>{props.text}</Text>;
};
const styles = StyleSheet.create({
  text: {
    color: 'yellow',
    fontSize: 18,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 148,
    marginRight: 35,
  },
});
export default Mytext;