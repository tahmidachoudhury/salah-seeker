import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { router } from "expo-router";
import { spacing } from "@/components/ui/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (email.indexOf("@") === -1) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/add-listing"); // Navigate to the map screen after login
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    }
  };

  return (
    <View style={styles.container}>
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
      <Button title="Login" onPress={handleLogin} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, flex: 1, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
  },
  error: { color: "red", marginTop: spacing.md },
});
