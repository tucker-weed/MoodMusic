import { apiGetPlaylists, getPlaylistTracks } from "./APIfunctions.js";
import PriorityQueue from "./PriorityQueue.js";

export default class PlaylistCrawler {
  constructor(pop1, pop2) {
    this.pop1 = pop1;
    this.pop2 = pop2;
    this.max_playlists = 250;
    this.max_tracks = 175;
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

    let offset = 0;
    let nTracksCurrent = 0;
    let results = await getPlaylistTracks(pid, offset, token);

    while (results && nTracksCurrent < this.max_tracks) {
      if (results["items"] && this.enoughDataToParse(results["items"])) {
        names[playlist["id"]] = playlist["name"];
        for (let i = 0; i < results["items"].length; i++) {
          const track = results["items"][i]["track"];
          if (
            track &&
            track["id"] &&
            track["popularity"] >= this.pop1 &&
            track["popularity"] <= this.pop2
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
            this.data["ntracks"] += 1;
          }
        }
      } else {
        console.log("processPlaylist: playlist skipped");
      }
      if (results["next"] && nTracksCurrent < this.max_tracks) {
        offset = results["offset"] + results["limit"];
        const newResults = await getPlaylistTracks(pid, offset, token);
        results = newResults["playlists"];
      } else {
        results = null;
      }
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
          if (
            !this.data["pNames"][playlists["items"][k]["id"]] &&
            playlists["items"][k]["tracks"]["total"] >= 50
          ) {
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

  getTopQueryTracks = async unique => {
    const tracks = this.data["tracks"];
    const keys = Object.keys(tracks);
    const total = this.data["playlists"];
    const pq = new PriorityQueue("count", !unique);

    for (let i = 0; i < keys.length; i++) {
      tracks[keys[i]]["ref_id"] = keys[i];
      pq.enqueue(tracks[keys[i]]);
    }

    const output = {};
    for (let i = 0; i < keys.length; i++) {
      const track = pq.dequeue();
      if (track && track["count"] >= 4) {
        const idf = Math.log10(total / track["count"]);
        //const ppm = 1000 * track['count'] / total;
        output[track["ref_id"]] = idf;
      }
    }

    //output['backoff_probability'] = 1000 / total;
    // ** output["backoff_idf"] = Math.log10((total * 2) / 1);
    return output;
  };
}
