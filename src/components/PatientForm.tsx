import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from "lucide-react";
import type { Patient } from "@/types";

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: Patient) => void;
  trigger?: React.ReactNode;
}

export default function PatientForm({ patient, onSave, trigger }: PatientFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    email: patient?.email || "",
    phone: patient?.phone || "",
    checklistStatus: patient?.checklistStatus || "nao_iniciado",
    evolutionStatus: patient?.evolutionStatus || "pendente",
    devolutiveStatus: patient?.devolutiveStatus || "pendente"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const newPatient: Patient = {
      ...formData,
      id: patient?.id || Date.now(),
      registrationDate: patient?.registrationDate || today,
      lastConsult: patient?.lastConsult || today,
      totalConsults: patient?.totalConsults ?? 0,
    };
    onSave(newPatient);
    setOpen(false);
    if (!patient) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        checklistStatus: "nao_iniciado",
        evolutionStatus: "pendente",
        devolutiveStatus: "pendente"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{patient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="checklist">Status Checklist</Label>
              <Select value={formData.checklistStatus} onValueChange={(value: string) => setFormData({ ...formData, checklistStatus: value as Patient["checklistStatus"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="completo">Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="evolution">Status Evolução</Label>
              <Select value={formData.evolutionStatus} onValueChange={(value: string) => setFormData({ ...formData, evolutionStatus: value as Patient["evolutionStatus"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="atualizada">Atualizada</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="devolutive">Status Devolutiva</Label>
              <Select value={formData.devolutiveStatus} onValueChange={(value: string) => setFormData({ ...formData, devolutiveStatus: value as Patient["devolutiveStatus"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}