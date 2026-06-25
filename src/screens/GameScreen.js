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
const SPAWN_INTERVAL = 1500;
const DURATION = 5000;

const createPlate = (id, direction) => {
  const startY = 80 + Math.random() * (height - 220);
  return {
    id,
    direction,
    startY,
    animatedValue: new Animated.Value(0),
    hitAnim: new Animated.Value(0),
    hit: false,
    visible: true,
  };
};

const GameScreen = () => {
  const [plates, setPlates] = useState([]);
  const [score, setScore] = useState(0);
  const nextId = useRef(1);
  const spawnTimer = useRef(null);

  const plateSource = useMemo(
    () => require('../../assets/plate-isolated-3d-render-icon-illustration-png.webp'),
    []
  );

  useEffect(() => {
    const spawnPlate = () => {
      const direction = Math.random() > 0.5 ? 'left' : 'right';
      const id = nextId.current++;
      const plate = createPlate(id, direction);

      setPlates(current => [...current, plate]);

      Animated.timing(plate.animatedValue, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true,
      }).start(() => {
        setPlates(currentPlates => currentPlates.filter(item => item.id !== id));
      });
    };

    spawnPlate();
    spawnTimer.current = setInterval(spawnPlate, SPAWN_INTERVAL);

    return () => {
      if (spawnTimer.current) {
        clearInterval(spawnTimer.current);
      }
    };
  }, []);

  const handleHit = id => {
    setPlates(current => current.filter(item => item.id !== id));
    setScore(prev => prev + 1);
  };

  const renderPlate = plate => {
    if (!plate.visible) return null;

    const startX = plate.direction === 'left' ? -PLATE_SIZE : width + PLATE_SIZE;
    const endX = plate.direction === 'left' ? width + PLATE_SIZE : -PLATE_SIZE;

    const translateX = plate.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startX, endX],
    });

    const translateY = plate.animatedValue.interpolate({
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
            transform: [{ translateX }, { translateY }, { scale: hitScale }],
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

      <View style={styles.gameArea}>{plates.map(renderPlate)}</View>

      
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
  gameArea: {
    flex: 1,
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
