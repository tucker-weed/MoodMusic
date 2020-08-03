import React from "react";
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import { StackActions } from "@react-navigation/native";

import { styles } from "../Styles.js";
import { Mytext } from "../components/Mytext.js";
import { getData } from "../brain/LocalStorage.js";
import { apiPutTracks, apiGet } from "../brain/APIfunctions.js";
import TrackFrequencyFilter from "../brain/TrackFrequencyFilter.js";

export default class PlaylistResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playlist: null
    };
  }

  activate = async () => {
    const data = this.props.route.params.data;
    const token = await getData("accessToken");
    const pId = await getData("mmPlaylist");

    try {
      const tff = new TrackFrequencyFilter(data);
      const out = await tff.getTopQueryTracks();
      let songs = Object.keys(out).slice(0, 100);
      const songsUrl1 =
        "https://api.spotify.com/v1/tracks/?ids=" +
        songs.slice(0, 50).join(",") +
        "&market=from_token";
      const response1 = await apiGet(songsUrl1, token);
      const playlist = [];
      playlist.push(...response1.data.tracks);
      if (songs.length > 50) {
        const songsUrl2 =
          "https://api.spotify.com/v1/tracks/?ids=" +
          songs.slice(50, 100).join(",") +
          "&market=from_token";
        const response2 = await apiGet(songsUrl2, token);
        playlist.push(...response2.data.tracks);
      }
      const ids = [];
      for (let i = 0; i < songs.length; i++) {
        ids.push("spotify:track:" + songs[i]);
      }
      await apiPutTracks(
        "https://api.spotify.com/v1/playlists/" + pId + "/tracks",
        token,
        ids
      );
      this.setState({ playlist: playlist });
    } catch (e) {
      const check =
        e["response"] &&
        e["response"]["data"] &&
        e["response"]["data"]["error"] &&
        e["response"]["data"]["error"]["status"];
      if (check && e.response.data.error.status == 401) {
        this.props.navigation.dispatch(
          StackActions.push("SpotifyLogin", {
            routeName: ""
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
          backgroundColor: "black",
          flexDirection: "column"
        }}
      >
        {!this.state.playlist ? (
          <TouchableOpacity style={styles.button} onPress={this.activate}>
            <Text style={styles.buttonText}>Load Result</Text>
          </TouchableOpacity>
        ) : null}

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
