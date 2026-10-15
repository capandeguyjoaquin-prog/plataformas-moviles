import React from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const rankingData = [
  { position: 1, name: 'Mia', score: 2450, badge: '👑' },
  { position: 2, name: 'Rex', score: 2320, badge: '🥈' },
  { position: 3, name: 'Luna', score: 2215, badge: '🥉' },
  { position: 4, name: 'Bolt', score: 1980, badge: '⚔️' },
  { position: 5, name: 'Nox', score: 1845, badge: '⭐' },
];

const SettingsScreen = ({ navigation }) => {
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

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {rankingData.map(player => (
            <View
              key={player.position}
              style={[
                styles.rankRow,
                player.position === 1 && styles.firstPlace,
                player.position === 2 && styles.secondPlace,
                player.position === 3 && styles.thirdPlace,
              ]}
            >
              <View style={styles.rankCell}>
                <Text style={styles.rankNumber}>{player.position}</Text>
                <Text style={styles.badge}>{player.badge}</Text>
              </View>

              <Text style={styles.userName}>{player.name}</Text>
              <Text style={styles.score}>{player.score}</Text>
            </View>
          ))}
        </ScrollView>

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
  },
  listContent: {
    gap: 8,
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

export default SettingsScreen;