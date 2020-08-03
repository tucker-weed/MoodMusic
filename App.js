import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import HomeScreen from "./pages/HomeScreen.js";
import SpotifyLogin from "./pages/SpotifyLogin.js";
import MoodHome from "./pages/MoodHome.js";
import PlaylistCreator from "./pages/PlaylistCreator.js";
import PlaylistQuerier from "./pages/PlaylistQuerier.js";
import PlaylistResults from "./pages/PlaylistResults.js";
import QueryTrackLoader from "./pages/QueryTrackLoader.js";
import SongPlayer from "./pages/SongPlayer.js";

const Stack = createStackNavigator();

function MainStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            title: "Mood Music",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
        <Stack.Screen
          name="SpotifyLogin"
          component={SpotifyLogin}
          options={{
            title: "Spotify Login",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
        <Stack.Screen
          name="MoodHome"
          component={MoodHome}
          options={{
            title: "User Playlists",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
        <Stack.Screen
          name="PlaylistCreator"
          component={PlaylistCreator}
          options={{
            title: "Playlist Mixer",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
        <Stack.Screen
          name="PlaylistQuerier"
          component={PlaylistQuerier}
          options={{
            title: "Query Engine",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
        <Stack.Screen
          name="PlaylistResults"
          component={PlaylistResults}
          options={{
            title: "Generated Playlist",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
        <Stack.Screen
          name="SongPlayer"
          component={SongPlayer}
          options={{
            title: "Player",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
        <Stack.Screen
          name="QueryTrackLoader"
          component={QueryTrackLoader}
          options={{
            title: "Track Loader",
            headerStyle: { backgroundColor: "#008080" },
            headerTintColor: "white"
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainStackNavigator;
