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
      creating: false,
      tempo: 0.0,
      euphoria: 0.0,
      hype: 0.0,
      key: 0,
      popularity: 0
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

  filterSongs = async (response, token, idString) => {
    let filteredGet = [];
    const songsUrl =
      "https://api.spotify.com/v1/audio-features/?ids=" + idString;
    const trackData = await this.apiGet(songsUrl, token);
    let j = 0;
    const existenceCheck =
      trackData["data"] &&
      trackData.data["audio_features"] &&
      trackData.data.audio_features[j] &&
      trackData.data.audio_features[j]["danceability"];
    while (existenceCheck && j < trackData.data.audio_features.length) {
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
        if (response.data["items"] && response.data.items[j].track.popularity > this.state.popularity) {
          filteredGet.push(response.data.items[j]);
        } else if (!response.data["items"] && response.data.tracks[j].popularity > this.state.popularity) {
          filteredGet.push(response.data.tracks[j]);
        }
      }
      j++;
    }
    return filteredGet;
  };

  getRandomInt = max => {
    const min = 0;
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  createPlaylist = async (that, artistIds, token) => {
    let filteredGet = [];
    let accumulator = [];
    let addedArtists = {};
    const start = new Date().getTime();

    const getRelated = async (artistIds, stop) => {
      let accum = [];
      let a = 0;

      while (a < artistIds.length) {
        const relatedUrl =
          "https://api.spotify.com/v1/artists/" +
          artistIds[a] +
          "/related-artists";
        const relatedR = await that.apiGet(relatedUrl, token);
        let stopper = 0;
        while (stopper < stop) {
          if (relatedR && relatedR.data.artists[0]) {
            const idToAdd =
              relatedR.data.artists[
                that.getRandomInt(relatedR.data.artists.length - 1)
              ].id;
            if (addedArtists[idToAdd]) {
              stopper--;
            } else {
              accum.push(idToAdd);
              addedArtists[idToAdd] = true;
            }
          }
          stopper++;
        }
        a++;
      }
      return accum;
    };

    const ids = await getRelated(artistIds, 1);
    accumulator.push(...ids);
    let i = 0;

    while (i < accumulator.length && filteredGet.length < 100 && new Date().getTime() - start < 30000) {
      const url =
        "https://api.spotify.com/v1/artists/" +
        accumulator[i] +
        "/top-tracks?country=from_token";
      const newResponse = await that.apiGet(url, token);
      if (newResponse) {
        let index = 0;
        let idString = "";
        while (index < newResponse.data.tracks.length) {
          if (newResponse.data.tracks.length - index == 1) {
            idString += newResponse.data.tracks[index].id;
          } else {
            idString += newResponse.data.tracks[index].id + ",";
          }
          index++;
        }
        const toAdd = await that.filterSongs(newResponse, token, idString);
        let p = 0;
        while (p < toAdd.length && filteredGet.length < 100) {
          filteredGet.push(toAdd[p]);
          p++;
        }
      }

      if (i == accumulator.length - 1 && filteredGet.length < 100 && new Date().getTime() - start < 30000) {
        const ids = await getRelated(accumulator, 1);
        let m = 0;
        while (m < ids.length) {
          accumulator.push(ids[m]);
          m++;
        }
      }

      i++;
    }
    return filteredGet;
  };

  activateCreate = async () => {
    const that = this;
    const token = this.state.token
      ? this.state.token
      : await getData("accessToken");
    const playlistId = await getData("playlistId");
    const url =
      "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const response = await this.apiGet(url, token);

    this.setState({ creating: true });
    
    if (response) {
      let stopper = 0;
      let addedArtists = {};
      let artistIds = [];
      while (stopper < response.data.items.length) {
        if (response.data.items[stopper].track.artists[0]) {
          const idToAdd = response.data.items[stopper].track.artists[0].id;
          if (!addedArtists[idToAdd]) {
            artistIds.push(idToAdd);
            addedArtists[idToAdd] = true;
          }
        }
        stopper++;
      }
      const filteredGet = await that.createPlaylist(that, artistIds, token);
      await setData("playlistData", filteredGet);
      this.setState({ creating: false });
      that.props.navigation.navigate("PlaylistResults");
    } else {
      console.log("ERROR: token expired");
      that.setState({ userInfo: null, token: null, playlist: null });
    }
  };

  activateFilter = async () => {
    const token = this.state.token
      ? this.state.token
      : await getData("accessToken");
    const playlistId = await getData("playlistId");
    const url =
      "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const response = await this.apiGet(url, token);

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
      const filteredGet = await this.filterSongs(response, token, idString);
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
        <TouchableOpacity style={styles.button} onPress={this.activateFilter}>
          <Text style={styles.buttonText}>Filter Playlist</Text>
        </TouchableOpacity>

        {this.state.creating
        ? <Mytext text={"Creating Playlist..."} />
        : <TouchableOpacity style={styles.button} onPress={this.activateCreate}>
            <Text style={styles.buttonText}>Spawn Playlist</Text>
          </TouchableOpacity>}

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
          <Mytext text={"Popularity " + this.state.popularity} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ popularity: Math.round(val) })}
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

