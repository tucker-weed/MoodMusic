import axios from "axios";

/**
 * SongEngine class contains methods which filter or produce songs on spotify
 *
 * @param state - saved component state which contains user input values
 * @param playlistId - target playlist id to fill with songs
 * @param token - user authenticated access token for API requests
 */
export default class SongEngine {
  constructor(state, playlistId, token) {
    this.playlistId = playlistId;
    this.token = token;
    this.state = state;
    /**
     * LIMIT: a number, the spotify API limit on POST data length.
     * RESTRICTED TO: less than or equal to 100.
     */
    this.LIMIT = 100;
  }

  /**
   * Requests information based on url and gives a response
   *
   * @param url - the url of the spotify api with a given endpoint
   * @returns - a json object being the api response, or an error
   */
  _apiGet = async url => {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  };

  /**
   * Returns true after a certain deadline
   *
   * @param start - the reference start for the timeout range
   * @param deadline - the time, in seconds, until timeout
   * @returns - a boolean, true if timeout has been reached, false otherwise
   */
  _timeout = (start, deadline) => {
    return new Date().getTime() - start >= deadline * 1000;
  };

  /**
   * Randomly shuffles an Array in place
   *
   * @param _array - the input Array to be shuffled
   */
  _shuffleArray = _array => {
    for (let i = _array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [_array[i], _array[j]] = [_array[j], _array[i]];
    }
  };

  /**
   * Takes a string of track IDs and filters the tracks based on state values
   *
   * @param start - start time of the algorithm
   * @param data - a reference to an api response of Track Info json
   * @param idString - a string composed of track IDs
   * @returns - an array of Track Information json
   */
  _filterSongs = async (start, data, idString) => {
    let songsToReturn = [];
    const songsUrl =
      "https://api.spotify.com/v1/audio-features/?ids=" + idString;
    const trackData = await this._apiGet(songsUrl);
    let existenceCheck = () => {
      trackData["data"] &&
        trackData.data["audio_features"] &&
        trackData.data.audio_features[j] &&
        trackData.data.audio_features[j]["danceability"];
    };
    let j = 0;
    let features;

    while (
      existenceCheck &&
      j < trackData.data.audio_features.length &&
      !this._timeout(start, 7)
    ) {
      features = trackData.data.audio_features;
      const euphoria =
        this.state.euphoria >= 0
          ? features[j].danceability * 100 +
            features[j].valence * 100 +
            features[j].energy * 75
          : (1 - features[j].danceability) * 100 +
            (1 - features[j].valence) * 100 +
            (1 - features[j].energy) * 75;
      const hype =
        this.state.hype >= 0
          ? features[j].tempo * 2 +
            features[j].energy * 150 +
            features[j].acousticness * 75 +
            features[j].danceability * 150
          : 500 -
            features[j].tempo * 2 +
            (1 - features[j].energy) * 150 +
            (1 - features[j].acousticness) * 75 +
            (1 - features[j].danceability) * 150;
      const filteredValuesCheck =
        features[j].tempo > this.state.tempo &&
        euphoria > Math.abs(this.state.euphoria) &&
        hype > Math.abs(this.state.hype) &&
        (!this.state.isEnabled || features[j].key == this.state.key);
      const pop = this.state.sPopularity;

      if (filteredValuesCheck) {
        if (data["items"] && data.items[j].track.popularity > pop) {
          songsToReturn.push(data.items[j]);
        } else if (data["tracks"] && data.tracks[j].popularity > pop) {
          songsToReturn.push(data.tracks[j]);
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
   * @returns - a two element array, with index 0 being an array of track ID
   *            strings, and with index 1 being Track Info json
   */
  _getSeededRecs = async artistIds => {
    const idString = artistIds.join(",");
    const url =
      "https://api.spotify.com/v1/recommendations?limit=50&seed_artists=" +
      idString +
      "&market=from_token";
    const response = await this._apiGet(url);
    const tracks = response.data.tracks;
    const trackIds = [];

    for (let i = 0; i < tracks.length; i++) {
      trackIds.push(tracks[i].id);
    }

    return [trackIds, response];
  };

  /**
   * Takes an array of Artist json and produces 100 track IDs
   *
   * @param artistIds - an array of artist ID strings
   */
  _artistsToPlaylist = async artistIds => {
    const start = new Date().getTime();
    const songsToReturn = [];
    const addedArtists = {};
    const addedSongs = {};
    let songsAndResponse = true;

    while (
      songsAndResponse &&
      songsToReturn.length < this.LIMIT &&
      !this._timeout(start, 7)
    ) {
      const idAccum = [];
      for (let i = 0; i < artistIds.length && idAccum.length < 5; i++) {
        if (!addedArtists[artistIds[i]]) {
          idAccum.push(artistIds[i]);
          addedArtists[artistIds[i]] = true;
        }
      }

      songsAndResponse =
        idAccum.length > 0 ? await this._getSeededRecs(idAccum, false) : null;

      if (songsAndResponse && songsAndResponse[0].length > 0) {
        const filtered = await this._filterSongs(
          start,
          songsAndResponse[1].data,
          songsAndResponse[0]
        );
        const uniqueSongs = [];
        for (let i = 0; i < filtered.length; i++) {
          const id = filtered[i]["track"]
            ? filtered[i].track.id
            : filtered[i].id;
          if (!addedSongs[id]) {
            addedSongs[id] = true;
            uniqueSongs.push(filtered[i]);
          }
        }
        songsToReturn.push(
          ...uniqueSongs.slice(0, this.LIMIT - songsToReturn.length)
        );
      }
    }

    return songsToReturn;
  };

  /**
   * Main entry point for interaction with the spotify api
   *
   * @param mode - a string, either 'filter' or 'create'
   * @param artistSeeds - an Array of artistIds to add, or null
   * @returns - an Array of Track Info Json
   */
  algorithm = async (mode, artistSeeds) => {
    const url =
      "https://api.spotify.com/v1/playlists/" + this.playlistId + "/tracks";
    const response = await this._apiGet(url);
    const playlistItems = response.data.items;
    const start = new Date().getTime();
    const artistIds = [];
    const addedArtists = {};
    let playlistToReturn;

    for (let i = 0; i < playlistItems.length; i++) {
      if (playlistItems[i].track.artists[0]) {
        const idToAdd = playlistItems[i].track.artists[0].id;
        if (addedArtists[idToAdd]) {
          addedArtists[idToAdd].push(playlistItems[i].track.id);
        } else {
          artistIds.push(idToAdd);
          addedArtists[idToAdd] = [playlistItems[i].track.id];
        }
      }
    }

    if (mode === "filter") {
      let idString = "";
      let idsAdded = 0;
      for (let k = 0; k < artistIds.length && idsAdded < this.LIMIT; k++) {
        const artistTracks = addedArtists[artistIds[k]];
        for (let c = 0; c < artistTracks.length && idsAdded < this.LIMIT; c++) {
          idString += artistTracks[c] + ",";
          idsAdded++;
        }
      }
      playlistToReturn = await this._filterSongs(
        start,
        response.data,
        idString
      );
    } else if (mode === "create" && artistSeeds) {
      artistIds.unshift(...artistSeeds);
      this._shuffleArray(artistIds);
      playlistToReturn = await this._artistsToPlaylist(artistIds);
    } else if (mode === "create") {
      this._shuffleArray(artistIds);
      playlistToReturn = await this._artistsToPlaylist(artistIds);
    } else {
      console.error("Argument 'mode' is restricted to 'filter' or 'create'");
    }

    return playlistToReturn;
  };
}
