import React from 'react';
import { View } from 'react-native';
import Mytextinput from '../components/Mytextinput.js';
import { Mytext } from '../components/Mytext.js';
import { LoginButton } from '../components/MyButtons.js';
import { StackActions } from '@react-navigation/native';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input_user_name: '',
      input_user_password: '',
      userStatus: true,
      passStatus: true,
    };
  }
  searchUser = () => {
    const { input_user_name } = this.state;
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM table_u where user_name = ?',
        [input_user_name],
        (tx, results) => {
          let len = results.rows.length;
          if (len > 0) {
            if (this.state.input_user_password == results.rows.item(0).user_password) {
              this.props.navigation.dispatch(StackActions.replace('HomeScreenTwo', {}));
            } else {
              this.setState({ userStatus: true, passStatus: false })
            }
          } else {
            this.setState({
              userData: '',
              userStatus: false 
            });
          }
        }
      );
    });
  };
  render() {
    return (
      <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        flexDirection: 'column',
      }}
      >
        <Mytextinput
          placeholder="Enter User Name"
          onChangeText={input_user_name => this.setState({ input_user_name })}
          style={{ padding:10 }}
        />
        <Mytextinput
          placeholder="Enter User Password"
          onChangeText={input_user_password => this.setState({ input_user_password })}
          style={{ padding:10 }}
        />
        <LoginButton
          title="Login"
          customClick={this.searchUser.bind(this)}
        />
        {this.state.passStatus ? null : 
        <Mytext
        text = "Incorrect password"
        />}
        {this.state.userStatus ? null : 
        <Mytext
        text = "Incorrect username"
        />}
      </View>
    );
  }
}

