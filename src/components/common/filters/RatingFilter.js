import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import StarRating from '../StarRating';
import { COLORS, FONTS, SHADOWS } from '../../../theme/theme';

const RatingFilter = ({
  options,
  filterId,
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionContainer,
              isSelected && styles.optionContainerSelected
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.radioContainer}>
              <View style={[
                styles.radio,
                isSelected && styles.radioSelected
              ]}>
                {isSelected && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>

            <View style={styles.starsContainer}>
              <StarRating
                rating={option.value}
                maxStars={5}
                size={16}
                color={COLORS.board}
                showValue={false}
                layout="horizontal"
                mode="filter"
              />
              <Text style={styles.ratingLabel}>
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({

  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionContainerSelected: {
    backgroundColor: 'rgba(93, 0, 30, 0.05)',
    borderColor: 'rgba(93, 0, 30, 0.2)',
  },
  radioContainer: {
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingLabel: {
    fontSize: FONTS.body,
    color: COLORS.textPrimary,
  },
});

export default RatingFilter;