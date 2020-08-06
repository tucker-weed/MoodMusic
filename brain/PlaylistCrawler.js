import { apiGetPlaylists, getPlaylistTracks } from "./APIfunctions.js";
import PriorityQueue from "./PriorityQueue.js";

export default class PlaylistCrawler {
  constructor(pop1, pop2, min_count) {
    this._pop1 = pop1;
    this._pop2 = pop2;
    this._data = {
      playlists: 0,
      ntracks: 0,
      offset: -1,
      tracks: {},
      pNames: {}
    };
    this._max_playlists = 250;
    this._max_tracks = 175;
    this._min_count = min_count;
    this._is_playlist_min = 50;
  }

  _enoughDataToParse = items => {
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

  _processPlaylist = async (playlist, token) => {
    const tracks = this._data["tracks"];
    const names = this._data["pNames"];
    const pid = playlist["id"];
    this._data["playlists"] += 1;

    let offset = 0;
    let nTracksCurrent = 0;
    let results = await getPlaylistTracks(pid, offset, token);

    while (results && nTracksCurrent < this._max_tracks) {
      if (results["items"] && this._enoughDataToParse(results["items"])) {
        names[playlist["id"]] = playlist["name"];
        for (let i = 0; i < results["items"].length; i++) {
          const track = results["items"][i]["track"];
          if (
            track &&
            track["id"] &&
            track["popularity"] >= this._pop1 &&
            track["popularity"] <= this._pop2
          ) {
            if (!tracks[track["id"]]) {
              tracks[track["id"]] = {
                title: track["name"],
                artist: track["artists"][0]["name"],
                count: 0
              };
            }
            tracks[track["id"]]["count"] += 1;
            nTracksCurrent += 1;
            this._data["ntracks"] += 1;
          }
        }
      } else {
        console.log("processPlaylist: playlist skipped");
      }
      if (results["next"] && nTracksCurrent < this._max_tracks) {
        offset = results["offset"] + results["limit"];
        const newResults = await getPlaylistTracks(pid, offset, token);
        results = newResults["playlists"];
      } else {
        results = null;
      }
    }
  };

  loadExistingData = data => {
    this._data = data;
  };

  crawlPlaylists = async (queries, token) => {
    for (let i = 0; i < queries.length; i++) {
      const offset = this._data["offset"] < 0 ? 0 : this._data["offset"] + 50;
      const results = await apiGetPlaylists(queries[i], offset, token);
      let playlists = results["playlists"];
      const underLimit = () => {
        return this._data["playlists"] < this._max_playlists;
      };

      while (playlists && underLimit()) {
        this._data["offset"] = playlists["offset"] + playlists["limit"];
        for (let k = 0; k < playlists["items"].length && underLimit(); k++) {
          if (
            !this._data["pNames"][playlists["items"][k]["id"]] &&
            playlists["items"][k]["tracks"]["total"] >= this._is_playlist_min
          ) {
            await this._processPlaylist(playlists["items"][k], token);
          }
        }
        if (playlists["next"]) {
          const newResults = await apiGetPlaylists(
            queries[i],
            this._data["offset"],
            token
          );
          playlists = newResults["playlists"];
        } else {
          playlists = null;
        }
      }
    }
    return this._data;
  };

  getTopQueryTracks = async (freq1, freq2) => {
    const tracks = this._data["tracks"];
    const keys = Object.keys(tracks);
    //const total = this._data["playlists"];
    const pq = new PriorityQueue("count", true);

    for (let i = 0; i < keys.length; i++) {
      if (tracks[keys[i]]["count"] >= this._min_count) {
        tracks[keys[i]]["ref_id"] = keys[i];
        pq.enqueue(tracks[keys[i]]);
      }
    }

    const output = {};
    const savedSize = pq.size();
    for (let i = 0; i < savedSize; i++) {
      const track = pq.dequeue();
      if (track && i > savedSize * freq1 && i < savedSize * freq2) {
        //const idf = Math.log10(total / track["count"]);
        //const ppm = 1000 * track['count'] / total;
        output[track["ref_id"]] = true; //idf;
      }
    }

    //output['backoff_probability'] = 1000 / total;
    // ** output["backoff_idf"] = Math.log10((total * 2) / 1);
    return output;
  };
}
