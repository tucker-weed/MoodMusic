import React from 'react';
import { View, YellowBox, ScrollView, KeyboardAvoidingView, Alert, } from 'react-native';
import Mytextinput from '../components/Mytextinput.js';
import Mybutton from '../components/Mybutton.js';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');
 
export default class UpdateUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input_user_name: '',
      input_user_password: '',
      user_name: '',
      user_password: '',
      collected_user_password: '',
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
          if (len > 0) {
            this.setState({ collected_user_password: results.rows.item(0).user_password })
          } else {
            this.setState({
              userData: '',
            });
          }
        }
      );
    });
  };

  updateUser = () => {
    var that=this;
    const { input_user_name } = this.state;
    const { user_name } = this.state;
    const { user_password } = this.state;
    const { input_user_password } = this.state;
    const { collected_user_password } = this.state;
    if (user_name && input_user_password == collected_user_password){
      if (user_password) {
          db.transaction((tx)=> {
            tx.executeSql(
              'UPDATE table_u SET user_name=?, user_password=? WHERE user_name=?',
              [user_name, user_password, input_user_name],
              (tx, results) => {
                if(results.rowsAffected>0){
                  Alert.alert( 'Success', 'User updated successfully',
                    [
                      {text: 'Ok', onPress: () => that.props.navigation.navigate('HomeScreen')},
                    ],
                    { cancelable: false }
                  );
                }else{
                  Alert.alert('Updating Failed');
                }
              }
            );
          });
        }else{
          Alert.alert('Please fill Password');
        }
      }else{
        Alert.alert('Please enter correct old username or password');
      }
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
        <ScrollView keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1, justifyContent: 'space-between' }}>
            <Mytextinput
              placeholder="Enter Old User Name"
              style={{ padding:10 }}
              onChangeText={input_user_name => this.setState({ input_user_name })}
            />
            <Mytextinput
              placeholder="Enter Old Password"
              style={{ padding:10 }}
              onChangeText={input_user_password => ( this.searchUser(),
                this.setState({ input_user_password }) )}
            />
            <Mytextinput
              placeholder="Enter New User Name"
              value={this.state.user_name}
              style={{ padding:10 }}
              onChangeText={user_name => this.setState({ user_name })}
            />
            <Mytextinput
              placeholder="Enter Password"
              value={''+ this.state.user_password}
              onChangeText={user_password => this.setState({ user_password })}
              maxLength={10}
              style={{ padding:10 }}
            />
            <Mybutton
              title="Update User"
              customClick={this.updateUser.bind(this)}
            />
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}