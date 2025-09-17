import { Button } from "@/components/ui/button";
import { Moon, Users, Calendar, FileText, BarChart3, Settings, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onClose?: () => void;
}

const items = [
    { id: "patients", label: "Pacientes", icon: Users },
    { id: "calendar", label: "Agenda", icon: Calendar },
    { id: "records", label: "Prontuários", icon: FileText },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
    { id: "settings", label: "Configurações", icon: Settings },
];

export default function MobileSidebar({ activeTab, onTabChange, onClose }: MobileSidebarProps) {
    const handleClick = (id: string) => {
        onTabChange(id);
        onClose?.();
    };

    return (
        <div className="h-full w-full bg-card text-foreground flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Agenda</h2>
                    <p className="text-xs text-muted-foreground">Gestão Psicológica</p>
                </div>
                <div className="flex gap-2">
                    {/* Simple theme icon placeholder to keep visual parity on mobile */}
                    <Button variant="outline" size="icon" aria-label="Tema">
                        <Moon className="h-4 w-4" />
                    </Button>
                    {/* Provide a back affordance inside sheet content too */}
                    <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <nav className="flex-1 p-3 space-y-2 overflow-auto">
                {items.map((it) => (
                    <Button
                        key={it.id}
                        variant={activeTab === it.id ? "secondary" : "ghost"}
                        className={cn("w-full justify-start", activeTab === it.id && "bg-primary/10 text-primary border border-primary/20")}
                        onClick={() => handleClick(it.id)}
                    >
                        <it.icon className="h-4 w-4 mr-3" />
                        {it.label}
                    </Button>
                ))}
            </nav>
            <div className="p-4 border-t border-border text-center text-xs text-muted-foreground">
                <p>Versão 1.0.0</p>
                <p className="mt-1">© 2025 PsicoAgenda</p>
            </div>
        </div>
    );
}
