import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AboutScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const cameraRef = useRef(null);

  const STORAGE_KEY = "@profile_photo";

  // Load foto dari AsyncStorage
  useEffect(() => {
    loadProfilePhoto();
  }, []);

  const loadProfilePhoto = async () => {
    try {
      const savedPhotoUri = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedPhotoUri !== null) {
        setProfilePhoto(savedPhotoUri);
      }
    } catch (error) {
      console.log("Gagal memuat foto profil:", error);
    }
  };

  // Ambil foto
  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });

      setProfilePhoto(photo.uri);

      await AsyncStorage.setItem(STORAGE_KEY, photo.uri);

      setIsCameraOpen(false);

      Alert.alert("Berhasil", "Foto profil berhasil diperbarui.");
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil foto.");
    }
  };

  // Buka kamera
  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Izin Ditolak",
          "Aplikasi membutuhkan akses kamera."
        );
        return;
      }
    }

    setIsCameraOpen(true);
  };

  // Render kamera
  if (isCameraOpen) {
    if (!permission) {
      return (
        <View style={styles.container}>
          <Text>Memuat perizinan kamera...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="front"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Text style={styles.captureButtonText}>
                  Jepret
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCameraOpen(false)}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Render halaman profile
  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.imageContainer}>
          {profilePhoto ? (
            <Image
              source={{ uri: profilePhoto }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                Belum Ada Foto
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.nameText}>Agum</Text>
        <Text style={styles.nimText}>NIM: 0920240027</Text>
        <Text style={styles.programText}>
          Teknologi Rekayasa Perangkat Lunak
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={openCamera}
        >
          <Text style={styles.buttonText}>
            {profilePhoto
              ? "Ganti Foto Profil"
              : "Ambil Foto Profil"}
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

  // Profile Card
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

  imageContainer: {
    marginBottom: 20,
  },

  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#0056A3",
  },

  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ced4da",
    borderStyle: "dashed",
  },

  placeholderText: {
    color: "#6c757d",
    fontWeight: "bold",
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

  // Camera
  cameraOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  captureContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 40,
  },

  captureButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },

  captureButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },

  cancelButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
});