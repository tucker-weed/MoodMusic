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

  artistsToPlaylist = async (that, artistIds, token) => {
    let songsToReturn = [];
    let accumulator = [];
    let addedArtists = {};
    const start = new Date().getTime();

    const timeout = deadline => {
      return new Date().getTime() - start >= deadline * 1000;
    };

    const getRelated = async (artistIds, stop) => {
      let accum = [];

      for (let a = 0; a < artistIds.length; a++) {
        const url =
          "https://api.spotify.com/v1/artists/" +
          artistIds[a] +
          "/related-artists";
        const response = await that.apiGet(url, token);

        let stopper = 0;
        while (stopper < stop && !timeout(30)) {
          if (
            response &&
            response.data.artists[0] &&
            (!that.state.lookArtists ||
              response.data.artists[0].popularity > that.state.aPopularity)
          ) {
            const idToAdd =
              response.data.artists[
                that.getRandomInt(response.data.artists.length - 1)
              ].id;
            if (addedArtists[idToAdd]) {
              stopper--;
            } else {
              accum.push(idToAdd);
              addedArtists[idToAdd] = true;
            }
          }
          stopper++;
        }
      }
      return accum;
    };

    const ids = await getRelated(artistIds, 1);
    accumulator.push(...ids);
    let i = 0;

    while (
      i < accumulator.length &&
      songsToReturn.length < 100 &&
      !timeout(30)
    ) {
      const url =
        "https://api.spotify.com/v1/artists/" +
        accumulator[i] +
        "/top-tracks?country=from_token";
      const response = await that.apiGet(url, token);
      const responseTracks = response.data.tracks;
      let idString = "";

      for (let index = 0; index < responseTracks.length; index++) {
        if (responseTracks.length - index == 1) {
          idString += responseTracks[index].id;
        } else {
          idString += responseTracks[index].id + ",";
        }
      }

      const toAdd = await that.filterSongs(that, response, token, idString);
      let p = 0;

      while (p < toAdd.length && songsToReturn.length < 100) {
        songsToReturn.push(toAdd[p]);
        p++;
      }
      if (
        i == accumulator.length - 1 &&
        songsToReturn.length < 100 &&
        !timeout(30)
      ) {
        const ids = await getRelated(accumulator, 1);
        accumulator.push(...ids);
      }
      i++;
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
