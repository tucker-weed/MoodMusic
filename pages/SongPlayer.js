import React from "react";
import {
  View,
  Image,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Switch
} from "react-native";
import Slider from "@react-native-community/slider";
import { StackActions } from "@react-navigation/native";

import { styles } from "../Styles.js";
import { ButtonOne } from "../components/MyButtons.js";
import Mytextinput from "../components/Mytextinput.js";
import { PlayerButton } from "../components/MyButtons.js";
import { Mytext } from "../components/Mytext.js";
import { setData, getData } from "../brain/LocalStorage.js";
import { apiPutTracks, apiPut } from "../brain/APIfunctions.js";
import SongEngine from "../brain/SongEngine.js";
import PlayerController from "../brain/PlayerController.js";

export default class SongPlayer extends React.Component {
  constructor(props) {
    super(props);
    (this.initSeen = false),
      (this.state = {
        navigated: false,
        playing: false,
        current: null,
        playlist: null,
        reload: false,
        init: false,
        playlistName: "",
        songName: null,
        likes: 0,
        artistPlaying: null,
        trackPlaying: null,
        artistLikes: [],
        trackLikes: [],
        seenTracks: {},
        trackDuration: 1000,
        tPos: 0,
        shuffle: false
      });
  }

  parseError = err => {
    console.log(err);
    const check =
      err["response"] &&
      err["response"]["data"] &&
      err["response"]["data"]["error"] &&
      err["response"]["data"]["error"]["status"];
    if (check && err.response.data.error.status == 401) {
      this.props.navigation.dispatch(
        StackActions.push("SpotifyLogin", {
          routeName: ""
        })
      );
    } else if (check && err.response.data.error.status == 404) {
      Alert.alert("Please connect a spotify device");
    }
  };

  saveRadioState = async () => {
    Keyboard.dismiss();
    const radioHist = await getData("AllRadioHistory");
    const playlistId = await getData("playlistId");
    const token = await getData("accessToken");
    const controller = new PlayerController(this.initSeen, this.state, token);
    try {
      const newHist = await controller.updateRadioHistory(
        radioHist,
        playlistId
      );
      Alert.alert("Saved Radio History: " + this.state.playlistName);
      await setData("AllRadioHistory", newHist);
    } catch (e) {
      this.parseError(e);
    }
  };

  toggleSwitch = async () => {
    const token = await getData("accessToken");
    const controller = new PlayerController(this.initSeen, this.state, token);
    try {
      await controller.toggleShuffle();
    } catch (e) {
      this.parseError(e);
    }
    this.setState({ shuffle: !this.state.shuffle });
  };

  createNewPlaylist = async () => {
    Keyboard.dismiss();
    const token = await getData("accessToken");
    const userId = await getData("userId");
    const controller = new PlayerController(this.initSeen, this.state, token);
    try {
      await controller.createPlaylist(userId);
      Alert.alert("Created Playlist: " + this.state.playlistName);
    } catch (e) {
      this.parseError(e);
    }
  };

  activateNext = async () => {
    const token = await getData("accessToken");
    const controller = new PlayerController(this.initSeen, this.state, token);
    try {
      if (this.state.songName) {
        const savedSeen = await getData("seenTracks");
        const { trackData, seen } = await controller.next(savedSeen);
        this.initSeen = true;
        await setData("seenTracks", seen);
        this.setState({
          playing: true,
          current: trackData["current"],
          songName: trackData["songName"],
          artistPlaying: trackData["artistPlaying"],
          trackPlaying: trackData["trackPlaying"],
          trackDuration: trackData["trackDuration"],
          seenTracks: seen,
          tPos: 0
        });
      }
    } catch (e) {
      this.parseError(e);
    }
  };

  activateBack = async () => {
    const token = await getData("accessToken");
    const controller = new PlayerController(this.initSeen, this.state, token);
    try {
      if (this.state.songName) {
        const savedSeen = await getData("seenTracks");
        const { trackData, seen } = await controller.back(savedSeen);
        this.initSeen = true;
        await setData("seenTracks", seen);
        this.setState({
          playing: true,
          current: trackData["current"],
          songName: trackData["songName"],
          artistPlaying: trackData["artistPlaying"],
          trackPlaying: trackData["trackPlaying"],
          trackDuration: trackData["trackDuration"],
          seenTracks: seen,
          tPos: 0
        });
      }
    } catch (e) {
      this.parseError(e);
    }
  };

  activateLoadTracks = async () => {
    const token = await getData("accessToken");
    const radioA = await getData("radioArtists");
    const radioT = await getData("radioTracks");
    const controller = new PlayerController(this.initSeen, this.state, token);
    try {
      const { songs, trackLikes, artistLikes } = await controller.load(
        radioA,
        radioT
      );
      this.setState({
        playlist: songs,
        trackLikes: trackLikes,
        artistLikes: artistLikes,
        init: true
      });
    } catch (e) {
      this.parseError(e);
    }
  };

  activatePlay = async () => {
    const token = await getData("accessToken");
    const id = await getData("mmPlaylist");
    const controller = new PlayerController(this.initSeen, this.state, token);
    Keyboard.dismiss();
    try {
      const seenTracks = await getData("seenTracks");
      const { trackData, seen } = await controller.play(id, seenTracks);
      this.initSeen = true;
      await setData("seenTracks", seen);
      this.setState({
        navigated: true,
        playing: true,
        current: trackData["current"],
        songName: trackData["songName"],
        artistPlaying: trackData["artistPlaying"],
        trackPlaying: trackData["trackPlaying"],
        trackDuration: trackData["trackDuration"],
        seenTracks: seen,
        tPos: trackData["tPos"]
      });
    } catch (e) {
      this.parseError(e);
    }
  };

  activatePause = async () => {
    const token = await getData("accessToken");
    const seenTracks = await getData("seenTracks");
    const controller = new PlayerController(this.initSeen, this.state, token);
    Keyboard.dismiss();
    try {
      const { trackData, seen } = await controller.pause(seenTracks);
      this.initSeen = true;
      await setData("seenTracks", seen);
      this.setState({
        playing: false,
        current: trackData["current"],
        songName: trackData["songName"],
        artistPlaying: trackData["artistPlaying"],
        trackPlaying: trackData["trackPlaying"],
        trackDuration: trackData["trackDuration"],
        seenTracks: seen,
        tPos: trackData["tPos"]
      });
    } catch (e) {
      this.parseError(e);
    }
  };

  like = async () => {
    const trackLikes = !this.state.init
      ? await getData("radioTracks")
      : this.state.trackLikes;
    const artistLikes = !this.state.init
      ? await getData("radioArtists")
      : this.state.artistLikes;
    try {
      if (this.state.artistPlaying && this.state.likes >= 4) {
        const replace = artistLikes;
        replace.unshift(this.state.artistPlaying);
        const replaceTracks = trackLikes;
        if (replaceTracks.length < 100) {
          replaceTracks.push(this.state.trackPlaying);
        } else {
          console.log("Playlist at capacity (100)");
        }
        const playlistId = await getData("playlistId");
        const mmId = await getData("mmPlaylist");
        const token = await getData("accessToken");
        const stats = await getData("Stats");
        const url = "https://api.spotify.com/v1/playlists/" + mmId + "/tracks";
        const ids = [];
        const playlist = await new SongEngine(
          stats,
          playlistId,
          token,
          this.state.seenTracks
        ).algorithm("create", replace);

        for (let i = 0; i < playlist.length; i++) {
          ids.push(
            "spotify:track:" +
              (playlist[i]["track"] ? playlist[i].track.id : playlist[i].id)
          );
        }
        await setData("playlistData", playlist);
        await setData("radioTracks", replaceTracks);
        await setData("radioArtists", replace);
        await apiPutTracks(url, token, ids);
        Alert.alert("Upvoted Song - Updating Seed...");
        this.setState({
          trackLikes: replaceTracks,
          artistLikes: replace,
          likes: 0,
          playlist: null,
          init: true
        });
      } else if (this.state.artistPlaying) {
        Alert.alert("Upvoted Song");
        const replace = artistLikes;
        replace.unshift(this.state.artistPlaying);
        const replaceTracks = trackLikes;
        if (replaceTracks.length < 100) {
          replaceTracks.push(this.state.trackPlaying);
        } else {
          console.log("Playlist at capacity (100)");
        }
        await setData("radioTracks", replaceTracks);
        await setData("radioArtists", replace);
        this.setState({
          trackLikes: replaceTracks,
          artistLikes: replace,
          likes: this.state.likes + 1,
          playlist: null,
          init: true
        });
      }
    } catch (e) {
      this.parseError(e);
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
        <Mytextinput
          placeholder="Enter Name"
          style={{ padding: 10 }}
          onChangeText={playlistName => this.setState({ playlistName })}
        />
        <ButtonOne
          title="Create Playlist"
          customClick={this.createNewPlaylist}
        />
        <ButtonOne
          title="Save Radio History"
          customClick={this.saveRadioState}
        />
        <ButtonOne title="LIKE" customClick={this.like} />
        <View
          style={{
            flex: 0.1,
            backgroundColor: "black",
            flexDirection: "row"
          }}
        >
          <PlayerButton title="<<" customClick={this.activateBack} />
          <PlayerButton
            title={this.state.playing ? "||" : ">"}
            customClick={
              this.state.playing ? this.activatePause : this.activatePlay
            }
          />
          <PlayerButton title=">>" customClick={this.activateNext} />
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {this.state.current ? (
            <Image
              style={{
                height: 100,
                width: 100,
                marginBottom: 10,
                marginTop: 40
              }}
              source={
                this.state.current ? { uri: this.state.current } : { uri: "" }
              }
            />
          ) : null}
          <Mytext text={this.state.songName ? this.state.songName : ""} />
          <View style={localStyles.container}>
            <Mytext text={"Shuffle & Progress"} />
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor="#f4f3f4"
              disabled={this.state.trackPlaying ? false : true}
              ios_backgroundColor="#3e3e3e"
              onValueChange={this.toggleSwitch}
              value={this.state.shuffle}
            />
            <Slider
              style={{ width: 320, height: 40 }}
              minimumValue={0}
              value={this.state.tPos ? Math.round(this.state.tPos / 1000) : 0}
              maximumValue={
                Math.round(this.state.trackDuration / 1000) > 0
                  ? Math.round(this.state.trackDuration / 1000)
                  : 1000
              }
              disabled={this.state.trackPlaying ? false : true}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              onValueChange={val =>
                this.setState({ tPos: Math.round(val * 1000) })
              }
              onSlidingComplete={async val => {
                if (this.state.trackPlaying) {
                  const token = await getData("accessToken");
                  const url =
                    "https://api.spotify.com/v1/me/player/seek?position_ms=" +
                    Math.round(val * 1000);
                  await apiPut(url, token);
                }
              }}
            />
          </View>
          {this.state.playlist ? (
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                marginBottom: 10
              }}
            >
              {this.state.trackLikes.length} songs
            </Text>
          ) : null}
          {this.state.playlist ? (
            <FlatList
              data={this.state.playlist}
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
                  <Image
                    style={styles.profileImage}
                    source={{
                      uri: item.album.images[0]
                        ? item.album.images[0].url
                        : this.state.userInfo.images[0].url
                    }}
                  />
                  <TouchableOpacity
                    style={styles.listButton}
                    onPress={async () => {
                      const resetTrack = this.state.trackLikes.filter(x =>
                        x != item.id ? x : null
                      );
                      const resetPlay = this.state.playlist.filter(x =>
                        x.id != item.id ? x : null
                      );
                      await setData("radioTracks", resetTrack);
                      this.setState({
                        trackLikes: resetTrack,
                        playlist: resetPlay
                      });
                    }}
                  >
                    <Text style={styles.buttonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <ButtonOne
              title="Load Liked Tracks"
              customClick={this.activateLoadTracks}
            />
          )}
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
