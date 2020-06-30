import React from 'react';
import { View } from 'react-native';
import { ButtonOne, LoginButton } from '../components/MyButtons.js';
import { StackActions } from '@react-navigation/native';
import { FontAwesome } from "@expo/vector-icons";
import Mytext from '../components/Mytext.js';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

import { styles } from "../Styles.js";

export default class HomeScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      registered: false,
    }
    db.transaction(function(txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_u'",
        [],
        function(tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_u(user_name VARCHAR(20), user_password VARCHAR(20))',
              []
            );
          }
        }
      );
    });
  }

  render() {
    const that = this;
    const { registered } = this.state;
    db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM table_u', [], (tx, results) => {
        if (results.rows.length >= 1 && !registered) {
          that.setState({ registered: !registered });
        }
      });
    });
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
        }}
        >
        <Mytext text={registered ? "Account Login" : "Account Registration"} />
        {registered ?
        <LoginButton
        title="Login"
        customClick={() => that.props.navigation.dispatch(StackActions.replace('Login', {}))}
        /> 
        : 
        <ButtonOne
          title="Register"
          customClick={() => that.props.navigation.dispatch(StackActions.replace('Register', {}))}
        />}
        <View style={styles.container}>
          <FontAwesome name="spotify" color="#2FD566" size={128} />
        </View>
      </View>
    );
  }
}