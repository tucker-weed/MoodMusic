import React from 'react';
import { View, Alert } from 'react-native';
import Mytextinput from '../components/Mytextinput.js';
import { ButtonOne, DangerButton } from '../components/MyButtons.js';
import { StackActions } from '@react-navigation/native';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

export default class UpdateUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input_user_name: '',
    };
  }
  deleteUser = () => {
    let that = this;
    const { input_user_name } = this.state;
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM  table_u where user_name=?',
        [input_user_name],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            Alert.alert(
              'Success',
              'User deleted successfully',
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    that.props.navigation.dispatch(
                      StackActions.replace('HomeScreen', {
                        registered: false,
                      })
                    );
                  },
                },
              ],
              { cancelable: false }
            );
          } else {
            Alert.alert('Please insert a valid User Name');
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
        <DangerButton
          title="Delete User"
          customClick={this.deleteUser.bind(this)}
        />
        <ButtonOne
          title="Mood Music Home"
          customClick={() => this.props.navigation.dispatch(StackActions.replace('HomeScreen', { registered: true }))}
        />
      </View>
    );
  }
}