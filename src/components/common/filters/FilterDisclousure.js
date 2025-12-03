import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../theme/theme';

const FilterDisclosure = ({
    title,
    children,
    isCollapsed = false,
    previewContent,
    isLast = false
}) => {
    const [isOpen, setIsOpen] = useState(!isCollapsed);

    return (
        <View style={[
            styles.disclosureContainer,
            isLast && styles.disclosureContainerLast
        ]}>
            <TouchableOpacity
                style={styles.disclosureButton}
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={0.7}
                accessibilityLabel={`${title} filter`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
            >
                <View style={styles.disclosureHeader}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.disclosureTitle}>{title}</Text>
                        {!isOpen && previewContent && (
                            <Text style={styles.previewText} numberOfLines={1}>
                                {previewContent}
                            </Text>
                        )}
                    </View>
                    <Icon
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={COLORS.textSecondary}
                    />
                </View>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.disclosureContent}>
                    {children}
                </View>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    disclosureContainer: {},
    disclosureHeader: {},
    titleContainer: {},
    disclosureTitle: {},
    previewText: {},
    disclosureButton: {},
    disclosureContent: {},
    disclosureContainerLast: {},
})
export default FilterDisclosure;