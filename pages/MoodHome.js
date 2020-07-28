import React from "react";
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import { StackActions } from "@react-navigation/native";

import { styles } from "../Styles.js";
import { setData, getData } from "../LocalStorage.js";
import { apiPost, apiGet } from "../APIfunctions.js";

export default class MoodHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      token: null,
      playlists: null,
      radios: null
    };
  }

  activate = async () => {
    const data = this.state.userInfo
      ? this.state.userInfo
      : await getData("userData");
    const access = this.state.access
      ? this.state.access
      : await getData("accessToken");
    const cacheId = this.state.cacheId
      ? this.state.cacheId
      : await getData("mmPlaylist");

    try {
      if (!cacheId) {
        const url =
          "https://api.spotify.com/v1/users/" + data.id + "/playlists";
        const response = await apiPost(url, access);
        await setData("mmPlaylist", response.data.id);
      }

      const url = "https://api.spotify.com/v1/users/" + data.id + "/playlists";
      const response = await apiGet(url, access);

      this.setState({
        playlists: response.data.items,
        radios: null,
        userInfo: data,
        token: access
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
        Alert.alert("Please connect a spotify device");
      }
      console.log(e);
    }
  };

  activateRadio = async () => {
    const data = this.state.userInfo
      ? this.state.userInfo
      : await getData("userData");
    const access = this.state.access
      ? this.state.access
      : await getData("accessToken");
    const cacheId = this.state.cacheId
      ? this.state.cacheId
      : await getData("mmPlaylist");

    try {
      const url = "https://api.spotify.com/v1/users/" + data.id;
      await apiGet(url, access);
      const radioHistory = await getData("AllRadioHistory");
      if (cacheId && radioHistory) {
        const radios = Array.from(Object.keys(radioHistory));
        this.setState({
          radios: radios,
          playlists: null,
          userInfo: data,
          token: access
        });
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
      } else {
        Alert.alert("Please connect a spotify device");
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
        <TouchableOpacity style={styles.button} onPress={this.activate}>
          <Text style={styles.buttonText}>Search Your Playlists</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.activateRadio}>
          <Text style={styles.buttonText}>Search Saved Radio History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            this.props.navigation.dispatch(
              StackActions.replace("HomeScreen")
            )
          }
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>

        {this.state.playlists ? (
          <FlatList
            data={this.state.playlists}
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
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: 10
                  }}
                >
                  {item.tracks.total} songs
                </Text>
                <Image
                  style={styles.profileImage}
                  source={{
                    uri: item.images[0]
                      ? item.images[0].url
                      : this.state.userInfo.images[0].url
                  }}
                />
                <TouchableOpacity
                  style={styles.listButton}
                  onPress={async () => {
                    await setData("playlistId", item.id);
                    this.props.navigation.dispatch(
                      StackActions.replace("PlaylistCreator", {
                        pName: item.name,
                        triggerRadioLoad: false,
                        targetRadio: ''
                      })
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Load</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : null}
        {this.state.radios ? (
          <FlatList
            data={this.state.radios}
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
                  {item.split("||").length >= 1 ? item.split("||")[0] : null}
                </Text>
                <TouchableOpacity
                  style={styles.listButton}
                  onPress={async () => {
                    const arr =
                      item.split("||").length >= 1 ? item.split("||") : null;
                    arr ? await setData("playlistId", arr.pop()) : null;
                    const hist = await getData("AllRadioHistory");
                    this.props.navigation.dispatch(
                      StackActions.replace("PlaylistCreator", {
                        pName: hist[item].pName,
                        triggerRadioLoad: true,
                        targetRadio: item
                      })
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Load</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.listButton}
                  onPress={async () => {
                    const radios = this.state.radios.filter(x =>
                      x != item ? x : null
                    );
                    const hist = await getData("AllRadioHistory");
                    delete hist[item];
                    await setData("AllRadioHistory", hist);
                    this.setState({ radios: radios });
                  }}
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : null}
      </View>
    );
  }
}
