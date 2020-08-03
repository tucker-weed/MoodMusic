import { apiGetPlaylists, getPlaylistTracks } from "./APIfunctions.js";

export default class PlaylistCrawler {
  constructor(pop1, pop2) {
    this.pop1 = pop1;
    this.pop2 = pop2;
    this.max_playlists = 200;
    this.data = {
      playlists: 0,
      ntracks: 0,
      offset: -1,
      tracks: {},
      pNames: {}
    };
  }

  loadExistingData = data => {
    this.data = data;
  };

  enoughDataToParse = items => {
    const artists = [];
    const albums = [];

    for (let i = 0; i < items.length; i++) {
      const track = items[i]["track"];
      if (track && (artists.length < 2 || albums.length < 2)) {
        artists.push(track["artists"][0]["id"]);
        albums.push(track["album"]["id"]);
      }
    }
    return artists.length > 1 && albums.length > 1;
  };

  processPlaylist = async (playlist, token) => {
    const tracks = this.data["tracks"];
    const names = this.data["pNames"];
    const pid = playlist["id"];
    this.data["playlists"] += 1;

    const results = await getPlaylistTracks(pid, token);

    if (results["items"] && this.enoughDataToParse(results["items"])) {
      names[playlist["name"]] = true;
      for (let i = 0; i < results["items"].length; i++) {
        const track = results["items"][i]["track"];
        if (
          track &&
          track["id"] &&
          track["popularity"] > this.pop1 &&
          track["popularity"] < this.pop2
        ) {
          if (!tracks[track["id"]]) {
            tracks[track["id"]] = {
              title: track["name"],
              artist: track["artists"][0]["name"],
              count: 0
            };
          }
          tracks[track["id"]]["count"] += 1;
          this.data["ntracks"] += 1;
        }
      }
    } else {
      console.log("processPlaylist: playlist skipped");
    }
  };

  crawlPlaylists = async (queries, token) => {
    for (let i = 0; i < queries.length; i++) {
      const offset = this.data["offset"] < 0 ? 0 : this.data["offset"] + 50;
      const results = await apiGetPlaylists(queries[i], offset, token);
      let playlists = results["playlists"];
      const underLimit = () => {
        return this.data["playlists"] < this.max_playlists;
      };

      while (playlists && underLimit()) {
        this.data["offset"] = playlists["offset"] + playlists["limit"];
        for (let k = 0; k < playlists["items"].length && underLimit(); k++) {
          if (!this.data["pNames"][playlists["items"][k]["name"]]) {
            await this.processPlaylist(playlists["items"][k], token);
          }
        }
        if (playlists["next"]) {
          const newResults = await apiGetPlaylists(
            queries[i],
            this.data["offset"],
            token
          );
          playlists = newResults["playlists"];
        } else {
          playlists = null;
        }
      }
    }
    return this.data;
  };
}
