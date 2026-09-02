import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const PLATE_SIZE = 80;
const INITIAL_SPAWN_INTERVAL = 1500;
const INITIAL_DURATION = 5000;
const MIN_SPAWN_INTERVAL = 500;
const MIN_DURATION = 1500;
const DIFFICULTY_INCREASE_PER_POINT = 0.03; 
const TOTAL_LIVES = 4;

const calculateDifficulty = score => {
  return Math.min(1 + score * DIFFICULTY_INCREASE_PER_POINT, 2); 
};

const createPlate = (id, direction, score) => {
  const startY = 80 + Math.random() * (height - 220);
  const difficulty = calculateDifficulty(score);
  const duration = Math.max(
    MIN_DURATION,
    INITIAL_DURATION / difficulty
  );
  
  return {
    id,
    direction,
    startY,
    duration,
    animatedValue: new Animated.Value(0),
    hitAnim: new Animated.Value(0),
    hit: false,
    visible: true,
  };
};

const GameScreen = ({ navigation }) => {
  const [plates, setPlates] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const nextId = useRef(1);
  const spawnTimer = useRef(null);
  const livesRef = useRef(TOTAL_LIVES);
  const activePlates = useRef(new Set());
  const heartAnimations = useRef(
    Array.from({ length: TOTAL_LIVES }, () => new Animated.Value(1))
  ).current;
  const plateSource = useMemo(
    () => require('../../assets/plate-isolated-3d-render-icon-illustration-png.webp'),
    []
  );

  useEffect(() => {
    const difficulty = calculateDifficulty(score);
    const currentSpawnInterval = Math.max(
      MIN_SPAWN_INTERVAL,
      INITIAL_SPAWN_INTERVAL / difficulty
    );

    const spawnPlate = () => {
      if (livesRef.current === 0) return;

      const direction = Math.random() > 0.5 ? 'left' : 'right';
      const id = nextId.current++;
      const plate = createPlate(id, direction, score);
      activePlates.current.add(id);

      setPlates(current => [...current, plate]);

      Animated.timing(plate.animatedValue, {
        toValue: 1,
        duration: plate.duration,
        useNativeDriver: false,
      }).start(() => {
        setPlates(currentPlates => currentPlates.filter(item => item.id !== id));

        if (!activePlates.current.delete(id)) return;
        if (livesRef.current === 0) return;

        const remainingLives = livesRef.current - 1;
        livesRef.current = remainingLives;
        setLives(remainingLives);

        Animated.timing(heartAnimations[remainingLives], {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }).start();

        if (remainingLives === 0 && spawnTimer.current) {
          clearInterval(spawnTimer.current);
          spawnTimer.current = null;
        }

        if (remainingLives === 0) {
          setGameOver(true);
        }
      });
    };

    spawnPlate();
    spawnTimer.current = setInterval(spawnPlate, currentSpawnInterval);

    return () => {
      if (spawnTimer.current) {
        clearInterval(spawnTimer.current);
      }
    };
  }, [score]);

  useEffect(() => {
    if (!gameOver) return undefined;

    const returnTimer = setTimeout(() => {
      navigation.popToTop();
    }, 1800);

    return () => clearTimeout(returnTimer);
  }, [gameOver, navigation]);

  const handleHit = id => {
    if (!activePlates.current.delete(id)) return;

    setPlates(current => current.filter(item => item.id !== id));
    setScore(prev => prev + 1);
  };

  const renderPlate = plate => {
    if (!plate.visible) return null;

    const startX = plate.direction === 'left' ? -PLATE_SIZE : width + PLATE_SIZE;
    const endX = plate.direction === 'left' ? width + PLATE_SIZE : -PLATE_SIZE;

    const left = plate.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startX, endX],
    });

    const top = plate.animatedValue.interpolate({
      inputRange: [0, 0.4, 0.7, 1],
      outputRange: [plate.startY, plate.startY - 140, plate.startY - 80, plate.startY],
    });

    const hitOpacity = plate.hitAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });

    const hitScale = plate.hitAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.75],
    });

    return (
      <Animated.View
        key={plate.id}
        style={[
          styles.plate,
          {
            opacity: hitOpacity,
            left,
            top,
            transform: [{ scale: hitScale }],
          },
        ]}
      >
        <Pressable
          onPress={() => handleHit(plate.id)}
          hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={styles.pressable}
        >
          <Animated.Image
            source={plateSource}
            style={styles.plateImage}
            resizeMode="contain"
          />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/fondojuego.jpeg')}
      resizeMode="cover"
    >
      <View style={styles.hud}>
        <Text style={styles.scoreTitle}>Puntos</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      <View style={styles.livesHud}>
        {heartAnimations.map((opacity, index) => (
          <Animated.Image
            key={index}
            source={require('../../assets/game-heart-pixelated-free-png.webp')}
            style={[styles.heart, { opacity }]}
            resizeMode="contain"
          />
        ))}
      </View>

      <View style={styles.gameArea}>{plates.map(renderPlate)}</View>

      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>PERDISTE</Text>
        </View>
      )}

      
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hud: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    zIndex: 10,
  },
  scoreTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  livesHud: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    zIndex: 10,
  },
  heart: {
    width: 30,
    height: 30,
    marginHorizontal: 2,
  },
  gameArea: {
    flex: 1,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
  gameOverText: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    color: '#ff2020',
    fontSize: 42,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
  },
  plate: {
    position: 'absolute',
    width: PLATE_SIZE,
    height: PLATE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateImage: {
    width: '100%',
    height: '100%',
  },
  instructionBox: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default GameScreen;
