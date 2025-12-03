import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../theme/theme';

const CheckBoxFilter = ({ options, filterId, value, onChange }) => {
    const isChecked = (id) => value.includes(id);

    const toggle = (id) => {
        const next = isChecked(id) 
            ? value.filter(x => x !== id) 
            : [...value, id];
        onChange(next);
    };

    return (
        <View style={styles.container}>
            {options.map((option) => {
                const checked = isChecked(option.id);

                return (
                    <TouchableOpacity
                        key={option.id}
                        style={styles.optionContainer}
                        onPress={() => toggle(option.id)}
                        activeOpacity={0.7}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                    >
                        <View style={styles.checkboxWrapper}>
                            <View style={[
                                styles.checkbox,
                                checked && styles.checkboxChecked
                            ]}>
                                {checked && (
                                    <Icon
                                        name="checkmark"
                                        size={12}
                                        color={COLORS.white}
                                    />
                                )}
                            </View>
                        </View>

                        <Text style={styles.label}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const checkboxStyles = StyleSheet.create({
    container: {
        gap: 12,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    checkboxWrapper: {
        width: 18,
        height: 18,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    label: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
        flex: 1,
    },
});
const styles = checkboxStyles;
export default CheckBoxFilter;

