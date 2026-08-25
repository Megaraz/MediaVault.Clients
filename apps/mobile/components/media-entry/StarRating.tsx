import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MAXIMUM_RATING, RATING_STEP, isValidRating } from '@mediavault/client-core';
import { Colors } from '../../constants/theme';

type Props = {
  rating: number;
  onChange: (value: number) => void;
};

function displayRating(rating: number): number {
  return isValidRating(rating) ? rating : 0;
}

export default function StarRating({ rating, onChange }: Props) {
  const normalizedRating = displayRating(rating);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {Array.from({ length: MAXIMUM_RATING }, (_, index) => {
          const starValue = index + 1;
          const fillPercentage = Math.max(0, Math.min((normalizedRating - index) * 100, 100));
          const halfValue = starValue - RATING_STEP;

          return (
            <View key={starValue} style={styles.starControl}>
              <Text accessible={false} style={styles.star}>★</Text>
              <View pointerEvents="none" style={[styles.starFill, { width: `${fillPercentage}%` }]}>
                <Text accessible={false} style={[styles.star, styles.starActive]}>★</Text>
              </View>
              <View style={styles.starTargets}>
                <TouchableOpacity
                  style={styles.halfStarTarget}
                  onPress={() => onChange(halfValue)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityLabel={`Set rating to ${halfValue.toFixed(1)} stars`}
                  accessibilityState={{ selected: normalizedRating === halfValue }}
                />
                <TouchableOpacity
                  style={styles.halfStarTarget}
                  onPress={() => onChange(starValue)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityLabel={`Set rating to ${starValue.toFixed(1)} stars`}
                  accessibilityState={{ selected: normalizedRating === starValue }}
                />
              </View>
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onChange(0)}
          activeOpacity={0.7}
          accessibilityRole="radio"
          accessibilityLabel="Clear rating"
          accessibilityState={{ selected: normalizedRating === 0 }}
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label} accessibilityLiveRegion="polite">
        {normalizedRating > 0 ? `${normalizedRating.toFixed(1)} / ${MAXIMUM_RATING.toFixed(1)}` : 'No rating'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  stars: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 3 },
  starControl: { width: 31, height: 41, position: 'relative', justifyContent: 'center' },
  star: { fontSize: 31, color: Colors.border },
  starFill: { position: 'absolute', overflow: 'hidden', height: 41, justifyContent: 'center' },
  starActive: { color: '#f59e0b' },
  starTargets: { ...StyleSheet.absoluteFill, flexDirection: 'row' },
  halfStarTarget: { flex: 1 },
  clearButton: { paddingHorizontal: 8, paddingVertical: 8 },
  clearText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  label: { fontSize: 16, color: Colors.textSecondary, marginLeft: 4 },
});
