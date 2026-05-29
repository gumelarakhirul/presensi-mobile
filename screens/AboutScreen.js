import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

export default function AboutScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [isCameraOpen, setIsCameraOpen] =
    useState(false);

  const [mahasiswa, setMahasiswa] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const cameraRef = useRef(null);

  const NIM_USER = "0920240027";

  const BASE_URL =
    "http://172.20.10.2:8080/api/mahasiswa";

  // Load data mahasiswa
  useEffect(() => {
    fetchMahasiswa();
  }, []);

  // GET mahasiswa
  const fetchMahasiswa = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/${NIM_USER}`
      );

      if (response.ok) {
        const data = await response.json();

        setMahasiswa(data);
      } else {
        Alert.alert(
          "Data Tidak Ditemukan",
          "NIM belum ada di database."
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Ambil foto
  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.3,
        });

      uploadPhoto(photo.uri);
    } catch (error) {
      Alert.alert(
        "Error",
        "Gagal mengambil foto."
      );
    }
  };

  // Upload foto
  const uploadPhoto = async (uri) => {
    setIsLoading(true);

    const formData = new FormData();

    formData.append("nim", NIM_USER);

    formData.append(
      "nama",
      "Gumelar A.R"
    );

    formData.append("foto", {
      uri: uri,
      name: "selfie.jpg",
      type: "image/jpeg",
    });

    try {
    const response = await fetch(
      `${BASE_URL}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

      if (response.ok) {
        Alert.alert(
          "Sukses",
          "Foto profil berhasil upload!"
        );

        fetchMahasiswa();
      } else {
        Alert.alert(
          "Gagal",
          "Upload foto gagal."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Gagal upload ke server."
      );
    } finally {
      setIsLoading(false);
      setIsCameraOpen(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1 }}
      />
    );
  }

  // Render kamera
  if (isCameraOpen) {
    if (!permission) {
      return (
        <View style={styles.container}>
          <Text>Memuat permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.infoText}>
            Kami membutuhkan akses kamera.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>
              Beri Izin Kamera
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="front"
          ref={cameraRef}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Text style={styles.captureButtonText}>
                Ambil & Kirim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setIsCameraOpen(false)
              }
            >
              <Text style={styles.cancelText}>
                Batal
              </Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Render halaman About
  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Image
          source={
            mahasiswa?.fotoMhs
              ? {
                  uri:
                    `data:image/jpeg;base64,${mahasiswa.fotoMhs}`,
                }
              : {
                  uri:
                    "https://i.pravatar.cc/150?img=3",
                }
          }
          style={styles.profileImage}
        />

        <Text style={styles.nameText}>
          {mahasiswa?.namaMhs ||
            "Gumelar A.R"}
        </Text>

        <Text style={styles.nimText}>
          {NIM_USER}
        </Text>

        <Text style={styles.programText}>
          Teknologi Rekayasa Perangkat Lunak
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            setIsCameraOpen(true)
          }
        >
          <Text style={styles.buttonText}>
            Ganti Foto Selfie
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    backgroundColor: "white",
    width: "85%",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#0056A3",
    marginBottom: 20,
  },

  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },

  nimText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },

  programText: {
    fontSize: 14,
    color: "#0056A3",
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#0056A3",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  cameraOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  captureButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    marginBottom: 20,
  },

  captureButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },

  cancelText: {
    color: "white",
    marginBottom: 20,
  },

  infoText: {
    textAlign: "center",
    marginBottom: 20,
  },
});