import {
  apiGet,
  apiPutTracks,
  apiGetPlayingData,
  apiPost,
  apiPutNewPlaylist,
  apiPutNav,
  apiPut,
  apiGetContextUri
} from "./APIfunctions.js";

export default class PlayerController {
  constructor(seen, stats, token) {
    this.initSeen = seen;
    this.state = stats;
    this.token = token;
  }

  updateRadioHistory = async (oldHist, playlistId) => {
    const { playlistName, artistLikes, trackLikes, seenTracks } = this.state;
    const response = await apiGet(
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
    return radioHistory;
  };

  toggleShuffle = async () => {
    const url =
      "https://api.spotify.com/v1/me/player/shuffle?state=" +
      !this.state.shuffle;
    await apiPut(url, this.token);
  };

  createPlaylist = async userId => {
    const { playlistName } = this.state;
    const playlistUrl =
      "https://api.spotify.com/v1/users/" + userId + "/playlists";
    const response = await apiPutNewPlaylist(
      playlistUrl,
      this.token,
      playlistName
    );
    const trackUrl =
      "https://api.spotify.com/v1/playlists/" + response.data.id + "/tracks";
    const uriList = [];
    for (let i = 0; i < this.state.trackLikes.length; i++) {
      uriList.push("spotify:track:" + this.state.trackLikes[i]);
    }
    await apiPutTracks(trackUrl, this.token, uriList);
  };

  next = async savedSeen => {
    await apiPost("https://api.spotify.com/v1/me/player/next", this.token);
    let nameTracker = this.state.songName;
    let trackimg;
    while (this.state.songName && nameTracker === this.state.songName) {
      trackimg = await apiGetPlayingData(this.token);
      nameTracker = trackimg["songName"];
    }
    const seen = this.initSeen ? this.state.seenTracks : savedSeen;
    seen[trackimg["trackPlaying"]] = true;
    return {
      trackData: trackimg,
      seen: seen
    };
  };

  back = async savedSeen => {
    await apiPost("https://api.spotify.com/v1/me/player/previous", this.token);
    let nameTracker = this.state.songName;
    let trackimg;
    while (this.state.songName && nameTracker === this.state.songName) {
      trackimg = await apiGetPlayingData(this.token);
      nameTracker = trackimg["songName"];
    }
    const seen = this.initSeen ? this.state.seenTracks : savedSeen;
    seen[trackimg["trackPlaying"]] = true;
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
      const response1 = await apiGet(songsUrl1, this.token);
      const songs = [];
      songs.push(...response1.data.tracks);
      if (trackLikes.length > 50) {
        const songsUrl2 =
          "https://api.spotify.com/v1/tracks/?ids=" +
          trackLikes.slice(50, 100).join(",") +
          "&market=from_token";
        const response2 = await apiGet(songsUrl2, this.token);
        songs.push(...response2.data.tracks);
      }
      return {
        songs: songs,
        trackLikes: trackLikes,
        artistLikes: artistLikes
      };
    }
  };

  play = async (id, seenTracks) => {
    const uri = await apiGetContextUri(this.token);
    if (
      this.state.navigated ||
      uri === "spotify:user:12168726728:playlist:" + id
    ) {
      await apiPut("https://api.spotify.com/v1/me/player/play", this.token);
      let playData;
      for (let i = 0; i < 3; i++) {
        playData = await apiGetPlayingData(this.token);
      }
      const seen = this.initSeen ? this.state.seenTracks : seenTracks;
      seen[playData["trackPlaying"]] = true;
      return {
        trackData: playData,
        seen: seen
      };
    } else {
      await apiPutNav(
        "https://api.spotify.com/v1/me/player/play",
        this.token,
        id
      );
      await apiPut("https://api.spotify.com/v1/me/player/play", this.token);
      let playData;
      for (let i = 0; i < 3; i++) {
        playData = await apiGetPlayingData(this.token);
      }
      const seen = this.initSeen ? this.state.seenTracks : seenTracks;
      seen[playData["trackPlaying"]] = true;
      return {
        trackData: playData,
        seen: seen
      };
    }
  };

  pause = async seenTracks => {
    let img;
    for (let i = 0; i < 3; i++) {
      img = await apiGetPlayingData(this.token);
    }
    await apiPut("https://api.spotify.com/v1/me/player/pause", this.token);
    const seen = this.initSeen ? this.state.seenTracks : seenTracks;
    seen[img["trackPlaying"]] = true;
    return {
      trackData: img,
      seen: seen
    };
  };
}
