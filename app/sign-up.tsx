import { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase"; // make sure you have these exported
import { router } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    // Validate inputs
    if (!email || !password || !username) {
      setError("Please fill in all fields");
      return;
    }

    if (email.indexOf("@") === -1) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 2. Optionally set displayName in Auth profile
      if (username.trim()) {
        await updateProfile(cred.user, { displayName: username.trim() });
      }

      // 3. Create Firestore user doc
      const ref = doc(db, "users", cred.user.uid);
      await setDoc(ref, {
        displayName: username.trim(),
        email: cred.user.email,
        joinedAt: serverTimestamp(),
        role: "user",
      });

      // 4. Navigate to app
      router.replace("/add-listing");
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "An error occurred during sign up");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={() => router.replace("/")}>
        <Text style={{ marginTop: 12, color: "blue", textAlign: "center" }}>
          Already have an account? Login here
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  error: { color: "red", marginTop: 10 },
});
