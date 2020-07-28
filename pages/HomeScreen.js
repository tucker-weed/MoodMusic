import React from "react";
import { View } from "react-native";
import { LoginButton } from "../components/MyButtons.js";
import { StackActions } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Mytext } from "../components/Mytext.js";
import { getData } from "../LocalStorage.js";
import { apiGet } from "../APIfunctions.js";
import { styles } from "../Styles.js";

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  toNav = async () => {
    const token = await getData("accessToken");

    try {
      await apiGet("https://api.spotify.com/v1/me", token);
      this.props.navigation.dispatch(StackActions.replace("MoodHome"));
    } catch (e) {
      const check =
        e["response"] &&
        e["response"]["data"] &&
        e["response"]["data"]["error"] &&
        e["response"]["data"]["error"]["status"];
      if (check && e.response.data.error.status == 401) {
        this.props.navigation.dispatch(
          StackActions.replace("SpotifyLogin", {
            routeName: "HomeScreen"
          })
        );
      }
      console.log(e);
    }
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black"
        }}
      >
        <Mytext text="Welcome Back" />
        <LoginButton title="Spotify" customClick={this.toNav} />
        <View style={styles.container}>
          <FontAwesome name="spotify" color="#2FD566" size={128} />
        </View>
      </View>
    );
  }
}
