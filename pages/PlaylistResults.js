import React from "react";
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import axios from "axios";

import { styles } from "../Styles.js";
import { getData } from "../LocalStorage.js";
import { Mytext } from "../components/Mytext.js";

export default class PlaylistResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      token: null,
      playlist: null
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

  apiPut = async (url, token, trackIds) => {
    const jsonData = {
      uris: trackIds
    };
    return await axios.put(
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
    const data = await getData("userData");
    const token = await getData("accessToken");
    const playlist = await getData("playlistData");
    const playlistId = await getData("mmPlaylist");

    if (playlistId) {
      const url =
        "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
      const ids = [];
      let i = 0;
      while (i < playlist.length) {
        ids.push(
          "spotify:track:" +
            (playlist[i]["track"] ? playlist[i].track.id : playlist[i].id)
        );
        i++;
      }
      await this.apiPut(url, token, ids);
    }
    this.setState({ userInfo: data, token: token, playlist: playlist });
  };

  nav = () => {
    this.props.navigation.navigate("SongPlayer");
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
        {this.state.playlist ? (
          <TouchableOpacity style={styles.button} onPress={this.nav}>
            <Text style={styles.whiteText}>View Track Player</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={this.activate}>
            <Text style={styles.buttonText}>Load Result</Text>
          </TouchableOpacity>
        )}

        <Mytext
          text={
            this.state.playlist
              ? this.state.playlist.length + " Songs"
              : "Click to see playlist"
          }
        />

        {this.state.playlist ? (
          <FlatList
            data={this.state.playlist}
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
                  {item["track"] ? item.track.name : item.name}
                </Text>
                {item["track"] ? (
                  <Image
                    style={styles.profileImage}
                    source={
                      item.track.album.images[0]
                        ? { uri: item.track.album.images[0].url }
                        : { uri: this.state.userInfo.images[0].url }
                    }
                  />
                ) : (
                  <Image
                    style={styles.profileImage}
                    source={
                      item.album.images[0]
                        ? { uri: item.album.images[0].url }
                        : { uri: this.state.userInfo.images[0].url }
                    }
                  />
                )}
              </View>
            )}
          />
        ) : null}
      </View>
    );
  }
}
