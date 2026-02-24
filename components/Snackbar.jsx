import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';

export default function Snackbar({ visible, message, actionText, onAction, onDismiss }) {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        onDismiss && onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 50,
        left: 16,
        right: 16,
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        opacity,
      }}
    >
      <Text style={{ color: 'white', flex: 1 }}>{message}</Text>
      {actionText ? (
        <Pressable onPress={onAction}>
          <Text style={{ color: '#4da6ff', marginLeft: 8 }}>{actionText}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
