import React, { useState, useRef } from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CheckBoxFilter from './filters/CheckBoxFilter';
import RangeFilter from './filters/RangeFilter';
import RatingFilter from './filters/RatingFilter';
import FilterDisclosure from './filters/FilterDisclousure';
import { COLORS, FONTS } from '../../theme/theme';

const GenericSidebarFilter = ({
    filters,
    title = "Filtros",
    maxVisibleFilters,
    value,
    defaultValue,
    onChange,
    onFilterChange,
    onClose,  
    onResetAll, 
    rangeDebounceMs = 300,
}) => {
    const isControlled = value != null;
    const [internal, setInternal] = useState(defaultValue || {});
    const filterValues = isControlled ? value : internal;
    const [showAllFilters, setShowAllFilters] = useState(false);
    const debounceRef = useRef(null);

    const shouldLimitFilters = !!maxVisibleFilters && maxVisibleFilters > 0 && filters.length > maxVisibleFilters;
    const visibleFilters = shouldLimitFilters && !showAllFilters ? filters.slice(0, maxVisibleFilters) : filters;
    const hiddenFilterCount = shouldLimitFilters ? filters.length - (maxVisibleFilters || 0) : 0;

    const emit = (next, opts = {}) => {
        if (!isControlled) setInternal(next);
        if (opts.isRange && rangeDebounceMs > 0) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => onChange?.(next), rangeDebounceMs);
        } else {
            onChange?.(next);
        }
    };

    const update = (filterId, nextValue, opts = {}) => {
        const next = { ...filterValues, [filterId]: nextValue };
        onFilterChange?.(filterId, nextValue);
        emit(next, opts);
    };

    const getPreviewContent = (filter) => {
        const val = filterValues[filter.id];
        if (!val) return "";
        if (filter.type === "range") return "Rango seleccionado"; 
        if (Array.isArray(val) && val.length > 0) return `${val.length} seleccionados`;
        return "";
    };

    const renderFilterContent = (filter) => {
        const current = filterValues[filter.id];
        switch (filter.type) {
             case "checkbox":
                return <CheckBoxFilter options={filter.options} value={Array.isArray(current) ? current : []} onChange={(ids) => update(filter.id, ids)} />;
             case "range":
                 return <RangeFilter options={filter.options} value={current} onChange={(v) => update(filter.id, v, {isRange:true})} />;
             case "rating":
                 return <RatingFilter options={filter.options} value={current} onChange={(v) => update(filter.id, v)} />;
             default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onResetAll}>
                    <Text style={styles.resetText}>Limpiar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {visibleFilters.map((filter, index) => (
                    <FilterDisclosure
                        key={filter.id}
                        title={filter.title}
                        isCollapsed={filter.isCollapsed}
                        previewContent={getPreviewContent(filter)}
                        isLast={index === visibleFilters.length - 1 && !shouldLimitFilters && !showAllFilters}
                    >
                        {renderFilterContent(filter)}
                    </FilterDisclosure>
                ))}

                {shouldLimitFilters && (
                    <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={() => setShowAllFilters(!showAllFilters)}
                    >
                        <Text style={styles.showMoreText}>
                            {showAllFilters ? "Menos filtros" : `Ver ${hiddenFilterCount} filtros más`}
                        </Text>
                        <Icon name={showAllFilters ? "chevron-up" : "chevron-down"} size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </ScrollView>

            <SafeAreaView style={styles.footerContainer}>
                <TouchableOpacity style={styles.applyButton} onPress={onClose}>
                    <Text style={styles.applyButtonText}>Ver Resultados</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: 22,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    resetText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textDecorationLine: 'underline',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, 
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    showMoreText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
    
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        padding: 16,
        paddingBottom: 24, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 10,
    },
    applyButton: {
        backgroundColor: COLORS.primary || '#000', 
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
});

export default GenericSidebarFilter;