import React from 'react';
import { FlatList, Text, View } from 'react-native';
import * as SQL from 'expo-sqlite';
const db = SQL.openDatabase('UDB.db');

export default class ViewAllUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      FlatListItems: [],
    };
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM table_u', [], (tx, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          FlatListItems: temp,
        });
      });
    });
  }
  ListViewItemSeparator = () => {
    return (
      <View style={{ height: 0.2, width: '100%', backgroundColor: '#808080' }} />
    );
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
        <FlatList
          data={this.state.FlatListItems}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View key={item.user_name} style={{ backgroundColor: 'black', padding: 20 }}>
              <Text style={{ color: 'yellow' }}>User Name: {item.user_name}</Text>
              <Text style={{ color: 'yellow' }}>User Password: ***********</Text>
            </View>
          )}
        />
      </View>
    );
  }
}