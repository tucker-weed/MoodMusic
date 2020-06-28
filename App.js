import React, { Component } from "react";
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import * as AuthSession from "expo-auth-session";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

import { styles } from "./Styles.js";

const CLIENT_ID = "bc4798c9fb304cbc83425e514fa4e986";

export default class App extends Component {
  state = {
    userInfo: null,
    didError: false,
    token: null,
    playlists: null
  };

  apiGet = async (url, token) => {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  search = async () => {
    const url =
      "https://api.spotify.com/v1/users/" +
      this.state.userInfo.id +
      "/playlists";
    const response = await this.apiGet(url, this.state.token);
    if (response == null) {
      console.log("ERROR: token expired");
      this.setState({ userInfo: null, didError: false, token: null });
    } else {
      console.log("Loaded playlists' data");
      this.setState({ playlists: response.data.items });
    }
  };

  handleSpotifyLogin = async () => {
    let redirectUrl = AuthSession.getRedirectUrl();
    let results = await AuthSession.startAsync({
      authUrl: `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUrl
      )}&scope=user-read-email&response_type=token`
    });

    if (results.type !== "success") {
      console.log(results.type);
      this.setState({ didError: true, token: null });
    } else {
      const userInfo = await this.apiGet(
        `https://api.spotify.com/v1/me`,
        results.params.access_token
      );
      this.setState({
        userInfo: userInfo.data,
        token: results.params.access_token
      });
    }
  };

  displayError = () => {
    return (
      <View style={styles.userInfo}>
        <Text style={styles.errorText}>
          There was an error, please try again.
        </Text>
      </View>
    );
  };

  displayResults = () => {
    {
      return this.state.userInfo ? (
        <View style={styles.userInfo}>
          <Image
            style={styles.profileImage}
            source={{ uri: this.state.userInfo.images[0].url }}
          />
          <View>
            <Text style={styles.userInfoText}>Username:</Text>
            <Text style={styles.userInfoText}>
              {this.state.userInfo.display_name}
            </Text>
            <Text style={styles.userInfoText}>Email:</Text>
            <Text style={styles.userInfoText}>{this.state.userInfo.email}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>
            Login to Spotify to see user data.
          </Text>
        </View>
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <FontAwesome name="spotify" color="#2FD566" size={128} />
        {!this.state.userInfo ? (
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleSpotifyLogin}
          >
            <Text style={styles.buttonText}>Login with Spotify</Text>
          </TouchableOpacity>
        ) : null}
        {this.state.didError
          ? this.displayError()
          : this.state.playlists
          ? null
          : this.displayResults()}
        {this.state.userInfo ? (
          <TouchableOpacity style={styles.button} onPress={this.search}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        ) : null}
        {this.state.playlists ? (
          <FlatList
            data={this.state.playlists}
            ItemSeparatorComponent={null}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                key={item.id}
                style={{ backgroundColor: "black", padding: 5 }}
              >
                <Text style={{ color: "white" }}>Playlist Id: {item.id}</Text>
                <Image
                  style={styles.profileImage}
                  source={{ uri: item.images[0].url }}
                />
              </View>
            )}
          />
        ) : null}
      </View>
    );
  }
}
