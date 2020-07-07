import React from "react";
import { View, Image, Alert } from "react-native";
import axios from "axios";
import { getData } from "../LocalStorage.js";
import { PlayerButton } from "../components/MyButtons.js";
import { Mytext } from "../components/Mytext.js";

export default class SongPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navigated: false,
      playing: false,
      current: null,
    }
  }

  apiGetTrackImage = async token => {
    let img = ['',''];
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response && response.data['item'] && response.data.item['album'] && response.data.item.album.images[0]) {
      img[0] = response.data.item.album.images[0].url;
      img[1] = response.data.item.name;
    }
    return img;
  };

  apiGetContextUri = async token => {
    let uri = '';
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response && response.data['context']) {
      uri = response.data.context.uri;
    }
    return uri;
  };

  apiPost = async (url, token) => {
    await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json;charset=UTF-8',
          "Access-Control-Allow-Origin": "*",
        },
      });
  };

  apiPutNav = async (url, token, id) => {
    const jsonData = {
      context_uri: "spotify:user:12168726728:playlist:"+id,
    }
    return await axios.put(url, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
        'Accept': "application/json"
      },
      data: jsonData,
      dataType: "json",
    });
  };

  apiPutRegular = async (url, token) => {
    return await axios.put(url, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      },
    });
  };

  activateNext = async () => {
    const token = await getData("accessToken");
    try {
      await this.apiPost('https://api.spotify.com/v1/me/player/next', token);
      await this.apiGetTrackImage(token);
      await this.apiGetTrackImage(token);
      this.apiGetTrackImage(token).then( async img => {
        this.setState({ playing: true, current: img[0], songName: img[1] });
      });
    } catch (e) {
      Alert.alert('Please connect a spotify device');
      console.log(e);
    }
  };

  activateBack = async () => {
    const token = await getData("accessToken");
    try {
      await this.apiPost('https://api.spotify.com/v1/me/player/previous', token);
      await this.apiGetTrackImage(token);
      await this.apiGetTrackImage(token);
      this.apiGetTrackImage(token).then( async img => {
          this.setState({ playing: true, current: img[0], songName: img[1] });
      });
    } catch (e) {
      Alert.alert('Please connect a spotify device');
      console.log(e);
    }
  };

  activatePlayHelper = async (token, id) => {
    try {
      const img = await this.apiGetTrackImage(token);
      this.setState({ navigated: true, playing: true, current: img[0], songName: img[1] });
    } catch (e) {
      const img = await this.apiGetTrackImage(token);
      this.setState({ navigated: true, playing: true, current: img[0], songName: img[1] });
      console.log(e);
    }
  };

  activatePlay = async () => {
    const token = await getData("accessToken");
    const id = await getData('mmPlaylist');
    try {
      const uri = await this.apiGetContextUri(token);
      if ((this.state.navigated && uri === "spotify:user:12168726728:playlist:"+id) || uri === "spotify:user:12168726728:playlist:"+id) {
        await this.apiPutRegular('https://api.spotify.com/v1/me/player/play', token);
        await this.activatePlayHelper(token, id);
      } else {
        try {
          await this.apiPutNav('https://api.spotify.com/v1/me/player/play', token, id);
          await this.apiPutRegular('https://api.spotify.com/v1/me/player/play', token);
          await this.activatePlayHelper(token, id);
          await this.activatePlayHelper(token, id);
        } catch (_) {
          await this.activatePlayHelper(token, id);
          await this.activatePlayHelper(token, id);
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
      await this.apiPutRegular('https://api.spotify.com/v1/me/player/pause', token);
      this.setState({ playing: false, current: img[0], songName: img[1] });
    } catch (e) {
      Alert.alert('Please connect a spotify device');
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
        <View
        style={{
          flex: 0.085,
          backgroundColor: "black",
          flexDirection: "row",
        }}
        >
          <PlayerButton
            title="<<"
            customClick={this.activateBack}
          />
          <PlayerButton
            title={this.state.playing ? "||" : ">"}
            customClick={this.state.playing ? this.activatePause : this.activatePlay}
          />
          <PlayerButton
            title=">>"
            customClick={this.activateNext}
          />
        </View>
        <View
        style={{
          flex: 1,
          backgroundColor: "black",
          flexDirection: "column",
          alignItems: 'center',
        }}
        >
        {this.state.current ? 
        <Image
          style={{
            height: 225,
            width: 225,
            marginBottom: 32,
            marginTop: 100
          }}
          source={
          this.state.current
          ? { uri: this.state.current }
          : { uri: '' }
          }
        /> : null}
        <Mytext text={this.state.songName ? this.state.songName : ""} />
        </View>
     </View>
    );
  }
}