import React from "react";
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
    if (which !== "returning") {
      this.setState({ creating: true });
      await setData("Stats", this.state);
      const id = await getData("playlistId");
      const token = await getData("accessToken");
      const songs = await new SongEngine(this.state, id, token).algorithm(
        which,
        null
      );
      await setData("playlistData", songs);
      await setData("returning", that.state.init);
      this.props.navigation.navigate("PlaylistResults");
      this.setState({ creating: false, init: true });
    } else {
      await setData("Stats", that.state);
      await setData("returning", that.state.init);
      this.props.navigation.navigate("PlaylistResults");
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
                onPress={() => this.activateAlgorithm("returning")}
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

        <View style={localStyles.container}>
          <MytextTwo text={"Euphoria: " + this.state.euphoria} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={-275}
            maximumValue={275}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ euphoria: Math.round(val) })}
          />
        </View>
        <View style={localStyles.container}>
          <MytextTwo text={"Energy: " + this.state.hype} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={-875}
            maximumValue={875}
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
