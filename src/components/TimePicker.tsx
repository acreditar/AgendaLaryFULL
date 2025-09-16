import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function makeTimeOptions(stepMinutes: number = 15): string[] {
    const list: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += stepMinutes) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            list.push(`${hh}:${mm}`);
        }
    }
    return list;
}

export default function TimePicker({ id, label = "Hora", value, onChange, step = 15 }: { id?: string; label?: string; value: string; onChange: (v: string) => void; step?: number }) {
    const options = makeTimeOptions(step);
    return (
        <div>
            {label && <Label htmlFor={id}>{label}</Label>}
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} aria-label="Selecionar hora">
                    <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                    {options.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
