import React, { useMemo } from 'react';
import { ProductTag, ProductSpec } from '../../types';
import {
    Wifi,
    Zap,
    Server,
    Monitor,
    Cpu,
    HardDrive,
    Tag,
    Sparkles,
    Info,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

interface ProductTagsProps {
    tags: ProductTag[];
    specs?: ProductSpec[];
}

// Icon mapping for tag types
const TAG_ICONS: Record<string, React.ElementType> = {
    feature: Sparkles,
    capacity: Server,
    poe: Zap,
    network: Wifi,
    storage: HardDrive,
    processor: Cpu,
    display: Monitor,
    promo: Tag,
    default: Tag,
};

// Color mapping for tag types
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    feature: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    capacity: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    poe: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    network: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    promo: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    default: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

// Friendly names for tag types
const TAG_TYPE_NAMES: Record<string, string> = {
    feature: 'Features',
    capacity: 'Capacity',
    poe: 'PoE',
    network: 'Network',
    storage: 'Storage',
    processor: 'Processor',
    display: 'Display',
    promo: 'Promotions',
    other: 'Other Tags',
};

export const ProductTags: React.FC<ProductTagsProps> = ({ tags, specs }) => {
    const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['tags', 'specs']));

    // Group tags by type
    const groupedTags = useMemo(() => {
        const groups = new Map<string, ProductTag[]>();

        tags.forEach((tag) => {
            const type = tag.tagType || 'other';
            if (!groups.has(type)) {
                groups.set(type, []);
            }
            groups.get(type)!.push(tag);
        });

        return groups;
    }, [tags]);

    // Group specs by section
    const groupedSpecs = useMemo(() => {
        if (!specs || specs.length === 0) return new Map<string, ProductSpec[]>();

        const groups = new Map<string, ProductSpec[]>();

        specs.forEach((spec) => {
            const section = spec.specSection || 'General';
            if (!groups.has(section)) {
                groups.set(section, []);
            }
            groups.get(section)!.push(spec);
        });

        return groups;
    }, [specs]);

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    if (tags.length === 0 && (!specs || specs.length === 0)) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Tags Section */}
            {tags.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('tags')}
                        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold text-slate-900">Product Tags</h3>
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                {tags.length} tags
                            </span>
                        </div>
                        {expandedSections.has('tags') ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {expandedSections.has('tags') && (
                        <div className="p-6 space-y-6">
                            {Array.from(groupedTags.entries()).map(([type, typeTags]) => {
                                const Icon = TAG_ICONS[type] || TAG_ICONS.default;
                                const colors = TAG_COLORS[type] || TAG_COLORS.default;

                                return (
                                    <div key={type}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Icon className={`w-4 h-4 ${colors.text}`} />
                                            <h4 className="text-sm font-medium text-slate-700">
                                                {TAG_TYPE_NAMES[type] || type.charAt(0).toUpperCase() + type.slice(1)}
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {typeTags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                                                >
                                                    {tag.tagValue}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Specs Section */}
            {specs && specs.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('specs')}
                        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-slate-500" />
                            <h3 className="font-semibold text-slate-900">Technical Specifications</h3>
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                {specs.length} specs
                            </span>
                        </div>
                        {expandedSections.has('specs') ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {expandedSections.has('specs') && (
                        <div className="divide-y divide-slate-100">
                            {Array.from(groupedSpecs.entries()).map(([section, sectionSpecs]) => (
                                <div key={section} className="p-6">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-4">{section}</h4>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {sectionSpecs.map((spec) => (
                                            <div key={spec.id} className="flex flex-col">
                                                <dt className="text-xs text-slate-500 uppercase tracking-wider">
                                                    {spec.specLabel}
                                                </dt>
                                                <dd className="text-sm text-slate-900 mt-1">
                                                    {spec.specValue || '-'}
                                                    {spec.specNote && (
                                                        <span className="text-xs text-slate-400 ml-1">({spec.specNote})</span>
                                                    )}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
