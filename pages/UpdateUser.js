import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, } from 'react-native';
import Mytextinput from '../components/Mytextinput.js';
import { Mytext } from '../components/Mytext.js';
import { ButtonOne } from '../components/MyButtons.js';
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
      updated: '1',
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
              (_, results) => {
                if(results.rowsAffected>0){
                  this.setState({ updated: '2' });
                }else{
                  this.setState({ updated: '3' });
                }
              }
            );
          });
        }else{
          console.log('Please fill Password');
        }
      }else{
        this.setState({ updated: '4' });
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
            <ButtonOne
              title="Update User"
              customClick={this.updateUser.bind(this)}
            />
            <Mytext
            text  = {this.state.updated == '2' ? "Updated successfully"
                    : this.state.updated == '3' ? "Update failed"
                    : this.state.updated == '4' ? "Please enter correct old info" : ""}
            />
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}