import React from "react";
import { View } from "react-native";
import axios from "axios";
import { getData } from "../LocalStorage.js";
import { LoginButton } from "../components/MyButtons.js";
import { Mytext } from "../components/Mytext.js";

export default class SongPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navigated: false,
    }
  }
  
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
        await this.apiPost('https://api.spotify.com/v1/me/player/next', token);
    } catch (e) {
        console.log(e);
    }
  };

  activateBack = async () => {
    const token = await getData("accessToken");
    try {
        await this.apiPost('https://api.spotify.com/v1/me/player/previous', token);
    } catch (e) {
        console.log(e);
    }
  };

  activatePlay = async () => {
    const token = await getData("accessToken");
    const id = await getData('mmPlaylist');
    try {
        if (this.state.navigated) {
          await this.apiPutRegular('https://api.spotify.com/v1/me/player/play', token);
        } else {
          await this.apiPutNav('https://api.spotify.com/v1/me/player/play', token, id);
          this.setState({ navigated: true })
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
        await this.apiPutRegular('https://api.spotify.com/v1/me/player/pause', token);
      } else {
        await this.apiPutNav('https://api.spotify.com/v1/me/player/pause', token, id);
        this.setState({ navigated: true })
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
        <LoginButton
          title="Previous"
          customClick={this.activateBack}
        />
        <LoginButton
          title="Pause"
          customClick={this.activatePause}
        />
        <LoginButton
          title="Play"
          customClick={this.activatePlay}
        />
        <LoginButton
          title="Next"
          customClick={this.activateNext}
        />
      </View>
    );
  }
}