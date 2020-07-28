import axios from "axios";

/**
 * SongEngine class contains methods which filter or produce songs on spotify
 *
 * @param state - saved component state which contains user input values
 * @param playlistId - target playlist id to fill with songs
 * @param token - user authenticated access token for API requests
 */
export default class SongEngine {
  constructor(state, playlistId, token, seenSongs) {
    this.playlistId = playlistId;
    this.token = token;
    this.state = state;
    this.seenSongs = seenSongs;
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
   * Applies a filter to data based on user input
   *
   * @param features - an Array of track audio features
   * @param index - index of target feature
   * @param data - an Array of track json data
   * @returns - track json data if it passed filters, null otherwise
   */
  _applyFilter = (features, index, data) => {
    const euphoria =
      this.state.euphoria >= 0
        ? features[index].valence * 50 + features[index].danceability * 50
        : (1 - features[index].valence) * 100;
    const hype =
      this.state.hype >= 0
        ? features[index].energy * 160 + features[index].acousticness * 40
        : (1 - features[index].energy) * 200;
    const passedFeaturesCheck =
      features[index].tempo > this.state.tempo &&
      euphoria > Math.abs(this.state.euphoria) &&
      hype > Math.abs(this.state.hype) &&
      !this.seenSongs[features[index].id];
    const filtered_popularity_song =
      data["items"] &&
      data.items[index].track.popularity > this.state.sPopularity
        ? data.items[index]
        : data["tracks"] &&
          data.tracks[index].popularity > this.state.sPopularity
        ? data.tracks[index]
        : null;

    return passedFeaturesCheck ? filtered_popularity_song : null;
  };

  /**
   * Takes a string of track IDs and filters the tracks based on state values
   *
   * @param data - a reference to an api response of Track Info json
   * @param idString - a string composed of track IDs
   * @returns - an array of Track Information json
   */
  _collectFilteredSongs = async (data, idString) => {
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

    while (existenceCheck && j < trackData.data.audio_features.length) {
      features = trackData.data.audio_features;
      const songOrNull = this._applyFilter(features, j, data);
      songOrNull ? songsToReturn.push(songOrNull) : null;
      j++;
      existenceCheck = features[j] && features[j]["danceability"];
    }
    return songsToReturn;
  };

  /**
   * Takes an array of 2 seed IDs and produces 100 recommendations
   *
   * @param artistIds - an array of artist ID strings
   * @returns - a two element array, with index 0 being an array of track ID
   *            strings, and with index 1 being Track Info json
   */
  _getSeededRecs = async artistIds => {
    const idString = artistIds.join(",");
    const url =
      "https://api.spotify.com/v1/recommendations?limit=100&seed_artists=" +
      idString +
      "&market=from_token";
    const response = await this._apiGet(url);
    const tracks = response.data.tracks;
    const trackIds = [];

    for (let i = 0; i < tracks.length; i++) {
      trackIds.push(tracks[i].id);
    }

    return { trackIds: trackIds, response: response };
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
      for (let i = 0; i < artistIds.length && idAccum.length < 2; i++) {
        if (!addedArtists[artistIds[i]]) {
          idAccum.push(artistIds[i]);
          addedArtists[artistIds[i]] = true;
        }
      }

      songsAndResponse =
        idAccum.length > 0 ? await this._getSeededRecs(idAccum, false) : null;

      if (songsAndResponse && songsAndResponse["trackIds"].length > 0) {
        const filtered = await this._collectFilteredSongs(
          songsAndResponse["response"].data,
          songsAndResponse["trackIds"]
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
   * Produces related artists from an Array of artists
   *
   * @param artistIds - an Array of strings, being artist IDs
   * @param max - maximum length allowed for Array to return
   * @returns - an Array of strings, being related artist IDs
   */
  _getRelatedArtists = async (artistIds, max) => {
    let relatedArtists = [];
    const addedArtists = {};
    for (let a = 0; a < artistIds.length && relatedArtists.length < max; a++) {
      const url =
        "https://api.spotify.com/v1/artists/" +
        artistIds[a] +
        "/related-artists";
      const response = await this._apiGet(url);

      if (response && response.data.artists[0]) {
        const responseArtists = response.data.artists;
        this._shuffleArray(responseArtists);
        for (let i = 0; i < responseArtists.length; i++) {
          if (!addedArtists[responseArtists[i].id]) {
            relatedArtists.push(responseArtists[i].id);
            addedArtists[responseArtists[i].id] = true;
          }
        }
      }
    }
    return relatedArtists;
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
    let artistIds = [];
    let addedArtists = {};
    let playlistToReturn;

    for (let i = 0; i < playlistItems.length; i++) {
      if (playlistItems[i].track.artists[0]) {
        const artist_id = playlistItems[i].track.artists[0].id;
        if (addedArtists[artist_id]) {
          addedArtists[artist_id].push(playlistItems[i].track.id);
        } else {
          artistIds.push(artist_id);
          addedArtists[artist_id] = [playlistItems[i].track.id];
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
      playlistToReturn = await this._collectFilteredSongs(
        response.data,
        idString
      );
    } else if (mode === "create" && artistSeeds) {
      if (this.state.lookForRelated) {
        const relatedArtists = await this._getRelatedArtists(artistIds, 150);
        artistIds = relatedArtists;
      }
      artistIds.unshift(...artistSeeds);
      this._shuffleArray(artistIds);
      playlistToReturn = await this._artistsToPlaylist(artistIds);
    } else if (mode === "create") {
      if (this.state.lookForRelated) {
        const relatedArtists = await this._getRelatedArtists(artistIds, 150);
        artistIds = relatedArtists;
      }
      this._shuffleArray(artistIds);
      playlistToReturn = await this._artistsToPlaylist(artistIds);
    } else {
      console.error("Argument 'mode' is restricted to 'filter' or 'create'");
    }

    return playlistToReturn;
  };
}
