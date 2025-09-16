import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Preferências do sistema</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Ainda não há configurações disponíveis — futuramente adicionaremos temas, backups e exportações.</p>
            <div className="mt-4">
              <Button variant="outline">Exportar backup</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
