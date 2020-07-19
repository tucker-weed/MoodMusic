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
import { ButtonOne } from "../components/MyButtons.js";
import { styles } from "../Styles.js";
import axios from "axios";
import { setData, getData } from "../LocalStorage.js";
import Mytextinput from "../components/Mytextinput.js";
import { PlayerButton } from "../components/MyButtons.js";
import { Mytext } from "../components/Mytext.js";
import SongEngine from "../SongEngine.js";

export default class SongPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navigated: false,
      playing: false,
      current: null,
      playlist: null,
      reload: false,
      init: false,
      playlistName: "",
      likes: 0,
      artistPlaying: null,
      trackPlaying: null,
      artistLikes: [],
      trackLikes: [],
      trackDuration: 1000,
      tPos: 0,
      shuffle: false
    };
  }


  /**
   * Requests information based on url and gives a response
   *
   * @param url - the url of the spotify api with a given endpoint
   * @returns - a json object being the api response, or an error
   */
  _apiGet = async (url, token) => {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  apiPut = async (url, token, trackIds) => {
    const jsonData = {
      uris: trackIds
    };
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiGetTrackImage = async token => {
    let img = ["", "", "", "", ""];
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (
      response &&
      response.data["item"] &&
      response.data.item["album"] &&
      response.data.item.album.images[0]
    ) {
      img[0] = response.data.item.album.images[0].url;
      img[1] = response.data.item.name;
      img[2] = response.data.item.album.artists[0].id;
      img[3] = response.data.item.id;
      img[4] = response.data.item.duration_ms;
      img[5] = response.data.progress_ms;
    }
    return img;
  };

  apiGetContextUri = async token => {
    let uri = "";
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response && response.data["context"]) {
      uri = response.data.context.uri;
    }
    return uri;
  };

  apiPost = async (url, token) => {
    await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  };

  apiPutNew = async (url, token, name) => {
    const jsonData = {
      name: name,
      public: true
    };
    return await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiPutTracks = async (url, token, trackIds) => {
    const jsonData = {
      uris: trackIds
    };
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiPutNav = async (url, token, id) => {
    const jsonData = {
      context_uri: "spotify:user:12168726728:playlist:" + id
    };
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          Accept: "application/json"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiPutRegular = async (url, token) => {
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  };

  toggleSwitch = async () => {
    const url =
      "https://api.spotify.com/v1/me/player/shuffle?state=" +
      !this.state.shuffle;
    const token = await getData("accessToken");
    try {
      await this.apiPutRegular(url, token);
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
      } else {
        Alert.alert("Please connect a spotify device");
      }
      console.log(e);
    }
    this.setState({ shuffle: !this.state.shuffle });
  };

  createNewPlaylist = async () => {
    Keyboard.dismiss();
    const name = this.state.playlistName;
    const token = await getData("accessToken");
    const userId = await getData("userId");
    const playlistUrl =
      "https://api.spotify.com/v1/users/" + userId + "/playlists";
    try {
      const response = await this.apiPutNew(playlistUrl, token, name);
      Alert.alert("Created Playlist: " + name);
      const trackUrl =
        "https://api.spotify.com/v1/playlists/" + response.data.id + "/tracks";
      const uriList = [];
      for (let i = 0; i < this.state.trackLikes.length; i++) {
        uriList.push("spotify:track:" + this.state.trackLikes[i]);
      }
      await this.apiPut(trackUrl, token, uriList);
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
      } else {
        Alert.alert("Please connect a spotify device");
      }
      console.log(e);
    }
  };

  like = async () => {
    const trackLikes =
      !this.state.init && (await getData("returning"))
        ? await getData("radioTracks")
        : this.state.trackLikes;
    const artistLikes =
      !this.state.init && (await getData("returning"))
        ? await getData("radioArtists")
        : this.state.artistLikes;
    try {
      if (this.state.artistPlaying && this.state.likes >= 4) {
        Alert.alert("Upvoted Song - Updating Seed...");
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
        const playlist = await new SongEngine(stats, playlistId, token).algorithm(
          "create",
          replace
        );
        const url = "https://api.spotify.com/v1/playlists/" + mmId + "/tracks";
        const ids = [];

        for (let i = 0; i < playlist.length; i++) {
          ids.push(
            "spotify:track:" +
              (playlist[i]["track"] ? playlist[i].track.id : playlist[i].id)
          );
        }
        await setData("playlistData", playlist);
        await setData("radioTracks", replaceTracks);
        await setData("radioArtists", replace);
        await this.apiPut(url, token, ids);
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
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
      } else {
        Alert.alert("Please connect a spotify device");
      }
      console.log(e);
    }
  };

  activateNext = async () => {
    const token = await getData("accessToken");
    try {
      await this.apiPost("https://api.spotify.com/v1/me/player/next", token);
      let urlTracker = this.state.current;
      let trackimg;
      while (urlTracker === this.state.current) {
        trackimg = await this.apiGetTrackImage(token);
        urlTracker = trackimg[0];
      }
      this.setState({
        playing: true,
        current: trackimg[0],
        songName: trackimg[1],
        artistPlaying: trackimg[2],
        trackPlaying: trackimg[3],
        trackDuration: trackimg[4],
        tPos: 0
      });
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
      } else {
        Alert.alert("Please connect a spotify device");
      }
      console.log(e);
    }
  };

  activateBack = async () => {
    const token = await getData("accessToken");
    try {
      await this.apiPost(
        "https://api.spotify.com/v1/me/player/previous",
        token
      );
      let urlTracker = this.state.current;
      let trackimg;
      while (urlTracker === this.state.current) {
        trackimg = await this.apiGetTrackImage(token);
        urlTracker = trackimg[0];
      }
      this.setState({
        playing: true,
        current: trackimg[0],
        songName: trackimg[1],
        artistPlaying: trackimg[2],
        trackPlaying: trackimg[3],
        trackDuration: trackimg[4],
        tPos: 0
      });
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
      } else {
        Alert.alert("Please connect a spotify device");
      }
      console.log(e);
    }
  };

  activateLoadTracks = async () => {
    const token = await getData("accessToken");
    const trackLikes =
      !this.state.init && (await getData("returning"))
        ? await getData("radioTracks")
        : this.state.trackLikes;
    const artistLikes =
      !this.state.init && (await getData("returning"))
        ? await getData("radioArtists")
        : this.state.artistLikes;
    if (trackLikes.length == 0) {
      return;
    }
    const songsUrl1 =
      "https://api.spotify.com/v1/tracks/?ids=" +
      trackLikes.slice(0, 50).join(",") +
      "&market=from_token";
    try {
      const response1 = await this._apiGet(songsUrl1, token);
      const songs = [];
      songs.push(...response1.data.tracks);
      if (trackLikes.length > 50) {
        const songsUrl2 =
          "https://api.spotify.com/v1/tracks/?ids=" +
          trackLikes.slice(50, 100).join(",") +
          "&market=from_token";
        const response2 = await this._apiGet(songsUrl2, token);
        songs.push(...response2.data.tracks);
      }
      this.setState({
        playlist: songs,
        trackLikes: trackLikes,
        artistLikes: artistLikes,
        init: true
      });
    } catch(e) {
    if (e.response.data.error.status == 401) {
      this.props.navigation.navigate("SpotifyLogin");
    } else {
      Alert.alert("Please connect a spotify device");
    }
    console.log(e);
  }
  };

  activatePlayHelper = async token => {
    try {
      const img = await this.apiGetTrackImage(token);
      this.setState({
        navigated: true,
        playing: true,
        current: img[0],
        songName: img[1],
        artistPlaying: img[2],
        trackPlaying: img[3],
        trackDuration: img[4],
        tPos: img[5]
      });
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
      } else {
        Alert.alert("Please connect a spotify device");
      }
      const img = await this.apiGetTrackImage(token);
      this.setState({
        navigated: true,
        playing: true,
        current: img[0],
        songName: img[1],
        artistPlaying: img[2],
        trackPlaying: img[3],
        trackDuration: img[4],
        tPos: img[5]
      });
      console.log(e);
    }
  };

  activatePlay = async () => {
    const token = await getData("accessToken");
    const id = await getData("mmPlaylist");
    Keyboard.dismiss();
    try {
      const uri = await this.apiGetContextUri(token);
      if (
        (this.state.navigated &&
          uri === "spotify:user:12168726728:playlist:" + id)
      ) {
        await this.apiPutRegular(
          "https://api.spotify.com/v1/me/player/play",
          token
        );
        await this.activatePlayHelper(token, id);
      } else {
        try {
          await this.apiPutNav(
            "https://api.spotify.com/v1/me/player/play",
            token,
            id
          );
          await this.apiPutRegular(
            "https://api.spotify.com/v1/me/player/play",
            token
          );
          await this.activatePlayHelper(token);
        } catch(e) {
          if (e.response.data.error.status == 401) {
            this.props.navigation.navigate("SpotifyLogin");
          }
          await this.activatePlayHelper(token);
        }
      }
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
      } else {
        Alert.alert("Please connect a spotify device");
      }
      console.log(e);
    }
  };

  activatePause = async () => {
    const token = await getData("accessToken");
    Keyboard.dismiss();
    try {
      const img = await this.apiGetTrackImage(token);
      await this.apiPutRegular(
        "https://api.spotify.com/v1/me/player/pause",
        token
      );
      this.setState({
        playing: false,
        current: img[0],
        songName: img[1],
        artistPlaying: img[2],
        trackPlaying: img[3],
        trackDuration: img[4],
        tPos: img[5]
      });
    } catch(e) {
      if (e.response.data.error.status == 401) {
        this.props.navigation.navigate("SpotifyLogin");
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
        <Mytextinput
          placeholder="Enter Name"
          style={{ padding: 10 }}
          onChangeText={playlistName => this.setState({ playlistName })}
        />
        <ButtonOne
          title="Create Playlist"
          customClick={this.createNewPlaylist}
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
              value={this.state.tPos? Math.round(this.state.tPos / 1000) : 0}
              maximumValue={Math.round(
                this.state.trackDuration / 1000) > 0
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
                  await this.apiPutRegular(url, token);
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
