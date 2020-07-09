import React from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Mytext } from '../components/Mytext.js';
import Mytextinput from '../components/Mytextinput.js';
import { ButtonOne } from '../components/MyButtons.js';
import { StackActions } from '@react-navigation/native';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

export default class RegisterUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_name: '',
      user_password: '',
      registered: false,
    };
  }
  submit = () => {
    const that = this;
    const { user_name, user_password } = this.state;
    
    db.transaction(function(tx) {
      tx.executeSql(
        'INSERT INTO table_u (user_name, user_password) VALUES (?,?)',
        [user_name, user_password],
        (results) => { 
          that.setState({ registered: true }); 
        },
      );
    });
  };
  render() {
    const toNav = this.state.registered ? "HomeScreenTwo" : "HomeScreen";
    const params = this.state.registered ? true : false;
    return (
      <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
        flexDirection: 'column',
      }}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1, justifyContent: 'space-between' }}>
            <Mytextinput
              placeholder="Enter Name"
              onChangeText={user_name => this.setState({ user_name })}
              style={{ padding:10 }}
            />
            <Mytextinput
              placeholder="Enter Password"
              onChangeText={user_password => this.setState({ user_password })}
              maxLength={20}
              style={{ padding:10 }}
            />
            {this.state.registered ? null : 
            <ButtonOne
              title="Submit"
              customClick={this.submit.bind(this)}
            />}
            <ButtonOne
              title="Mood Music Home"
              customClick={() => this.props.navigation.dispatch(StackActions.replace(toNav, { registered: params }))}
            />
            <Mytext
            text = {this.state.registered ? "Registered successfully" : ""}
            />
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}

