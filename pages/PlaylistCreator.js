import React from "react";
import { StyleSheet, TouchableOpacity, Text, View, Switch } from "react-native";
import { StackActions } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

import { styles } from "../Styles.js";
import { Mytext, MytextTwo } from "../components/Mytext.js";
import SongEngine from "../brain/SongEngine.js";
import { getData, setData } from "../brain/LocalStorage.js";

export default class PlaylistCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      creating: false,
      init: false,
      tempo: 0,
      euphoria: 0,
      hype: 0,
      key: 0,
      pop1: 0,
      pop2: 100,
      freq1: 0,
      freq2: 1,
      lookForRelated: false,
      countFilter: false
    };
  }

  toggleSwitch = () => {
    this.setState({ lookForRelated: !this.state.lookForRelated });
  };

  toggleSwitch2 = () => {
    this.setState({ countFilter: !this.state.countFilter });
  };

  activateAlgorithm = async which => {
    const that = this;
    try {
      const triggerRadioLoad = this.props.route.params.triggerRadioLoad;
      const id = await getData("playlistId");
      const token = await getData("accessToken");

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
            extraArtists = radioHistory[radioName].trackLikes;
          }
        }
        const engine = new SongEngine(
          this.state,
          id,
          token,
          seen_songs,
          this.state.countFilter
        );
        const songs = await engine.algorithm(which, extraArtists);
        const tc = engine.getTrackCounts();
        await setData("trackCounts", tc);
        await setData("playlistData", songs);
        await setData("Stats", that.state);
        this.props.navigation.navigate("PlaylistResults");
        this.setState({ creating: false, init: true });
      } else {
        await setData("Stats", that.state);
        this.props.navigation.navigate("PlaylistResults");
      }
    } catch (e) {
      this.setState({ creating: false });
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
          <Mytext
            text={
              "On? | Unique Lower: " +
              this.state.freq1 +
              " Upper: " +
              this.state.freq2
            }
          />
          <Switch
            style={{ marginBottom: 20 }}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch2}
            value={this.state.countFilter}
          />
          <Slider
            style={{ width: 300, height: 30 }}
            minimumValue={0}
            maximumValue={1}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val =>
              this.setState({ freq1: Math.round(val * 100) / 100 })
            }
          />
          <Slider
            style={{ width: 300, height: 30 }}
            minimumValue={0}
            maximumValue={1}
            value={1}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val =>
              this.setState({ freq2: Math.round(val * 100) / 100 })
            }
          />
        </View>
        <View style={localStyles.container}>
          <MytextTwo
            text={
              this.state.euphoria >= 0
                ? "Euphoria: " + Math.round(this.state.euphoria / 10)
                : "Dark: " + Math.round(Math.abs(this.state.euphoria) / 10)
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
                ? "Hype: " + Math.round(this.state.hype / 10)
                : "Chill: " + Math.round(Math.abs(this.state.hype) / 10)
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
          <Mytext
            text={
              "Popularity Lower: " +
              this.state.pop1 +
              " - Upper: " +
              this.state.pop2
            }
          />
          <Slider
            style={{ width: 300, height: 30 }}
            minimumValue={0}
            maximumValue={100}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ pop1: Math.round(val) })}
          />
          <Slider
            style={{ width: 300, height: 30 }}
            minimumValue={0}
            maximumValue={100}
            value={100}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ pop2: Math.round(val) })}
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
          <Mytext text="Expanded Search" />
          <Switch
            style={{ marginBottom: 20 }}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            disabled={this.state.creating ? true : false}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch}
            value={this.state.lookForRelated}
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
