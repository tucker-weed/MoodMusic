import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const ButtonOne = props => {
  return (
    <TouchableOpacity style={buttonStyles1.button} onPress={props.customClick}>
      <Text style={buttonStyles1.text}>{props.title}</Text>
    </TouchableOpacity>
  );
};

export const LoginButton = props => {
  return (
    <TouchableOpacity style={buttonStyles2.button} onPress={props.customClick}>
      <Text style={buttonStyles2.text}>{props.title}</Text>
    </TouchableOpacity>
  );
}

export const DangerButton = props => {
  return (
    <TouchableOpacity style={buttonStyles3.button} onPress={props.customClick}>
      <Text style={buttonStyles3.text}>{props.title}</Text>
    </TouchableOpacity>
  );
}

export const PlayerButton = props => {
  return (
    <TouchableOpacity style={buttonStyles4.button} onPress={props.customClick}>
      <Text style={buttonStyles4.text}>{props.title}</Text>
    </TouchableOpacity>
  );
}

const buttonStyles1 = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#2FD566',
    color: '#ffffff',
    padding: 10,
    marginTop: 16,
    marginLeft: 35,
    marginRight: 35,
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

const buttonStyles2 = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#2FD566',
    color: 'white',
    padding: 10,
    marginTop: 16,
    marginLeft: 35,
    marginRight: 35,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

const buttonStyles3 = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#2FD566',
    color: 'white',
    padding: 10,
    marginTop: 16,
    marginLeft: 35,
    marginRight: 35,
  },
  text: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

const buttonStyles4 = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#2FD566',
    color: 'white',
    padding: 10,
    marginTop: 16,
    marginLeft: 47,
    marginRight: 48,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});