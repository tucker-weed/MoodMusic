import React from 'react';
import { View } from 'react-native';
import Mybutton from '../components/Mybutton.js';
import Mytext from '../components/Mytext.js';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    db.transaction(function(txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_u'",
        [],
        function(tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_u', []);
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
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
        }}
        >
        <Mytext text="Profile Creation" />
        <Mybutton
          title="Register"
          customClick={() => this.props.navigation.navigate('Register')}
        />
        <Mybutton
          title="Update"
          customClick={() => this.props.navigation.navigate('Update')}
        />
        <Mybutton
          title="View"
          customClick={() => this.props.navigation.navigate('View')}
        />
        <Mybutton
          title="View All"
          customClick={() => this.props.navigation.navigate('ViewAll')}
        />
        <Mybutton
          title="Delete"
          customClick={() => this.props.navigation.navigate('Delete')}
        />
        <Mybutton
          title="LOG IN"
          customClick={() => this.props.navigation.navigate('Login')}
        />
      </View>
    );
  }
}
