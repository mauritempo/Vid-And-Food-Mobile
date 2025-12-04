import React, { memo } from 'react'; 
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import StarRating from '../common/StarRating'
import { COLORS, FONTS } from '../../theme/theme';
import { getOptimizedImageUrl }  from '../../utils/imageUtils'

function WineCard({ wine, onPress, style }) {
  const optimizedUrl = getOptimizedImageUrl(wine.imageUrl, 400);
  const formattedPrice = wine.price
    ? `$${wine.price.toLocaleString('es-AR')}`
    : "Consultar";

  const wineryName = wine.wineryName || "Bodega Desconocida";
  const rating = wine.averageScore || 0;
  const ratingText = rating > 0 ? rating.toFixed(1) : "-";

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: optimizedUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formattedPrice}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.winery} numberOfLines={1}>
          {wineryName.toUpperCase()}
        </Text>

        <Text style={styles.name} numberOfLines={2}>
          {wine.name}
        </Text>

        <View style={styles.separator} />

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <StarRating rating={rating} size={12} />
            <Text style={styles.ratingText}>({ratingText})</Text>
          </View>

          {wine.vintageYear && (
            <Text style={styles.yearText}>{wine.vintageYear}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
    overflow: 'visible',
  },
  imageContainer: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: COLORS.lightGray || '#f4f4f4',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textPrimary || '#333',
  },
  content: {
    padding: 12,
  },
  winery: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary || '#888',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.textPrimary || '#222',
    lineHeight: 20,
    height: 40,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary || '#999',
  },
  yearText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary || '#888',
  }
});

export default memo(WineCard);