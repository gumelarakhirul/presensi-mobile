import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";

export default function DetailScreen({ route }) {
  const { data } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{data.course}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Tanggal :</Text>
          <Text style={styles.value}>{data.date}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status :</Text>
          <Text
            style={[
              styles.value,
              data.status === "Present"
                ? styles.present
                : data.status === "Late"
                ? styles.late
                : styles.absent,
            ]}
          >
            {data.status}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ruangan :</Text>
          <Text style={styles.value}>{data.ruangan}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Dosen Pengampu :</Text>
          <Text style={styles.value}>{data.dosenPengampu}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Kode MK :</Text>
          <Text style={styles.value}>{data.kodeMk}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Jam :</Text>
          <Text style={styles.value}>{data.jamPresensi}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Pertemuan :</Text>
          <Text style={styles.value}>{data.pertemuanKe}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: "gray",
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  present: {
    color: "green",
  },
  late: {
    color: "#F59E0B",
  },
  absent: {
    color: "red",
  },
});