import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRanking } from '../services/api';

const PAGE_SIZE = 20;

const RankingScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (offset, replace = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const result = await getRanking(offset, PAGE_SIZE);
      if (!Array.isArray(result)) {
        throw new Error('La respuesta del ranking no es valida');
      }
      setPlayers(current => (replace ? result : [...current, ...result]));
      setHasMore(result.length === PAGE_SIZE);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setPlayers([]);
    setHasMore(true);
    loadPage(0, true);
  }, [loadPage]));

  const renderPlayer = ({ item, index }) => {
    const position = index + 1;
    return (
      <View
        style={[
          styles.rankRow,
          position === 1 && styles.firstPlace,
          position === 2 && styles.secondPlace,
          position === 3 && styles.thirdPlace,
        ]}
      >
        <View style={styles.rankCell}>
          <Text style={styles.rankNumber}>{position}</Text>
          {position <= 3 && <Text style={styles.badge}>{['🥇', '🥈', '🥉'][position - 1]}</Text>}
        </View>
        <Text style={styles.userName} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.score}>{item.puntaje}</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return <ActivityIndicator color="#f6d77a" style={styles.message} />;
    if (error) {
      return (
        <View style={styles.message}>
          <Text style={styles.messageText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadPage(0, true)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      );
    }
    return <Text style={[styles.message, styles.messageText]}>Todavia no hay puntajes.</Text>;
  };

  const renderFooter = () => {
    if (loading && players.length > 0) {
      return <ActivityIndicator color="#f6d77a" style={styles.footer} />;
    }
    if (error && players.length > 0) {
      return (
        <Pressable style={styles.retryButton} onPress={() => loadPage(players.length)}>
          <Text style={styles.retryText}>No se pudo cargar mas. Reintentar</Text>
        </Pressable>
      );
    }
    return null;
  };

  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/fondomadera.jpeg')}
      resizeMode="stretch"
    >
      <View style={styles.overlay} />
      <View style={styles.panel}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Ranking</Text>
          <View style={styles.trophyBadge}>
            <Text style={styles.trophyText}>🏆</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Mejores puntajes del juego</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.colHeader}>#</Text>
          <Text style={styles.colHeaderUser}>Jugador</Text>
          <Text style={styles.colHeader}>Puntaje</Text>
        </View>

        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={players}
          renderItem={renderPlayer}
          keyExtractor={player => String(player.id)}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => {
            if (hasMore && !loadingRef.current && players.length > 0) {
              loadPage(players.length);
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={loading && players.length > 0}
              onRefresh={() => loadPage(0, true)}
              tintColor="#f6d77a"
            />
          }
        />

        <Pressable style={styles.homeButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.homeButtonText}>Volver al inicio</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 12, 8, 0.38)',
  },
  panel: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'rgba(31, 18, 11, 0.82)',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#d08b2c',
    padding: 18,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#f6d77a',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  trophyBadge: {
    width: 42,
    height: 42,
    backgroundColor: '#f5b942',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff3c8',
  },
  trophyText: {
    fontSize: 22,
  },
  subtitle: {
    color: '#f5e7c6',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  colHeader: {
    flex: 1,
    color: '#f7d794',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  colHeaderUser: {
    flex: 2,
    color: '#f7d794',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  list: {
    maxHeight: 340,
    minHeight: 100,
  },
  listContent: {
    gap: 8,
    flexGrow: 1,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  firstPlace: {
    backgroundColor: 'rgba(255, 199, 81, 0.17)',
    borderColor: '#f5b942',
  },
  secondPlace: {
    backgroundColor: 'rgba(196, 206, 214, 0.12)',
    borderColor: '#c7d0d8',
  },
  thirdPlace: {
    backgroundColor: 'rgba(197, 117, 52, 0.14)',
    borderColor: '#d98c3a',
  },
  rankCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    width: 22,
    textAlign: 'center',
  },
  badge: {
    fontSize: 18,
  },
  userName: {
    flex: 2,
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  score: {
    flex: 1,
    color: '#f6d77a',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    paddingVertical: 24,
  },
  messageText: {
    color: '#f5e7c6',
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'center',
    padding: 10,
  },
  retryText: {
    color: '#f6d77a',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
  homeButton: {
    marginTop: 18,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#d98c3a',
    borderWidth: 2,
    borderColor: '#f7d794',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default RankingScreen;
