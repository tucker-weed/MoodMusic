import React from "react";
import { StyleSheet, TouchableOpacity, Text, View, Switch } from "react-native";
import { StackActions } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

import { Mytext, MytextTwo } from "../components/Mytext.js";
import SongEngine from "../SongEngine.js";
import { setData } from "../LocalStorage.js";
import { styles } from "../Styles.js";

export default class PlaylistCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      token: null,
      playlist: null,
      isEnabled: false,
      lookArtists: false,
      creating: false,
      tempo: 0,
      euphoria: 0,
      hype: 0,
      key: 0,
      sPopularity: 0,
      aPopularity: 0
    };
  }

  toggleSwitch = () => {
    this.setState({ isEnabled: !this.state.isEnabled });
  };

  toggleSwitch2 = () => {
    this.setState({ lookArtists: !this.state.lookArtists });
  };

  activateAlgorithm = async which => {
    const that = this;
    this.setState({ creating: true });
    await setData("Stats", this.state);
    const songs = await new SongEngine(this.state).algorithm(which, "artists");
    await setData("playlistData", songs);
    that.props.navigation.navigate("PlaylistResults");
    this.setState({ creating: false });
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
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor="#f4f3f4"
            disabled={this.state.creating ? true : false}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch2}
            value={this.state.lookArtists}
          />
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
