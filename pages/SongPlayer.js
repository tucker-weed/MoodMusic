import React from "react";
import { View, Image } from "react-native";
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

  /**
   * Requests information based on url and gives a response
   *
   * @param url - the url of the spotify api with a given endpoint
   * @param token - the authorization token to pass to the api
   * @returns - a json object being the api response, or null
   */
  apiGetTrackImage = async token => {
    let img = ['',''];
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response && response.data.item['album'] && response.data.item.album.images[0]) {
      img[0] = response.data.item.album.images[0].url;
      img[1] = response.data.item.name;
    }
    return img;
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
      context_uri: "spotify:playlist:"+id,
      offset: {
        position: 0
      }  
    }
    return await axios.put(url, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
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
        await this.apiPost('https://api.spotify.com/v1/me/player/next', token)
        const img = await this.apiGetTrackImage(token);
        this.setState({ playing: true, current: img[0], songName: img[1] });
    } catch (e) {
        console.log(e);
    }
  };

  activateBack = async () => {
    const token = await getData("accessToken");
    try {
        await this.apiPost('https://api.spotify.com/v1/me/player/previous', token);
        const img = await this.apiGetTrackImage(token);
        this.setState({ playing: true, current: img[0], songName: img[1] });
    } catch (e) {
        console.log(e);
    }
  };

  activatePlay = async () => {
    const token = await getData("accessToken");
    const id = await getData('mmPlaylist');
    try {
        if (this.state.navigated) {
          this.setState({ playing: true });
          await this.apiPutRegular('https://api.spotify.com/v1/me/player/play', token);
        } else {
          const img = await this.apiGetTrackImage(token);
          this.setState({ navigated: true, playing: true, current: img[0], songName: img[1] });
          await this.apiPutNav('https://api.spotify.com/v1/me/player/play', token, id);
        }
    } catch (e) {
        console.log(e);
    }
  };

  activatePause = async () => {
    const token = await getData("accessToken");
    const id = await getData('mmPlaylist');
    try {
      if (this.state.navigated) {
        this.setState({ playing: false });
        await this.apiPutRegular('https://api.spotify.com/v1/me/player/pause', token);
      } else {
        const img = await this.apiGetTrackImage(token);
        this.setState({ navigated: true, playing: false, current: img[0], songName: img[1] });
        await this.apiPutNav('https://api.spotify.com/v1/me/player/pause', token, id);
      }
    } catch (e) {
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