import PriorityQueue from "./PriorityQueue.js";

export default class TrackFrequencyFilter {
  constructor(data) {
    this.data = data;
  }

  getTopQueryTracks = async () => {
    const tracks = this.data["tracks"];
    const keys = Object.keys(tracks);
    const total = this.data["playlists"];
    const pq = new PriorityQueue("count");

    for (let i = 0; i < keys.length; i++) {
      tracks[keys[i]]["ref_id"] = keys[i];
      pq.enqueue(tracks[keys[i]]);
    }

    const output = {};
    for (let i = 0; i < keys.length; i++) {
      const track = pq.dequeue();
      if (track && track["count"] >= 5) {
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
