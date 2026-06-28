import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

type Props = {
  rating: number;
  onChange: (value: number) => void;
  max?: number;
};

export default function StarRating({ rating, onChange, max = 10 }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)} style={styles.starBtn} activeOpacity={0.7}>
            <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>{rating > 0 ? `${rating} / ${max}` : 'No rating'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  starBtn: {
    padding: 4,
  },
  star: {
    fontSize: 24,
    color: Colors.border,
  },
  starActive: {
    color: '#f59e0b',
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
