import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "#000",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  button: {
    backgroundColor: "#2FD566",
    padding: 20
  },
  loadButton: {
    backgroundColor: "#2FD566",
    padding: 4,
  },
  listButton: {
    backgroundColor: "#2FD566",
    padding: 4,
    paddingLeft: 150,
    paddingRight: 150,
  },
  whiteText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  buttonText: {
    color: "#000",
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20
  },
  userInfo: {
    height: 250,
    width: 200,
    alignItems: "center"
  },
  userInfoText: {
    color: "#fff",
    fontSize: 18
  },
  errorText: {
    color: "#fff",
    fontSize: 18
  },
  profileImage: {
    height: 64,
    width: 64,
    marginBottom: 32
  }
});
