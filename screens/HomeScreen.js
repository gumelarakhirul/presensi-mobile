import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "http://10.1.14.35:8080/api/presensi";

export default function HomeScreen() {
  const { userData } = useContext(AuthContext);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState("Memuat jam ...");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);

  const noteInputRef = useRef(null);

  const attendanceStats = useMemo(() => {
    return {
      totalPresent,
      totalAbsent,
    };
  }, [totalPresent, totalAbsent]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);

    fetchStats();

    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/history/${userData.nim_mhs}?page=0&size=200`
      );

      const result = await response.json();
      const list = result.content || [];

      setTotalPresent(list.filter((item) => item.status === "Present").length);
      setTotalAbsent(list.filter((item) => item.status === "Absent").length);
    } catch (error) {
      console.log("ERROR STATS:", error.message);
    }
  };

  const handleCheckIn = async () => {
    if (isCheckedIn) {
      Alert.alert("Perhatian", "Anda sudah Check In.");
      return;
    }

    if (note.trim() === "") {
      Alert.alert("Peringatan", "Catatan kehadiran wajib diisi!");
      noteInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);

      const now = new Date();

      const payload = {
        kodeMk: "TRPL205",
        course: "Mobile Programming",
        date: now.toISOString().split("T")[0],
        jamPresensi: now.toTimeString().split(" ")[0],
        pertemuanKe: 6,
        status: "Present",
        nimMhs: userData.nim_mhs,
        ruangan: "Lab Komputer 3",
        dosenPengampu: "Tim Dosen TRPL",
      };

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan presensi");
      }

      const result = await response.json();

      setIsCheckedIn(true);
      setNote("");
      await fetchStats();

      Alert.alert(
        "Sukses",
        `Berhasil Check In pada pukul ${currentTime}\nID Presensi: ${result.id}`
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Attendance App</Text>
          <Text style={styles.clockText}>{currentTime}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="person" size={40} color="#555" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{userData.nama}</Text>
            <Text style={styles.infoText}>NIM : {userData.nim_mhs}</Text>
            <Text style={styles.infoText}>Class : Informatika-2B</Text>
          </View>
        </View>

        <View style={styles.classCard}>
          <Text style={styles.subtitle}>Today's Class</Text>
          <Text style={styles.classText}>Mobile Programming</Text>
          <Text style={styles.classDetail}>08:00 - 10:00</Text>
          <Text style={styles.classDetail}>Lab 3</Text>

          {!isCheckedIn && (
            <TextInput
              ref={noteInputRef}
              style={styles.inputCatatan}
              placeholder="Tulis catatan (cth: Hadir lab)"
              value={note}
              onChangeText={setNote}
            />
          )}

          <TouchableOpacity
            style={[
              styles.button,
              isCheckedIn ? styles.buttonDisabled : styles.buttonActive,
            ]}
            onPress={handleCheckIn}
            disabled={isCheckedIn || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isCheckedIn ? "CHECKED IN" : "CHECK IN"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{attendanceStats.totalPresent}</Text>
            <Text style={styles.statLabel}>Total Present</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: "red" }]}>
              {attendanceStats.totalAbsent}
            </Text>
            <Text style={styles.statLabel}>Total Absent</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  content: { padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  clockText: { fontSize: 16, color: "#666", fontWeight: "600" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  infoText: { fontSize: 14, color: "#666", marginTop: 2 },
  classCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  classText: { fontSize: 16, color: "#444", marginBottom: 4 },
  classDetail: { fontSize: 14, color: "#777", marginBottom: 2 },
  inputCatatan: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    backgroundColor: "#FAFAFA",
  },
  button: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonActive: { backgroundColor: "#1565C0" },
  buttonDisabled: { backgroundColor: "#A0A0A0" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#2E7D32" },
  statLabel: { fontSize: 14, color: "#777", marginTop: 5 },
});