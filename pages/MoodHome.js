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

  apiPost = async (url, token) => {
    const jsonData = {
      name: "MoodMusicPlaylist",
      public: true,
    };
    return await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  activate = async () => {
    const data = this.state.userInfo
      ? this.state.userInfo
      : await getData("userData");
    const access = this.state.access
      ? this.state.access
      : await getData("accessToken");
    const cacheId = this.state.cacheId
      ? this.state.cacheId
      : await getData("mmPlaylist");

    if (!cacheId) {
      const url = "https://api.spotify.com/v1/users/" + data.id + "/playlists";
      const response = await this.apiPost(url, access);
      await setData("mmPlaylist", response.data.id);
    }

    const url = "https://api.spotify.com/v1/users/" + data.id + "/playlists";
    const response = await this.apiGet(url, access);

    if (response) {
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
                style={{
                  flex: 1,
                  backgroundColor: "black",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 5
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: 10
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: 10
                  }}
                >
                  {item.tracks.total} songs
                </Text>
                <Image
                  style={styles.profileImage}
                  source={{
                    uri: item.images[0]
                      ? item.images[0].url
                      : this.state.userInfo.images[0].url
                  }}
                />
                <TouchableOpacity
                  style={styles.listButton}
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
