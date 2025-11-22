import React, { useState, useRef, useEffect } from 'react';
import { Settings, GripVertical, Check } from 'lucide-react';

export interface ColumnDef {
    key: string;
    label: string;
    visible: boolean;
}

interface ColumnToggleProps {
    columns: ColumnDef[];
    onColumnChange: (newColumns: ColumnDef[]) => void;
}

export const ColumnToggle: React.FC<ColumnToggleProps> = ({
    columns,
    onColumnChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleVisibility = (key: string) => {
        const newColumns = columns.map((col) =>
            col.key === key ? { ...col, visible: !col.visible } : col
        );
        onColumnChange(newColumns);
    };

    const moveColumn = (dragIndex: number, hoverIndex: number) => {
        const newColumns = [...columns];
        const draggedItem = newColumns[dragIndex];
        newColumns.splice(dragIndex, 1);
        newColumns.splice(hoverIndex, 0, draggedItem);
        onColumnChange(newColumns);
    };

    // Simple drag and drop implementation
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        moveColumn(draggedIndex, index);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Customize Columns"
            >
                <Settings className="h-4 w-4 mr-2" />
                Columns
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-2 border-b border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Toggle & Reorder
                        </h3>
                    </div>
                    <div className="py-1 max-h-96 overflow-y-auto">
                        {columns.map((col, index) => (
                            <div
                                key={col.key}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center px-4 py-2 hover:bg-slate-50 cursor-move ${draggedIndex === index ? 'opacity-50 bg-slate-100' : ''
                                    }`}
                            >
                                <GripVertical className="h-4 w-4 text-slate-400 mr-3 cursor-move" />
                                <div className="flex-1 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={col.visible}
                                        onChange={() => toggleVisibility(col.key)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{col.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
