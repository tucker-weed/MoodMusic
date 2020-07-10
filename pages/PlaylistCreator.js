import React from "react";
import { StyleSheet, TouchableOpacity, Text, View, Switch } from "react-native";
import { StackActions } from "@react-navigation/native";
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
      sPopularity: 0,
      aPopularity: 0
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

  getRandomInt = max => {
    const min = 0;
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  filterSongs = async (that, response, token, idString) => {
    let filteredGet = [];
    const songsUrl =
      "https://api.spotify.com/v1/audio-features/?ids=" + idString;
    const trackData = await that.apiGet(songsUrl, token);
    let existenceCheck = () => {
      trackData["data"] &&
      trackData.data["audio_features"] &&
      trackData.data.audio_features[j] &&
      trackData.data.audio_features[j]["danceability"]
    }
    let j = 0;

    while (existenceCheck && j < trackData.data.audio_features.length) {
      const features = trackData.data.audio_features;
      const euphoria =
        features[j].danceability * 100 + features[j].valence * 100;
      const hype =
        features[j].tempo * 2 +
        features[j].energy * 150 +
        features[j].acousticness * 75 +
        features[j].danceability * 150;
      if (
        features[j].tempo > that.state.tempo &&
        euphoria > that.state.euphoria &&
        hype > that.state.hype &&
        (!that.state.isEnabled || features[j].key == that.state.key)
      ) {
        if (
          response.data["items"] &&
          response.data.items[j].track.popularity > that.state.sPopularity
        ) {
          filteredGet.push(response.data.items[j]);
        } else if (
          response.data["tracks"] &&
          response.data.tracks[j].popularity > that.state.sPopularity
        ) {
          filteredGet.push(response.data.tracks[j]);
        }
      }
      j++;
      existenceCheck = features[j] && features[j]["danceability"];
    }

    return filteredGet;
  };

  artistsToPlaylist = async (that, artistIds, token) => {
    let filteredGet = [];
    let accumulator = [];
    let addedArtists = {};
    const start = new Date().getTime();

    const getRelated = async (artistIds, stop) => {
      let accum = [];

      for (let a = 0; a < artistIds.length; a++) {
        const url =
          "https://api.spotify.com/v1/artists/" +
          artistIds[a] +
          "/related-artists";
        const response = await that.apiGet(url, token);

        let stopper = 0;
        while (stopper < stop && response.data.artists[0].popularity > that.state.aPopularity) {
          if (response && response.data.artists[0]) {
            const idToAdd =
              response.data.artists[
                that.getRandomInt(response.data.artists.length - 1)
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
      }
      return accum;
    };

    const timeout = deadline => {
      return new Date().getTime() - start >= deadline * 1000;
    };

    const ids = await getRelated(artistIds, 1);
    accumulator.push(...ids);
    let i = 0;

    while (i < accumulator.length && filteredGet.length < 100 && !timeout(30)) {
      const url =
        "https://api.spotify.com/v1/artists/" +
        accumulator[i] +
        "/top-tracks?country=from_token";
      const response = await that.apiGet(url, token);
      const responseTracks = response.data.tracks;
      let idString = "";

      for (let index = 0; index < responseTracks.length; index++) {
        if (responseTracks.length - index == 1) {
          idString += responseTracks[index].id;
        } else {
          idString += responseTracks[index].id + ",";
        }
      }

      const toAdd = await that.filterSongs(that, response, token, idString);
      let p = 0;

      while (p < toAdd.length && filteredGet.length < 100) {
        filteredGet.push(toAdd[p]);
        p++;
      }
      if (
        i == accumulator.length - 1 &&
        filteredGet.length < 100 &&
        !timeout(30)
      ) {
        const ids = await getRelated(accumulator, 1);
        accumulator.push(...ids);
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
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const response = await this.apiGet(url, token);
    const items = response.data.items;
    let addedArtists = {};
    let artistIds = [];
    this.setState({ creating: true });

    for (let s = 0; s < items.length; s++) {
      if (items[s].track.artists[0]) {
        const idToAdd = items[s].track.artists[0].id;
        if (!addedArtists[idToAdd]) {
          artistIds.push(idToAdd);
          addedArtists[idToAdd] = true;
        }
      }
    }

    const filteredGet = await that.artistsToPlaylist(that, artistIds, token);
    await setData("playlistData", filteredGet);
    that.props.navigation.navigate("PlaylistResults");
    this.setState({ creating: false });
  };

  activateFilter = async () => {
    const that = this;
    const token = this.state.token
      ? this.state.token
      : await getData("accessToken");
    const playlistId = await getData("playlistId");
    const url =
      "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const response = await this.apiGet(url, token);
    const items = response.data.items;
    let idString = "";
    this.setState({ creating: true });

    for (let index = 0; index < items.length; index++) {
      const responseTwo = await this.apiGet(items[index].track.artists[0].href, token);
      if (responseTwo.data.popularity > that.state.aPopularity) {
        if (items.length - index == 1) {
          idString += items[index].track.id;
        } else {
          idString += items[index].track.id + ",";
        }
      }
    }
    const filteredGet = await that.filterSongs(that, response, token, idString);

    await setData("playlistData", filteredGet);
    that.props.navigation.navigate("PlaylistResults");
    this.setState({ creating: false });
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
        {this.state.creating ? (
          <Mytext text={"Creating Playlist..."} />
        ) : (
          <View>
            <TouchableOpacity
              style={styles.skinnyButton}
              onPress={this.activateFilter}
            >
              <Text style={styles.buttonText}>Filter Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skinnyButton}
              onPress={this.activateCreate}
            >
              <Text style={styles.buttonText}>Spawn Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skinnyButton}
              onPress={() =>
                this.props.navigation.dispatch(StackActions.replace("MoodHome"))
              }
            >
              <Text style={styles.buttonText}>Back to User Playlists</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={localStyles.container}>
          <MytextTwo text={"Euphoria: " + this.state.euphoria} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={200}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ euphoria: Math.round(val) })}
          />
        </View>
        <View style={localStyles.container}>
          <MytextTwo text={"Hype: " + this.state.hype} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={700}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ hype: Math.round(val) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Song Popularity: " + this.state.sPopularity} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={100}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val =>
              this.setState({ sPopularity: Math.round(val) })
            }
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Artist Popularity: " + this.state.aPopularity} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={100}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val =>
              this.setState({ aPopularity: Math.round(val) })
            }
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Tempo: " + this.state.tempo} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={200}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ tempo: Math.round(val) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Key: " + this.state.key} />
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            disabled={this.state.creating ? true : false}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch}
            value={this.state.isEnabled}
          />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={11}
            disabled={this.state.creating ? true : false}
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
    marginTop: 3,
    marginLeft: 35,
    marginRight: 35
  }
});
