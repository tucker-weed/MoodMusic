import React from 'react';
import { Text, View, Alert } from 'react-native';
import Mytextinput from '../components/Mytextinput.js';
import Mybutton from '../components/Mybutton.js';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

export default class ViewUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input_user_name: '',
      userData: '',
    };
  }
  searchUser = () => {
    const { input_user_name } = this.state;
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM table_u where user_name = ?',
        [input_user_name],
        (tx, results) => {
          var len = results.rows.length;
          console.log('len', len);
          if (len > 0) {
            this.setState({
              userData: results.rows.item(0),
            });
          } else {
            Alert.alert('No user found');
            this.setState({
              userData: '',
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
        <Mybutton
          title="Search User"
          customClick={this.searchUser.bind(this)}
        />
        <View style={{ marginLeft: 35, marginRight: 35, marginTop: 10 }}>
          <Text style={{ color: 'yellow' }}>User Name: {this.state.userData.user_name}</Text>
          <Text style={{ color: 'yellow' }}>User Password: ***********</Text>
        </View>
      </View>
    );
  }
}