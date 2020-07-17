import React from "react";
import { View, Image, Alert } from "react-native";
import { ButtonOne } from "../components/MyButtons.js";
import axios from "axios";
import { setData, getData } from "../LocalStorage.js";
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
      songQueue: null,
      engine: null,
      likes: 0,
      artistPlaying: null,
      artistLikes: []
    };
  }

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

  like = async () => {
    if (this.state.artistPlaying && this.state.likes >= 4) {
      Alert.alert("Upvoted Song - Updating Seed...");
      const replace = this.state.artistLikes;
      replace.unshift(this.state.artistPlaying);
      const playlistId = await getData("playlistId");
      const mmId = await getData("mmPlaylist");
      const token = await getData("accessToken");
      const stats = await getData("Stats");
      const playlist = await new SongEngine(stats, playlistId, token).algorithm(
        "create",
        replace
      );
      const url =
        "https://api.spotify.com/v1/playlists/" + mmId + "/tracks";
      const ids = [];

      for (let i = 0; i < playlist.length; i++) {
        ids.push(
          "spotify:track:" +
            (playlist[i]["track"] ? playlist[i].track.id : playlist[i].id)
        );
      }
      await setData("playlistData", playlist);
      await this.apiPut(url, token, ids);
      this.setState({ artistLikes: replace, likes: 0 });
    } else if (this.state.artistPlaying) {
      Alert.alert("Upvoted Song");
      const replace = this.state.artistLikes;
      replace.unshift(this.state.artistPlaying);
      this.setState({ artistLikes: replace, likes: this.state.likes + 1 });
    }
  };

  apiGetTrackImage = async token => {
    let img = ["", "", ""];
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
        artistPlaying: trackimg[2]
      });
    } catch (e) {
      Alert.alert("Please connect a spotify device");
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
        playing: false,
        current: trackimg[0],
        songName: trackimg[1],
        artistPlaying: trackimg[2]
      });
    } catch (e) {
      Alert.alert("Please connect a spotify device");
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
        artistPlaying: img[2]
      });
    } catch (e) {
      const img = await this.apiGetTrackImage(token);
      this.setState({
        navigated: true,
        playing: true,
        current: img[0],
        songName: img[1],
        artistPlaying: img[2]
      });
      console.log(e);
    }
  };

  activatePlay = async () => {
    const token = await getData("accessToken");
    const id = await getData("mmPlaylist");
    try {
      const uri = await this.apiGetContextUri(token);
      if (
        (this.state.navigated &&
          uri === "spotify:user:12168726728:playlist:" + id) ||
        uri === "spotify:user:12168726728:playlist:" + id
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
        } catch (_) {
          await this.activatePlayHelper(token);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  activatePause = async () => {
    const token = await getData("accessToken");
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
        artistPlaying: img[2]
      });
    } catch (e) {
      Alert.alert("Please connect a spotify device");
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
        <Mytext text={"Song Navigation"} />
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
                height: 225,
                width: 225,
                marginBottom: 32,
                marginTop: 100
              }}
              source={
                this.state.current ? { uri: this.state.current } : { uri: "" }
              }
            />
          ) : null}
          <Mytext text={this.state.songName ? this.state.songName : ""} />
        </View>
      </View>
    );
  }
}
