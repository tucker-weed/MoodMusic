import React from "react";
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import axios from "axios";

import { styles } from "../Styles.js";
import { setData, getData } from "../LocalStorage.js";

export default class MoodHome extends React.Component {
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

  activate = async () => {
    const data = this.state.userInfo
      ? this.state.userInfo
      : await getData("userData");
    const access = this.state.access
      ? this.state.access
      : await getData("accessToken");
    const url = "https://api.spotify.com/v1/users/" + data.id + "/playlists";
    const response = await this.apiGet(url, access);
    if (response) {
      console.log("Loaded playlists' data");
      if (this.userInfo && this.token) {
        this.setState({ playlists: response.data.items });
      } else {
        this.setState({
          playlists: response.data.items,
          userInfo: data,
          token: access
        });
      }
    } else {
      console.log("ERROR: token expired");
      this.setState({ userInfo: null, token: null, playlists: null });
    }
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          flexDirection: "column"
        }}
      >
        <TouchableOpacity style={styles.button} onPress={this.activate}>
          <Text style={styles.buttonText}>Search Your Playlists</Text>
        </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.loadButton}
                  onPress={async () => {
                    await setData("playlistId", item.id);
                    this.props.navigation.navigate("PlaylistCreator");
                  }}
                >
                  <Text style={styles.buttonText}>Load</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : null}
      </View>
    );
  }
}
