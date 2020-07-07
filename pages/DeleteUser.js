import React from 'react';
import { View } from 'react-native';
import Mytextinput from '../components/Mytextinput.js';
import { ButtonOne, DangerButton } from '../components/MyButtons.js';
import { Mytext } from '../components/Mytext.js';
import { StackActions } from '@react-navigation/native';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

export default class UpdateUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input_user_name: '',
      deleted: '1',
    };
  }
  deleteUser = () => {
    const that = this;
    const { input_user_name } = this.state;
    
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM  table_u where user_name=?',
        [input_user_name],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            that.setState({ deleted: '2', })
          } else {
            that.setState({ deleted: '3', })
          }
        }
      );
    });
  };
  render() {
    const toNav = this.state.deleted === '2' ? "HomeScreen" : "HomeScreenTwo";
    const params = this.state.deleted === '2' ? false : true;
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
        {this.state.deleted === '2' ? null : 
        <DangerButton
          title="Delete User"
          customClick={this.deleteUser.bind(this)}
        />}
        <ButtonOne
          title="Mood Music Home"
          customClick={() => this.props.navigation.dispatch(StackActions.replace(toNav, { registered: params }))}
        />
        <Mytext
        text = {this.state.deleted === '2' ? "Deleted successfully" : 
        (this.state.deleted === '3' ? "Please enter a valid user" : "")}
        />
      </View>
    );
  }
}