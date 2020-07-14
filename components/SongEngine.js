import axios from "axios";
import { setData, getData } from "../LocalStorage.js";

export default class SongEngine {
  constructor(stats) {
    this.state = stats;
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

  getRandomInt = max => {
    const min = 0;
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  filterSongs = async (that, response, token, idString) => {
    let songsToReturn = [];
    const songsUrl =
      "https://api.spotify.com/v1/audio-features/?ids=" + idString;
    const trackData = await that.apiGet(songsUrl, token);
    let existenceCheck = () => {
      trackData["data"] &&
        trackData.data["audio_features"] &&
        trackData.data.audio_features[j] &&
        trackData.data.audio_features[j]["danceability"];
    };
    let j = 0;

    while (existenceCheck && j < trackData.data.audio_features.length) {
      const features = trackData.data.audio_features;
      const euphoria =
        features[j].danceability * 100 + features[j].valence * 100;
      const hype =
        features[j].tempo * 2 +
        features[j].energy * 150 +
        features[j].acousticness * 75 +
        features[j].danceability * 150;
      if (
        features[j].tempo > that.state.tempo &&
        euphoria > that.state.euphoria &&
        hype > that.state.hype &&
        (!that.state.isEnabled || features[j].key == that.state.key)
      ) {
        if (
          response.data["items"] &&
          response.data.items[j].track.popularity > that.state.sPopularity
        ) {
          songsToReturn.push(response.data.items[j]);
        } else if (
          response.data["tracks"] &&
          response.data.tracks[j].popularity > that.state.sPopularity
        ) {
          songsToReturn.push(response.data.tracks[j]);
        }
      }
      j++;
      existenceCheck = features[j] && features[j]["danceability"];
    }

    return songsToReturn;
  };

  getSeededRecs = async (artistIds, token) => {
    const idString = artistIds.join(",");
    const url =
      "https://api.spotify.com/v1/recommendations?limit=100&seed_artists=" +
      idString +
      "&market=from_token";
    const response = await this.apiGet(url, token);
    const tracks = response.data.tracks;
    const trackIds = [];

    for (let n = 0; n < tracks.length; n++) {
      trackIds.push(tracks[n].id);
    }

    return [trackIds, response];
  };

  artistsToPlaylist = async (that, artistIds, token) => {
    const songsToReturn = [];
    const addedArtists = {};

    while (songsToReturn.length < 100) {
      const idAccum = [];
      let stopper = 0;
      while (stopper < 5) {
        const idToAdd = artistIds[this.getRandomInt(artistIds.length - 1)];
        if (addedArtists[idToAdd]) {
          stopper--;
        } else {
          idAccum.push(idToAdd);
          addedArtists[idToAdd] = true;
        }
        stopper++;
      }

      const songsAndResponse = await this.getSeededRecs(idAccum, token);
      const filtered = await this.filterSongs(
        that,
        songsAndResponse[1],
        token,
        songsAndResponse[0]
      );
      let p = 0;
      while (p < filtered.length && songsToReturn.length < 100) {
        songsToReturn.push(filtered[p]);
        p++;
      }
    }
    return songsToReturn;
  };

  crawlAPI = async which => {
    const that = this;
    const token = this.state.token
      ? this.state.token
      : await getData("accessToken");
    const playlistId = await getData("playlistId");
    const url =
      "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const response = await this.apiGet(url, token);
    const items = response.data.items;
    let addedArtists = {};
    let artistIds = [];

    for (let s = 0; s < items.length; s++) {
      if (items[s].track.artists[0]) {
        const idToAdd = items[s].track.artists[0].id;
        if (addedArtists[idToAdd]) {
          addedArtists[idToAdd].push(items[s].track.id);
        } else {
          artistIds.push(idToAdd);
          addedArtists[idToAdd] = [items[s].track.id];
        }
      }
    }

    if (which === "filter") {
      let idString = "";
      for (let k = 0; k < artistIds.length; k++) {
        const urlTwo = "https://api.spotify.com/v1/artists/" + artistIds[k];
        try {
          const responseTwo = that.state.lookArtists
            ? await this.apiGet(urlTwo, token)
            : null;
          if (
            !that.state.lookArtists ||
            responseTwo.data.popularity > that.state.aPopularity
          ) {
            for (let c = 0; c < addedArtists[artistIds[k]].length; c++) {
              if (artistIds.length - c == 1) {
                idString += addedArtists[artistIds[k]][c];
              } else {
                idString += addedArtists[artistIds[k]][c] + ",";
              }
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
      const filteredGet = await that.filterSongs(
        that,
        response,
        token,
        idString
      );
      await setData("playlistData", filteredGet);
    } else if (which === "create") {
      const filteredGet = await that.artistsToPlaylist(that, artistIds, token);
      await setData("playlistData", filteredGet);
    } else {
      console.error("Argument 'which' is restricted to filter or create");
    }
  };
}
