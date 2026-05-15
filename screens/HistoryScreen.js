import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "http://10.49.227.175:8080/api/presensi";

export default function HistoryScreen({ navigation }) {
  const { userData } = useContext(AuthContext);

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getHistory = async (pageNumber = 0, isRefresh = false) => {
    if (loading) return;
    if (!isRefresh && last) return;

    try {
      setLoading(true);

      const url = `${BASE_URL}/history/${userData.nim_mhs}?page=${pageNumber}&size=10`;
      console.log("GET:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Gagal mengambil data presensi");
      }

      const result = await response.json();

      if (pageNumber === 0) {
        setHistory(result.content || []);
      } else {
        setHistory((prevData) => [...prevData, ...(result.content || [])]);
      }

      setPage(pageNumber);
      setLast(result.last);
    } catch (error) {
      console.log("ERROR HISTORY:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getHistory(0, true);
  }, []);

  const loadMoreData = () => {
    if (!loading && !last) {
      getHistory(page + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLast(false);
    getHistory(0, true);
  }, []);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Detail", { data: item })}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.course}>{item.course}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>

        <Text
          style={
            item.status === "Present"
              ? styles.present
              : item.status === "Late"
              ? styles.late
              : styles.absent
          }
        >
          {item.status}
        </Text>

        <MaterialIcons
          name="chevron-right"
          size={24}
          color="#999"
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#0056A0" />
              <Text style={styles.loaderText}>Memuat riwayat lama ...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>Tidak ada riwayat.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  course: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  present: {
    color: "green",
    fontWeight: "bold",
    marginRight: 5,
  },
  late: {
    color: "#F59E0B",
    fontWeight: "bold",
    marginRight: 5,
  },
  absent: {
    color: "red",
    fontWeight: "bold",
    marginRight: 5,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loaderText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#999",
  },
});