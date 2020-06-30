import React from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import * as AuthSession from "expo-auth-session";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

import { styles } from "../Styles.js";
import { setData } from '../localStorage.js';
const CLIENT_ID = "bc4798c9fb304cbc83425e514fa4e986";

export default class SpotifyLogin extends React.Component {

  /**
   * Component state
   * 
   * @param userInfo - the spotify account holder's info
   * @param didError - indicates whether or not authentication succeeded
   * @param token - the spotify api's required authentication token
   * @param playlists - a json of a list of the account holder's playlists
   */
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      didError: false,
      token: null,
    };
  }

  /**
   * Requests information based on url and gives a response
   * 
   * @param url - the url of the spotify api with a given endpoint
   * @param token - the authorization token to pass to the api
   * @returns - a json object being the api response, or null
   */
  apiGet = async (url, token) => {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  nav = () => {
    this.props.navigation.navigate('MoodHome');
  }


  /**
   * Handles spotify authentication and updates state
   */
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
      await setData('userData', userInfo.data);
      await setData('accessToken', results.params.access_token);
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
        {this.state.userInfo ? null : (
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleSpotifyLogin}
          >
            <Text style={styles.buttonText}>Login to Spotify</Text>
          </TouchableOpacity>
        )}
        {this.state.didError
          ? this.displayError()
          : this.state.playlists
          ? null
          : this.displayResults()}
        {this.state.userInfo ? (
          <TouchableOpacity style={styles.button} onPress={this.nav}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}
