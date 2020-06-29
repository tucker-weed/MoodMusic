import AsyncStorage from "@react-native-community/async-storage";

/**
 * Stores a json object as a string
 *
 * @param key - the key to apply to the local storage
 * @param value - a json object, to be parsed as a string and stored
 */
export const setData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log("SAVING ERROR: " + e);
  }
};

/**
 * Gets a string from the local storage, and parses it as a json object
 *
 * @param key - the key to apply to the local storage
 * @returns - a json object representing the stored value
 */
export const getData = async key => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log("READING ERROR: " + e);
  }
};

/**
 * Gets a string from the local storage, and parses it as a json object
 *
 * @param key - the key to apply to the local storage
 */
export const removeValue = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.log("REMOVE ERROR: " + e);
  }
};

/**
 * Clears the local storage
 */
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.log("CLEAR ERROR: " + e);
  }
};
