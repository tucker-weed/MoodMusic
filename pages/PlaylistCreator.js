import React from "react";
import axios from "axios";
import { StyleSheet, TouchableOpacity, Text, View, Switch } from "react-native";
import { StackActions } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

import { Mytext, MytextTwo } from "../components/Mytext.js";
import SongEngine from "../SongEngine.js";
import { getData, setData } from "../LocalStorage.js";
import { styles } from "../Styles.js";

export default class PlaylistCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnabled: false,
      isEnabled2: false,
      majMin: 0,
      creating: false,
      init: false,
      tempo: 0,
      euphoria: 0,
      hype: 0,
      key: 0,
      sPopularity: 0
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

  toggleSwitch = () => {
    this.setState({ isEnabled: !this.state.isEnabled });
  };

  toggleSwitch2 = () => {
    this.setState({ majMin: this.state.majMin == 0 ? 1 : 0 });
  };

  toggleSwitch3 = () => {
    this.setState({ isEnabled2: !this.state.isEnabled2 });
  };

  activateAlgorithm = async which => {
    const that = this;
    try {
      const token = await getData("accessToken");
      const triggerRadioLoad = this.props.route.params.triggerRadioLoad;
      const id = await getData("playlistId");

      if (which !== "ignoreAlgorithm") {
        this.setState({ creating: true });
        let seen_songs = {};
        let extraArtists = [];
        if (!that.state.init && !triggerRadioLoad) {
          await setData("radioTracks", []);
          await setData("radioArtists", []);
          await setData("seenTracks", {});
        } else if (that.state.init) {
          seen_songs = await getData("seenTracks");
          extraArtists = await getData("radioArtists");
        } else {
          const radioHistory = await getData("AllRadioHistory");
          const radioName = this.props.route.params.targetRadio;
          if (radioHistory && radioName) {
            await setData("radioTracks", radioHistory[radioName].trackLikes);
            await setData("radioArtists", radioHistory[radioName].artistLikes);
            await setData("seenTracks", radioHistory[radioName].seenTracks);
            seen_songs = radioHistory[radioName].seenTracks;
            extraArtists = radioHistory[radioName].artistLikes;
          }
        }
        const songs = await new SongEngine(
          this.state,
          id,
          token,
          seen_songs
        ).algorithm(which, extraArtists);
        await setData("playlistData", songs);
        await setData("Stats", that.state);
        this.props.navigation.navigate("PlaylistResults");
        this.setState({ creating: false, init: true });
      } else {
        await setData("Stats", that.state);
        this.props.navigation.navigate("PlaylistResults");
      }
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
        {this.state.creating ? (
          <Mytext text={"Creating Playlist..."} />
        ) : (
          <View>
            <TouchableOpacity
              style={styles.skinnyButton}
              onPress={() => this.activateAlgorithm("filter")}
            >
              <Text style={styles.buttonText}>Filter Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skinnyButton}
              onPress={() => this.activateAlgorithm("create")}
            >
              <Text style={styles.buttonText}>Spawn Playlist</Text>
            </TouchableOpacity>
            {this.state.init ? (
              <TouchableOpacity
                style={styles.skinnyButton}
                onPress={() => this.activateAlgorithm("ignoreAlgorithm")}
              >
                <Text style={styles.buttonText}>
                  Return to Current Playlist
                </Text>
              </TouchableOpacity>
            ) : null}
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
        <Mytext text={"Seed Playlist: " + this.props.route.params.pName} />
        <View style={localStyles.container}>
          <MytextTwo
            text={
              this.state.euphoria >= 0
                ? "Euphoria: " + this.state.euphoria
                : "Dark: " + Math.abs(this.state.euphoria)
            }
          />
          <Slider
            style={{ width: 300, height: 20 }}
            minimumValue={-100}
            maximumValue={100}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ euphoria: Math.round(val) })}
          />
        </View>
        <View style={localStyles.container}>
          <MytextTwo
            text={
              this.state.hype >= 0
                ? "Hype: " + this.state.hype
                : "Chill: " + Math.abs(this.state.hype)
            }
          />
          <Slider
            style={{ width: 300, height: 20 }}
            minimumValue={-200}
            maximumValue={200}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ hype: Math.round(val) })}
          />
        </View>
        <View style={localStyles.container}>
          <Mytext text={"Song Popularity: " + this.state.sPopularity} />
          <Slider
            style={{ width: 300, height: 20 }}
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
          <Mytext text={"Tempo: " + this.state.tempo} />
          <Slider
            style={{ width: 300, height: 20 }}
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
          <Mytext text={"Key Switch - Major/Minor - Key Slider"} />
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            disabled={this.state.creating ? true : false}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch3}
            value={this.state.isEnabled2}
          />
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            disabled={this.state.creating ? true : false}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch2}
            value={this.state.majMin == 0 ? false : true}
          />
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            disabled={this.state.creating ? true : false}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch}
            value={this.state.isEnabled}
          />
          <Slider
            style={{ width: 300, height: 20 }}
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
