import React from "react";
import { StyleSheet, TouchableOpacity, Text, View, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import Mytext from "../components/Mytext.js";
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
      acousticness: 0.0,
      liveness: 0.0,
      loudness: 0.0,
      danceability: 0.0,
      energy: 0.0,
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
        if (
          trackData.data.audio_features[j].acousticness >
            this.state.acousticness &&
          trackData.data.audio_features[j].loudness > this.state.loudness &&
          trackData.data.audio_features[j].liveness > this.state.liveness &&
          trackData.data.audio_features[j].danceability >
            this.state.danceability &&
          trackData.data.audio_features[j].energy > this.state.energy &&
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
          <Mytext text={"Acousticness: " + this.state.acousticness} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val =>
              this.setState({ acousticness: +val.toFixed(2) })
            }
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Liveness: " + this.state.liveness} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ liveness: +val.toFixed(2) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Loudness: " + this.state.loudness} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={-60}
            maximumValue={0}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ loudness: +val.toFixed(2) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Danceability: " + this.state.danceability} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val =>
              this.setState({ danceability: +val.toFixed(2) })
            }
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Energy " + this.state.energy} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ energy: +val.toFixed(2) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Key " + this.state.key} />
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={this.state.isEnabled ? "#f5dd4b" : "#f4f3f4"}
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
