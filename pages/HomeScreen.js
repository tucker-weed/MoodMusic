import React from 'react';
import { View } from 'react-native';
import { ButtonOne, LoginButton } from '../components/MyButtons.js';
import { StackActions } from '@react-navigation/native';
import Mytext from '../components/Mytext.js';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

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
        <Mytext text="Profile Creation" />
        {registered ? null : <ButtonOne
          title="Register"
          customClick={() => that.props.navigation.dispatch(StackActions.replace('Register', {}))}
        />}
        {registered ? <ButtonOne
          title="Update"
          customClick={() => that.props.navigation.navigate('Update')}
        /> : null}
        {registered ? <ButtonOne
          title="Account"
          customClick={() => that.props.navigation.navigate('ViewAll')}
        /> : null}
        {registered ? <ButtonOne
          title="Delete"
          customClick={() => that.props.navigation.dispatch(StackActions.replace('Delete', {}))}
        /> : null}
        {registered ? <LoginButton
          title="Login"
          customClick={() => that.props.navigation.navigate('Login')}
        /> : null}
      </View>
    );
  }
}
