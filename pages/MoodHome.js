import React from 'react';
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import Mytextinput from '../components/Mytextinput.js';
import axios from "axios";

import { styles } from "../Styles.js";

export default class OnlineRules extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      token: null,
      playlists: null
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

  search = async () => {
    const url =
      "https://api.spotify.com/v1/users/" +
      this.state.userInfo.id +
      "/playlists";
    const response = await this.apiGet(url, this.state.token);
    if (response) {
      console.log("Loaded playlists' data");
      this.setState({ playlists: response.data.items });
    } else {
      console.log("ERROR: token expired");
      this.setState({ userInfo: null, didError: false, token: null });
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