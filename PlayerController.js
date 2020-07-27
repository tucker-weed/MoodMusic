import axios from "axios";

export default class PlayerController {
  constructor(seen, stats, token) {
    this.initSeen = seen;
    this.state = stats;
    this.token = token;
  }

  /**
   * Requests information based on url and gives a response
   *
   * @param url - the url of the spotify api with a given endpoint
   * @returns - a json object being the api response, or an error
   */
  apiGet = async (url, token) => {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  apiPut = async (url, token, trackIds) => {
    const jsonData = {
      uris: trackIds
    };
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiGetTrackImage = async token => {
    let img = ["", "", "", "", ""];
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (
      response &&
      response.data["item"] &&
      response.data.item["album"] &&
      response.data.item.album.images[0]
    ) {
      img[0] = response.data.item.album.images[0].url;
      img[1] = response.data.item.name;
      img[2] = response.data.item.album.artists[0].id;
      img[3] = response.data.item.id;
      img[4] = response.data.item.duration_ms;
      img[5] = response.data.progress_ms;
    }
    return img;
  };

  apiGetContextUri = async token => {
    let uri = "";
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response && response.data["context"]) {
      uri = response.data.context.uri;
    }
    return uri;
  };

  apiPost = async (url, token) => {
    await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  };

  apiPutNew = async (url, token, name) => {
    const jsonData = {
      name: name,
      public: true
    };
    return await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiPutTracks = async (url, token, trackIds) => {
    const jsonData = {
      uris: trackIds
    };
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiPutNav = async (url, token, id) => {
    const jsonData = {
      context_uri: "spotify:user:12168726728:playlist:" + id
    };
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          Accept: "application/json"
        },
        data: jsonData,
        dataType: "json"
      }
    );
  };

  apiPutRegular = async (url, token) => {
    return await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  };

  updateRadioHistory = async (oldHist, playlistId) => {
    const { playlistName, artistLikes, trackLikes, seenTracks } = this.state;
    const response = await this.apiGet(
      `https://api.spotify.com/v1/playlists/` + playlistId,
      this.token
    );
    const pName = response.data.name;
    const radioHistory = oldHist ? oldHist : {};
    radioHistory[playlistName + "||" + playlistId] = {
      pName: pName,
      artistLikes: artistLikes,
      trackLikes: trackLikes,
      seenTracks: seenTracks
    };
    const data = {
      newHist: radioHistory,
      msg: "Saved Radio History: " + playlistName
    };
    return data;
  };

  toggleShuffle = async () => {
    const url =
      "https://api.spotify.com/v1/me/player/shuffle?state=" +
      !this.state.shuffle;
    await this.apiPutRegular(url, this.token);
  };

  createPlaylist = async (userId, name) => {
    const playlistUrl =
      "https://api.spotify.com/v1/users/" + userId + "/playlists";
    const response = await this.apiPutNew(playlistUrl, this.token, name);

    const trackUrl =
      "https://api.spotify.com/v1/playlists/" + response.data.id + "/tracks";
    const uriList = [];
    for (let i = 0; i < this.state.trackLikes.length; i++) {
      uriList.push("spotify:track:" + this.state.trackLikes[i]);
    }
    await this.apiPut(trackUrl, this.token, uriList);
    return "Created Playlist: " + name;
  };

  next = async savedSeen => {
    await this.apiPost("https://api.spotify.com/v1/me/player/next", this.token);
    let nameTracker = this.state.songName;
    let trackimg;
    while (nameTracker === this.state.songName) {
      trackimg = await this.apiGetTrackImage(this.token);
      nameTracker = trackimg[1];
    }
    const seen = this.initSeen ? this.state.seenTracks : savedSeen;
    seen[trackimg[3]] = true;
    return {
      trackData: trackimg,
      seen: seen
    };
  };

  back = async savedSeen => {
    await this.apiPost(
      "https://api.spotify.com/v1/me/player/previous",
      this.token
    );
    let nameTracker = this.state.songName;
    let trackimg;
    while (nameTracker === this.state.songName) {
      trackimg = await this.apiGetTrackImage(this.token);
      nameTracker = trackimg[1];
    }
    const seen = this.initSeen ? this.state.seenTracks : savedSeen;
    seen[trackimg[3]] = true;
    return {
      trackData: trackimg,
      seen: seen
    };
  };

  load = async (radioA, radioT) => {
    const trackLikes = !this.state.init ? radioT : this.state.trackLikes;
    const artistLikes = !this.state.init ? radioA : this.state.artistLikes;
    if (trackLikes.length == 0) {
      return {
        songs: [],
        trackLikes: trackLikes,
        artistLikes: artistLikes
      };
    } else {
      const songsUrl1 =
        "https://api.spotify.com/v1/tracks/?ids=" +
        trackLikes.slice(0, 50).join(",") +
        "&market=from_token";
      const response1 = await this.apiGet(songsUrl1, this.token);
      const songs = [];
      songs.push(...response1.data.tracks);
      if (trackLikes.length > 50) {
        const songsUrl2 =
          "https://api.spotify.com/v1/tracks/?ids=" +
          trackLikes.slice(50, 100).join(",") +
          "&market=from_token";
        const response2 = await this.apiGet(songsUrl2, this.token);
        songs.push(...response2.data.tracks);
      }
      return {
        songs: songs,
        trackLikes: trackLikes,
        artistLikes: artistLikes
      };
    }
  };

  activatePlayHelper = async seenTracks => {
    try {
      const img = await this.apiGetTrackImage(this.token);
      const seen = this.initSeen ? this.state.seenTracks : seenTracks;
      seen[img[3]] = true;
      return {
        trackData: img,
        seen: seen
      };
    } catch (_) {
      const img = await this.apiGetTrackImage(this.token);
      const seen = this.initSeen ? this.state.seenTracks : seenTracks;
      seen[img[3]] = true;
      return {
        trackData: img,
        seen: seen
      };
    }
  };

  play = async (id, seenTracks) => {
    const uri = await this.apiGetContextUri(this.token);
    if (
      this.state.navigated ||
      uri === "spotify:user:12168726728:playlist:" + id
    ) {
      await this.apiPutRegular(
        "https://api.spotify.com/v1/me/player/play",
        this.token
      );
      return await this.activatePlayHelper(seenTracks);
    } else {
      try {
        await this.apiPutNav(
          "https://api.spotify.com/v1/me/player/play",
          this.token,
          id
        );
        await this.apiPutRegular(
          "https://api.spotify.com/v1/me/player/play",
          this.token
        );
        return await this.activatePlayHelper(seenTracks);
      } catch (_) {
        return await this.activatePlayHelper(seenTracks);
      }
    }
  };

  pause = async seenTracks => {
    const img = await this.apiGetTrackImage(this.token);
    await this.apiPutRegular(
      "https://api.spotify.com/v1/me/player/pause",
      this.token
    );
    const seen = this.initSeen ? this.state.seenTracks : seenTracks;
    seen[img[3]] = true;
    return {
      trackData: img,
      seen: seen
    };
  };
}
