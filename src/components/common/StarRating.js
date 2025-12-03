import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SHADOWS} from '../../theme/theme';

const StarRating = ({
  rating,
  maxStars = 5,
  color = COLORS.board,
  size = 16,
  showValue = false,
  layout = "horizontal",
  mode = "default",
}) => {
  const renderStar = (index) => {
    if (mode === "filter") {
      return index < rating ? "star" : "star-outline";
    } else {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      if (index < fullStars) return "star";
      if (index === fullStars && hasHalfStar) return "star-half";
      return "star-outline";
    }
  };

  const stars = Array.from({ length: maxStars }, (_, i) => (
    <Icon
      key={i}
      name={renderStar(i)}
      size={size}
      color={color}
      style={styles.star}
    />
  ));

  if (layout === "vertical") {
    return (
      <View style={styles.verticalContainer}>
        {showValue && (
          <Text style={[styles.ratingValue, styles.verticalValue]}>
            {rating.toFixed(1)}
          </Text>
        )}
        <View style={styles.starsContainer}>
          {stars}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.horizontalContainer}>
      <View style={styles.starsContainer}>
        {stars}
      </View>
      {showValue && (
        <Text style={[styles.ratingValue, styles.horizontalValue, { fontSize: size - 2 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 1,
  },
  ratingValue: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  horizontalValue: {
    
    fontSize: FONTS.small,
  },
  verticalValue: {
    fontSize: FONTS.h1,
    
  },
});

export default StarRating;