import { useId, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import type { ChecklistItem } from '@/types';

interface ChecklistProps {
    items: ChecklistItem[];
    onChange: (items: ChecklistItem[]) => void;
    title?: string;
    addPlaceholder?: string;
}

export default function Checklist({ items, onChange, title = 'Checklist', addPlaceholder = 'Adicionar item' }: ChecklistProps) {
    const headingId = useId();
    const [text, setText] = useState('');

    const toggle = (id: ChecklistItem['id']) => {
        onChange(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
    };
    const remove = (id: ChecklistItem['id']) => {
        onChange(items.filter(it => it.id !== id));
    };
    const add = () => {
        const label = text.trim();
        if (!label) return;
        const newItem: ChecklistItem = { id: Date.now(), label, done: false };
        onChange([...(items || []), newItem]);
        setText('');
    };

    return (
        <section aria-labelledby={headingId} className="space-y-3">
            <h3 id={headingId} className="text-sm font-medium text-foreground">{title}</h3>
            <div className="flex gap-2">
                <Label htmlFor={`${headingId}-add`} className="sr-only">{addPlaceholder}</Label>
                <Input id={`${headingId}-add`} value={text} onChange={e => setText(e.target.value)} placeholder={addPlaceholder} onKeyDown={e => { if (e.key === 'Enter') add(); }} />
                <Button type="button" onClick={add} aria-label="Adicionar item ao checklist">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ul className="space-y-2">
                {(items || []).map(item => (
                    <li key={item.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Checkbox id={`chk-${item.id}`} checked={item.done} onCheckedChange={() => toggle(item.id)} aria-labelledby={`lbl-${item.id}`} />
                            <Label id={`lbl-${item.id}`} htmlFor={`chk-${item.id}`} className={item.done ? 'line-through text-muted-foreground' : ''}>
                                {item.label}
                            </Label>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label={`Remover ${item.label}`}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
