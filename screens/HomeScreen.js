import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

const BASE_URL = "http://172.20.10.2:8080/api/presensi";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Loading permission
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Memuat perizinan kamera...</Text>
      </View>
    );
  }

  // Permission belum diberikan
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>
          Aplikasi membutuhkan akses kamera untuk memindai QR Code.
        </Text>

        <TouchableOpacity
          style={styles.buttonRequest}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Aktifkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Saat QR terdeteksi
  const handleBarcodeScanned = ({ data }) => {
    if (!isScanning) return;

    setIsScanning(false);

    try {
      const qrData = JSON.parse(data);
      setScannedData(qrData);

      Alert.alert(
        "QR Code Terdeteksi",
        `Mata Kuliah: ${qrData.kodeMk}\nPertemuan: ${qrData.pertemuanKe}\nRuangan: ${qrData.ruangan}\n\nLanjutkan Check In?`,
        [
          {
            text: "Batal",
            style: "cancel",
            onPress: () => {
              setScannedData(null);
              setIsScanning(true);
            },
          },
          {
            text: "Ya, Check In",
            onPress: () => handleSubmitPresensi(qrData),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "QR Tidak Valid",
        "QR Code harus berisi format JSON."
      );
      setIsScanning(true);
    }
  };

  // Kirim ke API
  const handleSubmitPresensi = async (qrData) => {
    try {
      const now = new Date();

      const payload = {
        kodeMk: qrData.kodeMk,
        course: "Mobile Programming",
        date: now.toISOString().split("T")[0],
        jamPresensi: now.toISOString(),
        pertemuanKe: qrData.pertemuanKe,
        status: "Present",
        nimMhs: userData.nim_mhs,
        ruangan: qrData.ruangan,
        dosenPengampu: "Tim Dosen TRPL",
      };

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          "Berhasil",
          `Presensi berhasil disimpan.\nID: ${result.id}`,
          [
            {
              text: "Lihat Riwayat",
              onPress: () => navigation.navigate("History"),
            },
            {
              text: "OK",
            },
          ]
        );
      } else {
        Alert.alert(
          "Gagal",
          result.message || "Terjadi kesalahan di server."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error Jaringan",
        "Pastikan backend API berjalan."
      );
      console.log(error);
    } finally {
      setScannedData(null);
      setIsScanning(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={
          isScanning ? handleBarcodeScanned : undefined
        }
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />

          <View style={styles.focusedContainer}>
            <View style={styles.borderCornerTopLeft} />
            <View style={styles.borderCornerTopRight} />
            <View style={styles.borderCornerBottomLeft} />
            <View style={styles.borderCornerBottomRight} />
          </View>

          <View style={styles.unfocusedContainer}>
            <Text style={styles.scanText}>
              Arahkan Kamera ke QR Code Dosen
            </Text>

            <Text style={styles.clockText}>{currentTime}</Text>

            {!isScanning && (
              <Button
                title="Scan Lagi"
                onPress={() => setIsScanning(true)}
                color="#ffc107"
              />
            )}
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  infoText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },

  buttonRequest: {
    backgroundColor: "#0056A0",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  unfocusedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  focusedContainer: {
    width: 250,
    height: 250,
    alignSelf: "center",
    position: "relative",
  },

  scanText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },

  clockText: {
    color: "white",
    marginBottom: 20,
  },

  borderCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#007BFF",
  },

  borderCornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: "#007BFF",
  },

  borderCornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#007BFF",
  },

  borderCornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#007BFF",
  },
});