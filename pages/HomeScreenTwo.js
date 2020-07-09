import React from "react";
import { View } from "react-native";
import { ButtonOne, LoginButton } from "../components/MyButtons.js";
import { StackActions } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Mytext } from "../components/Mytext.js";
import * as SQL from "expo-sqlite";
const db = SQL.openDatabase("UDB.db");

import { styles } from "../Styles.js";

export default class HomeScreenTwo extends React.Component {
  constructor(props) {
    super(props);
    db.transaction(function(txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_u'",
        [],
        function(tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql(
              "CREATE TABLE IF NOT EXISTS table_u(user_name VARCHAR(20), user_password VARCHAR(20))",
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
          backgroundColor: "black"
        }}
      >
        <Mytext text="Welcome Back" />
        <ButtonOne
          title="Update"
          customClick={() => this.props.navigation.navigate("Update")}
        />
        <ButtonOne
          title="Account"
          customClick={() => this.props.navigation.navigate("ViewAll")}
        />
        <ButtonOne
          title="Delete"
          customClick={() =>
            this.props.navigation.dispatch(StackActions.replace("Delete", {}))
          }
        />
        <LoginButton
          title="Spotify"
          customClick={() => this.props.navigation.navigate("SpotifyLogin")}
        />
        <View style={styles.container}>
          <FontAwesome name="spotify" color="#2FD566" size={128} />
        </View>
      </View>
    );
  }
}

