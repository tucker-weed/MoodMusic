import React from "react";
import { StyleSheet, TouchableOpacity, Text, View, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import { Mytext, MytextTwo } from "../components/Mytext.js";
import axios from "axios";

import { styles } from "../Styles.js";
import { setData, getData } from "../LocalStorage.js";

export default class PlaylistCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      token: null,
      playlist: null,
      isEnabled: false,
      tempo: 0.0,
      euphoria: 0.0,
      hype: 0.0,
      key: 0
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
    const token = this.state.token
      ? this.state.token
      : await getData("accessToken");
    const playlistId = this.state.access
      ? this.state.access
      : await getData("playlistId");
    const url =
      "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const response = await this.apiGet(url, token);
    const filteredGet = [];

    if (response) {
      let index = 0;
      let idString = "";

      while (index < response.data.items.length) {
        if (response.data.items.length - index == 1) {
          idString += response.data.items[index].track.id;
        } else {
          idString += response.data.items[index].track.id + ",";
        }
        index++;
      }

      const songsUrl =
        "https://api.spotify.com/v1/audio-features/?ids=" + idString;
      const trackData = await this.apiGet(songsUrl, token);
      let j = 0;

      while (j < trackData.data.audio_features.length) {
        const euphoria =
          trackData.data.audio_features[j].danceability * 100 +
          trackData.data.audio_features[j].valence * 100;
        const hype =
          trackData.data.audio_features[j].tempo * 2 +
          trackData.data.audio_features[j].energy * 150 +
          trackData.data.audio_features[j].acousticness * 75 +
          trackData.data.audio_features[j].danceability * 150;
        if (
          trackData.data.audio_features[j].tempo > this.state.tempo &&
          euphoria > this.state.euphoria &&
          hype > this.state.hype &&
          (!this.state.isEnabled ||
            trackData.data.audio_features[j].key == this.state.key)
        ) {
          filteredGet.push(response.data.items[j]);
        }
        j++;
      }
      await setData("playlistData", filteredGet);
      this.props.navigation.navigate("PlaylistResults");
    } else {
      console.log("ERROR: token expired");
      this.setState({ userInfo: null, token: null, playlist: null });
    }
  };

  toggleSwitch = () => {
    this.setState({ isEnabled: !this.state.isEnabled });
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
          <Text style={styles.buttonText}>Create Playlist</Text>
        </TouchableOpacity>
        <View style={localStyles.container}>
          <MytextTwo text={"Euphoria: " + this.state.euphoria} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={200}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ euphoria: +val.toFixed(2) })}
          />
        </View>
        <View style={localStyles.container}>
          <MytextTwo text={"Hype: " + this.state.hype} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={700}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ hype: +val.toFixed(2) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Tempo: " + this.state.tempo} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={200}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ tempo: +val.toFixed(2) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Key: " + this.state.key} />
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch}
            value={this.state.isEnabled}
          />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={11}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ key: Math.round(val) })}
          />
        </View>
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
    marginTop: 10,
    marginLeft: 35,
    marginRight: 35
  }
});
