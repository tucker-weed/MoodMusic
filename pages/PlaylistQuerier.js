import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  Keyboard
} from "react-native";
import { StackActions } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

import { Mytext, MytextTwo } from "../components/Mytext.js";
import Mytextinput from "../components/Mytextinput.js";
import { ButtonOne } from "../components/MyButtons.js";
import { getData } from "../brain/LocalStorage.js";
import PlaylistCrawler from "../brain/PlaylistCrawler.js";

export default class PlaylistQuerier extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pop1: 0,
      pop2: 100,
      queries: [],
      pNames: [],
      currentText: "",
      creating: false,
      init: false,
      lookForRelated: false,
      data: null
    };
  }

  navToTrackLoader = () => {
    this.props.navigation.dispatch(
      StackActions.push("QueryTrackLoader", {
        data: this.state.data
      })
    );
  };

  addToQueries = () => {
    Keyboard.dismiss();
    if (this.state.currentText === "") {
      Alert.alert("Invalid Query");
    } else {
      Alert.alert("Added Query: " + this.state.currentText);
      this.state.queries.push(this.state.currentText);
    }
  };

  clearQueries = () => {
    Keyboard.dismiss();
    Alert.alert("Cleared All Queries");
    this.setState({ queries: [] });
  };

  activateAlgorithm = async () => {
    Keyboard.dismiss();
    const that = this;
    if (this.state.queries.length == 0) {
      Alert.alert("No Queries Detected");
      return;
    }

    this.setState({ creating: true });
    try {
      const token = await getData("accessToken");

      const pc = new PlaylistCrawler(that.state.pop1, that.state.pop2, 1);
      const data = await pc.crawlPlaylists(that.state.queries, token);
      this.setState({
        creating: false,
        pNames: Object.values(data["pNames"]),
        data: data
      });
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
      } else {
        Alert.alert("Unknown Error Occurred: Retry Query");
      }
      console.log(e);
      this.setState({ creating: false });
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
            <Mytextinput
              placeholder="Enter Query"
              style={{ padding: 10 }}
              onChangeText={currentText => this.setState({ currentText })}
            />
            <ButtonOne title="Add Query" customClick={this.addToQueries} />
            <ButtonOne title="Clear Queries" customClick={this.clearQueries} />
            <ButtonOne
              title="Activate Search"
              customClick={this.activateAlgorithm}
            />
            <ButtonOne
              title="Back to Home"
              customClick={() => {
                this.props.navigation.dispatch(
                  StackActions.replace("MoodHome")
                );
              }}
            />
          </View>
        )}
        <View style={localStyles.container}>
          <MytextTwo text={"Popularity Lower: " + this.state.pop1} />
          <MytextTwo text={"Popularity Upper: " + this.state.pop2} />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={100}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ pop1: Math.round(val) })}
          />
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={100}
            value={100}
            disabled={this.state.creating ? true : false}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ pop2: Math.round(val) })}
          />
        </View>
        {this.state.data ? (
          <ButtonOne
            title="Track Data Loader"
            customClick={this.navToTrackLoader}
          />
        ) : null}
        {this.state.pNames.length > 0 ? (
          <FlatList
            data={this.state.pNames}
            ItemSeparatorComponent={null}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                key={item}
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
                  {item}
                </Text>
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
    marginTop: 18,
    marginLeft: 35,
    marginRight: 35
  }
});
