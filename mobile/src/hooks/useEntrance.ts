import { useEffect, useRef } from "react"
import { Animated } from "react-native"

export function useEntrance(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return { opacity, translateY }
}

export function usePressScale(to = 0.96) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, tension: 200, friction: 10 }).start()

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start()

  return { scale, onPressIn, onPressOut }
}
