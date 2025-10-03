// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const saveData = async (key: string, value: any) => {
//   try {
//     await AsyncStorage.setItem(key, JSON.stringify(value));
//   } catch (e) {
//     console.error("Saving error", e);
//   }
// };

// export const loadData = async <T>(key: string): Promise<T | null> => {
//   try {
//     const data = await AsyncStorage.getItem(key);
//     return data ? JSON.parse(data) : null;
//   } catch (e) {
//     console.error("Loading error", e);
//     return null;
//   }
// };
