import axios from "axios";
import { getData } from "./LocalStorage.js";

/**
 * SongEngine class contains methods which filter or produce songs on spotify
 *
 * @param stats - saved component state which contains user input values
 */
export default class SongEngine {
  constructor(stats) {
    this.addedArtists = {};
    this.state = stats;
  }

  /**
   * Requests information based on url and gives a response
   *
   * @param url - the url of the spotify api with a given endpoint
   * @param token - the authorization token to pass to the api
   * @returns - a json object being the api response, or null
   */
  _apiGet = async (url, token) => {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  /**
   * Produces a random number between 0 and argument 'max'
   *
   * @param max - the upper bound of the range to select a random number
   * @returns - a number between 0 and 'max'
   */
  _getRandomInt = max => {
    const min = 0;
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Takes a string of track IDs and filters the tracks based on state values
   *
   * @param response - a reference to an api response of Track Info json
   * @param token - user authentication token, a string
   * @param idString - a string composed of track IDs
   * @returns - an array of Track Information json
   */
  _filterSongs = async (response, token, idString) => {
    let songsToReturn = [];
    const songsUrl =
      "https://api.spotify.com/v1/audio-features/?ids=" + idString;
    const trackData = await this._apiGet(songsUrl, token);
    let existenceCheck = () => {
      trackData["data"] &&
        trackData.data["audio_features"] &&
        trackData.data.audio_features[j] &&
        trackData.data.audio_features[j]["danceability"];
    };
    let j = 0;
    let features;

    while (existenceCheck && j < trackData.data.audio_features.length) {
      features = trackData.data.audio_features;
      const euphoria =
        features[j].danceability * 100 + features[j].valence * 100;
      const hype =
        features[j].tempo * 2 +
        features[j].energy * 150 +
        features[j].acousticness * 75 +
        features[j].danceability * 150;
      if (
        features[j].tempo > this.state.tempo &&
        euphoria > this.state.euphoria &&
        hype > this.state.hype &&
        (!this.state.isEnabled || features[j].key == this.state.key)
      ) {
        if (
          response.data["items"] &&
          response.data.items[j].track.popularity > this.state.sPopularity
        ) {
          songsToReturn.push(response.data.items[j]);
        } else if (
          response.data["tracks"] &&
          response.data.tracks[j].popularity > this.state.sPopularity
        ) {
          songsToReturn.push(response.data.tracks[j]);
        }
      }
      j++;
      existenceCheck = features[j] && features[j]["danceability"];
    }

    return songsToReturn;
  };

  /**
   * Takes an array of 5 seed IDs and produces 100 recommendations
   *
   * @param artistIds - an array of artist ID strings
   * @param token - user authentication token, a string
   * @returns - a two element array, with index 0 being an array of track ID
   *            strings, and with index 1 being Track Info json
   */
  _getSeededRecs = async (artistIds, token) => {
    const idString = artistIds.join(",");
    const url =
      "https://api.spotify.com/v1/recommendations?limit=50&seed_artists=" +
      idString +
      "&market=from_token";
    const response = await this._apiGet(url, token);
    const tracks = response.data.tracks;
    const trackIds = [];

    for (let n = 0; n < tracks.length; n++) {
      trackIds.push(tracks[n].id);
    }

    return [trackIds, response];
  };

  /**
   * Takes an array of Artist json and produces 100 track IDs
   *
   * @param artistIds - an array of artist ID strings
   * @param token - user authentication token, a string
   */
  _artistsToPlaylist = async (artistIds, token) => {
    const songsToReturn = [];
    const addedArtists = {};

    if (artistIds.length < 5) {
      return this.alogirthm("create");
    }

    while (songsToReturn.length < 100) {
      const idAccum = [];
      let stopper = 0;
      while (stopper < 5) {
        const idToAdd = artistIds[this._getRandomInt(artistIds.length - 1)];
        if (!this.addedArtists[idToAdd]) {
          this.addedArtists[idToAdd] = true;
        }
        if (addedArtists[idToAdd]) {
          stopper--;
        } else {
          idAccum.push(idToAdd);
          addedArtists[idToAdd] = true;
        }
        stopper++;
      }

      const songsAndResponse = await this._getSeededRecs(idAccum, token);
      const filtered = await this._filterSongs(
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

  /**
   * Main entry point for interaction with the spotify api
   *
   * @param which - a string being algorithm options
   * @returns - an array of Track Info Json
   */
  algorithm = async which => {
    let refinedTracks;
    const addedArtists = {};
    const token = this.state.token
      ? this.state.token
      : await getData("accessToken");
    const playlistId = await getData("playlistId");
    const url =
      "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const response = await this._apiGet(url, token);
    const items = response.data.items;
    let artistIds = [];

    for (let s = 0; s < items.length; s++) {
      if (items[s].track.artists[0]) {
        const idToAdd = items[s].track.artists[0].id;
        if (!this.addedArtists[idToAdd]) {
          this.addedArtists[idToAdd] = true;
        }
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
          const responseTwo = this.state.lookArtists
            ? await this._apiGet(urlTwo, token)
            : null;
          if (
            !this.state.lookArtists ||
            responseTwo.data.popularity > this.state.aPopularity
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
      refinedTracks = await this._filterSongs(response, token, idString);
    } else if (which === "create") {
      refinedTracks = await this._artistsToPlaylist(artistIds, token);
    } else {
      console.error("Argument 'which' is restricted to 'filter' or 'create'");
    }
    return refinedTracks;
  };
}
