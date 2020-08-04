import React from "react";
import {
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Image,
  Switch,
  StyleSheet
} from "react-native";
import { StackActions } from "@react-navigation/native";

import { styles } from "../Styles.js";
import { Mytext } from "../components/Mytext.js";
import { getData } from "../brain/LocalStorage.js";
import { apiPutTracks, apiGet, apiPostTracks } from "../brain/APIfunctions.js";
import PlaylistCrawler from "../brain/PlaylistCrawler.js";

export default class PlaylistResults extends React.Component {
  constructor(props) {
    super(props);
    this.topTracks = 350;
    this.state = {
      playlist: null,
      on: false,
      unqiue: false
    };
  }

  toggleSwitch = () => {
    this.setState({ unique: !this.state.unique });
  };

  activate = async () => {
    const data = this.props.route.params.data;
    const { unique } = this.state;
    const token = await getData("accessToken");
    const pId = await getData("mmPlaylist");

    this.setState({ on: true });

    try {
      const tff = new PlaylistCrawler(0, 0, 4);
      tff.loadExistingData(data);
      const out = await tff.getTopQueryTracks(unique);
      let songs = Object.keys(out).slice(0, this.topTracks);
      const songsCopy = Object.keys(out).slice(0, this.topTracks);
      let limit = 50;
      /* ------------------------------------------ */
      // TRACK OBJECT RETRIEVAL
      const songsUrl1 =
        "https://api.spotify.com/v1/tracks/?ids=" +
        songs.slice(0, limit).join(",") +
        "&market=from_token";
      songs = songs.length <= limit ? null : songs.slice(limit, songs.length);
      const response1 = await apiGet(songsUrl1, token);
      const playlist = [];
      playlist.push(...response1.data.tracks);
      while (songs) {
        const cut = songs.slice(0, limit);
        if (songs.length > limit) {
          songs = songs.slice(limit, songs.length);
        } else {
          songs = null;
        }
        const songsUrl2 =
          "https://api.spotify.com/v1/tracks/?ids=" +
          cut.join(",") +
          "&market=from_token";
        const response2 = await apiGet(songsUrl2, token);
        playlist.push(...response2.data.tracks);
      }
      /* ------------------------------------------ */
      // SAVING TRACKS TO mmPLAYLIST
      let ids = [];
      limit = 100;
      for (let i = 0; i < songsCopy.length; i++) {
        ids.push("spotify:track:" + songsCopy[i]);
      }
      await apiPutTracks(
        "https://api.spotify.com/v1/playlists/" + pId + "/tracks",
        token,
        ids.slice(0, limit)
      );
      ids = ids.length <= limit ? null : ids.slice(limit, ids.length);
      while (ids) {
        const cut = ids.slice(0, limit);
        if (ids.length > limit) {
          ids = ids.slice(limit, ids.length);
        } else {
          ids = null;
        }
        await apiPostTracks(
          "https://api.spotify.com/v1/playlists/" + pId + "/tracks",
          token,
          cut,
          limit
        );
      }
      /* ------------------------------------------ */
      this.setState({ playlist: playlist, on: false });
    } catch (e) {
      this.setState({ on: false });
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
        {!this.state.playlist && this.state.on ? (
          <Mytext text={"Loading data..."} />
        ) : null}
        {!this.state.on ? (
          <TouchableOpacity style={styles.button} onPress={this.activate}>
            <Text style={styles.buttonText}>Load Result</Text>
          </TouchableOpacity>
        ) : null}

        {!this.state.on ? (
          <View style={localStyles.container}>
            <Mytext text="Unique Songs" />
            <Switch
              style={{ marginBottom: 20 }}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={this.toggleSwitch}
              value={this.state.unique}
            />
          </View>
        ) : null}

        <Mytext
          text={
            this.state.playlist
              ? this.state.playlist.length + " Songs"
              : this.state.on
              ? ""
              : "Click to see playlist"
          }
        />

        {this.state.playlist && !this.state.on ? (
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

const localStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#2FD566",
    color: "#ffffff",
    padding: 0,
    marginTop: 3,
    marginLeft: 35,
    marginRight: 35
  }
});
