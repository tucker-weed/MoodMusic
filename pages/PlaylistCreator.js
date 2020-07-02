import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert } from "react-native";
import Slider from '@react-native-community/slider';
import Mytext from '../components/Mytext.js';
import axios from "axios";

import { styles } from "../Styles.js";
import { setData, getData } from '../LocalStorage.js';

export default class PlaylistCreator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      token: null,
      playlist: null,
      acousticness: 0.0,
      liveness: 0.0,
      loudness: -100.0,
      danceability: 0.0,
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

  activate = async () => {
    const token = this.state.token ? this.state.token : await getData('accessToken');
    const playlistId = this.state.access ? this.state.access : await getData('playlistId');
    const url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks";
    const response = await this.apiGet(url, token);
    const filteredGet = [];
    if (response) {
        let index = 0;
        Alert.alert(
            'Creating Playlist',
            'Please wait...',
            [],
            { cancelable: false, }
          );
        while (index < response.data.items.length) {
            const songUrl = "https://api.spotify.com/v1/audio-features/"+response.data.items[index].track.id;
            let trackData = await this.apiGet(songUrl, token);
            trackData = trackData.data;
            if (trackData && trackData.acousticness > this.state.acousticness &&
            trackData.loudness > this.state.loudness &&
            trackData.liveness > this.state.liveness &&
            trackData.danceability > this.state.danceability) {
                    filteredGet.push(response.data.items[index]);
            }
            index++;
        }
        await setData('playlistData', filteredGet);
        this.props.navigation.navigate('PlaylistResults');
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
        <TouchableOpacity style={styles.button} onPress={this.activate}>
          <Text style={styles.buttonText}>Create Playlist</Text>
        </TouchableOpacity>
        <View style={localStyles.container} >
            <Mytext text={"Acousticness: "+this.state.acousticness}/>
            <Slider
            style={{width: 300, height: 40}}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ acousticness: +(val.toFixed(2))})}
            />
        </View>
        <View style={localStyles.container} >
            <Mytext text={"Liveness: "+this.state.liveness}/>
            <Slider
            style={{width: 300, height: 40}}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ liveness: +(val.toFixed(2))})}
            />
        </View>
        <View style={localStyles.container} >
            <Mytext text={"Loudness: "+this.state.loudness}/>
            <Slider
            style={{width: 300, height: 40}}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ loudness: +(val.toFixed(2))})}
            />
        </View>
        <View style={localStyles.container} >
            <Mytext text={"Danceability: "+this.state.danceability}/>
            <Slider
            style={{width: 300, height: 40}}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            onValueChange={val => this.setState({ danceability: +(val.toFixed(2))})}
            />
        </View>
      </View>
    );
  }
}


const localStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#2FD566',
        color: '#ffffff',
        padding: 10,
        marginTop: 16,
        marginLeft: 35,
        marginRight: 35,
    }
});
