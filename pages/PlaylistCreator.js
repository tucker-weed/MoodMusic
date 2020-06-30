import React from 'react';
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import Mytextinput from '../components/Mytextinput.js';
import axios from "axios";

import { styles } from "../Styles.js";
import { getData } from '../localStorage.js';

export default class PlaylistCreator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      token: null,
      playlist: null,
    };
  }

   /**
   * Requests information based on url and gives a response
   * 
   * @param url - the url of the spotify api with a given endpoint
   * @param token - the authorization token to pass to the api
   * @returns - a json object being the api response, or null
   */
  apiGet = async (url, token) => {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  search = async () => {
    const data = this.state.userInfo ? this.state.userInfo : await getData('userData');
    const access = this.state.access ? this.state.access : await getData('accessToken');
    const playlistId = this.state.access ? this.state.access : await getData('playlistId');
    const url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks";
    const response = await this.apiGet(url, access);
    if (response) {
      if (this.userInfo && this.token) {
        this.setState({ playlist: response.data.items})
      } else {
        this.setState({ playlist: response.data.items, userInfo: data, token: access });
      }
    } else {
      console.log("ERROR: token expired");
      this.setState({ userInfo: null, token: null, playlist: null });
    }
  };

  render() {
    return (
      <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        flexDirection: 'column',
      }}
      >
        <TouchableOpacity style={styles.button} onPress={this.search}>
          <Text style={styles.buttonText}>Create Playlist</Text>
        </TouchableOpacity>
        {this.state.playlist ? (
          <FlatList
            data={this.state.playlist}
            ItemSeparatorComponent={null}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                key={item.id}
                style={{ backgroundColor: "black", padding: 5 }}
              >
                <Text style={{ color: "white" }}>Track Id: 
                {
                  (!item || !item.track || !item.track.album || !item.track.album.images) ? null : item.track.album.id
                }</Text>
                <Image
                  style={styles.profileImage}
                  source={
                    !item.track.album.images[0] ? { uri: this.state.userInfo.images[0].url } 
                      : { uri: item.track.album.images[0].url }
                  }
                />
              </View>
            )}
          />
        ) : null}
      </View>
    );
  }
}