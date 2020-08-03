import axios from "axios";

/* GET functions */

/**
 * Requests information based on url and gives a response
 *
 * @param url - the url of the spotify api with a given endpoint
 * @returns - a json object being the api response, or an error
 */
export const apiGet = async (url, token) => {
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const apiGetContextUri = async token => {
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

export const apiGetPlaylists = async (query, offset, token) => {
  const url =
    "https://api.spotify.com/v1/search?q=" +
    query.split(' ').join('+') +
    "&type=playlist&limit=50&offset=" +
    offset +
    "&market=from_token";
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

export const getPlaylistTracks = async (pid, token) => {
  const url =
    "https://api.spotify.com/v1/playlists/" +
    pid +
    "/tracks?limit=100&market=from_token";
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

export const apiGetPlayingData = async token => {
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
    return {
      current: response.data.item.album.images[0].url,
      songName: response.data.item.name,
      artistPlaying: response.data.item.album.artists[0].id,
      trackPlaying: response.data.item.id,
      trackDuration: response.data.item.duration_ms,
      tPos: response.data.progress_ms
    };
  } else {
    return {
      current: "",
      songName: "",
      artistPlaying: "",
      trackPlaying: "",
      trackDuration: "",
      tPos: ""
    };
  }
};

/* PUT functions */

export const apiPutTracks = async (url, token, trackIds) => {
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

export const apiPutNewPlaylist = async (url, token, name) => {
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

export const apiPutNav = async (url, token, id) => {
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

export const apiPut = async (url, token) => {
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

/* POST functions */

export const apiPost = async (url, token) => {
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
