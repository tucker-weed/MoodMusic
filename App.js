import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const CLIENT_ID = 'bc4798c9fb304cbc83425e514fa4e986';
const url = 'https://api.spotify.com/v1/search?type=track&limit=50&q=' + encodeURIComponent('track:\"'+"Soy Peor"+'\"');

export default class App extends Component {

  state = {
    userInfo: null,
    didError: false,
    token: null,
  };

  search = async () => {
    const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${this.state.token}`
        }
    });
    if (response == null) {
      console.log("ERROR: token expired")
      this.setState({ userInfo: null, didError: false, token: null });
    } else {
      console.log(response);
    }
  };

  handleSpotifyLogin = async () => {
    let redirectUrl = AuthSession.getRedirectUrl();
    console.log(redirectUrl);

    let results = await AuthSession.startAsync({
      authUrl: `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=user-read-email&response_type=token`
    });
    if (results.type !== 'success') {
      console.log(results.type);
      this.setState({ didError: true, token: null });
    } else {
      const userInfo = await axios.get(`https://api.spotify.com/v1/me`, {
        headers: {
          "Authorization": `Bearer ${results.params.access_token}`
        }
      });
      console.log(userInfo);
      this.setState({ userInfo: userInfo.data, token: results.params.access_token });
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
  }

  displayResults = () => {
    { return this.state.userInfo ? (
      <View style={styles.userInfo}>
        <Image
          style={styles.profileImage}
          source={ {'uri': this.state.userInfo.images[0].url} }
        />
        <View>
          <Text style={styles.userInfoText}>
            Username:
          </Text>
          <Text style={styles.userInfoText}>
            {this.state.userInfo.display_name}
          </Text>
          <Text style={styles.userInfoText}>
            Email:
          </Text>
          <Text style={styles.userInfoText}>
            {this.state.userInfo.email}
          </Text>
        </View>
      </View>
    ) : (
      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>
          Login to Spotify to see user data.
        </Text>
      </View>
    )}
  }

  render() {
    return (
      <View style={styles.container}>
        <FontAwesome
          name="spotify"
          color="#2FD566"
          size={128}
        />
        {!this.state.userInfo ?
        <TouchableOpacity
          style={styles.button}
          onPress={this.handleSpotifyLogin}
        >
          <Text style={styles.buttonText}>
            Login with Spotify
          </Text>
        </TouchableOpacity> : null}
        {this.state.didError ?
          this.displayError() :
          this.displayResults()
        }
        {this.state.userInfo ? 
        <TouchableOpacity 
          style={styles.button} 
          onPress={this.search}
        >
          <Text style={styles.buttonText}>
            Search
          </Text>
        </TouchableOpacity> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#000',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  button: {
    backgroundColor: '#2FD566',
    padding: 20
  },
  buttonText: {
    color: '#000',
    fontSize: 20
  },
  userInfo: {
    height: 250,
    width: 200,
    alignItems: 'center',
  },
  userInfoText: {
    color: '#fff',
    fontSize: 18
  },
  errorText: {
    color: '#fff',
    fontSize: 18
  },
  profileImage: {
    height: 64,
    width: 64,
    marginBottom: 32
  }
});