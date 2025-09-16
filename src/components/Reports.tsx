import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Calendar, Users, FileText, Download, TrendingUp } from "lucide-react";
import type { Patient } from '@/types';
import { parseISO, differenceInCalendarWeeks, format } from 'date-fns';

interface Props {
  patients: Patient[];
}

export default function Reports({ patients }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedYear, setSelectedYear] = useState(() => `${new Date().getFullYear()}`);

  const monthlyStats = useMemo(() => {
    const totalPatients = patients.length;
    const totalConsults = patients.reduce((s, p) => s + (p.totalConsults || 0), 0);
    const averageConsultsPerPatient = totalPatients ? +(totalConsults / totalPatients).toFixed(1) : 0;
    const completedDevolutives = patients.filter(p => p.devolutiveStatus === 'concluida').length;
    const pendingDevolutives = patients.filter(p => p.devolutiveStatus === 'pendente').length;
    const totalAppointments = patients.reduce((s, p) => s + ((p.appointments || []).length), 0);
    const completedAppointments = patients.reduce((s, p) => s + ((p.appointments || []).filter(a => a.completed).length), 0);

    return {
      totalConsults,
      totalPatients,
      averageConsultsPerPatient,
      completedDevolutives,
      pendingDevolutives,
      completedReports: completedAppointments,
      pendingReports: Math.max(0, totalAppointments - completedAppointments)
    };
  }, [patients]);

  const patientStats = useMemo(() => {
    return [...patients]
      .sort((a, b) => (b.totalConsults || 0) - (a.totalConsults || 0))
      .slice(0, 5)
      .map(p => ({ name: p.name, consults: p.totalConsults || 0, lastConsult: p.lastConsult || '', status: 'Ativo' }));
  }, [patients]);

  const weeklyData = useMemo(() => {
    // last 4 weeks buckets: index 0 = this week, 1 = 1 week ago, etc.
    const buckets = [0, 0, 0, 0];
    const now = new Date();

    patients.forEach(p => {
      (p.appointments || []).forEach(a => {
        try {
          const ad = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date);
          const weeksAgo = differenceInCalendarWeeks(now, ad);
          if (weeksAgo >= 0 && weeksAgo < 4) {
            buckets[weeksAgo] += 1;
          }
        } catch (e) {
          // ignore parse errors
        }
      });
    });

    return buckets.map((count, idx) => ({ week: `Semana ${4 - idx}`, consults: count }));
  }, [patients]);

  const exportCsv = () => {
    const header = ['id', 'name', 'email', 'phone', 'registrationDate', 'lastConsult', 'totalConsults', 'nextAppointment'];
    const rows = patients.map(p => [p.id, p.name, p.email, p.phone, p.registrationDate, p.lastConsult, p.totalConsults, p.nextAppointment || '']);
    const csv = [header.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pacientes.csv'; a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análise de atendimentos e performance</p>
          </div>
          <div className="flex gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-12">Dezembro 2024</SelectItem>
                <SelectItem value="2024-11">Novembro 2024</SelectItem>
                <SelectItem value="2024-10">Outubro 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Consultas</p>
                  <p className="text-3xl font-bold text-foreground">{monthlyStats.totalConsults}</p>
                  <p className="text-sm text-success font-medium">+12% vs mês anterior</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pacientes Ativos</p>
                  <p className="text-3xl font-bold text-foreground">{monthlyStats.totalPatients}</p>
                  <p className="text-sm text-success font-medium">+3 novos pacientes</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Média Consultas/Paciente</p>
                  <p className="text-3xl font-bold text-foreground">{monthlyStats.averageConsultsPerPatient}</p>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Devolutivas Concluídas</p>
                  <p className="text-3xl font-bold text-foreground">{monthlyStats.completedDevolutives}</p>
                  <p className="text-sm text-warning font-medium">{monthlyStats.pendingDevolutives} pendentes</p>
                </div>
                <FileText className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Consultation Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Consultas por Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{week.week}</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 bg-secondary h-2 rounded-full">
                        <div
                          className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                          style={{ width: `${(week.consults / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-foreground w-8">{week.consults}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Patients */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Pacientes com Mais Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientStats.map((patient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Última consulta: {new Date(patient.lastConsult).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{patient.consults}</p>
                      <p className="text-sm text-muted-foreground">consultas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Análise Detalhada do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Devolutivas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Concluídas</span>
                    <span className="text-sm font-medium text-success">{monthlyStats.completedDevolutives}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pendentes</span>
                    <span className="text-sm font-medium text-warning">{monthlyStats.pendingDevolutives}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
                    <span className="text-sm font-medium text-foreground">
                      {Math.round((monthlyStats.completedDevolutives / (monthlyStats.completedDevolutives + monthlyStats.pendingDevolutives)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Relatórios</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Concluídos</span>
                    <span className="text-sm font-medium text-success">{monthlyStats.completedReports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pendentes</span>
                    <span className="text-sm font-medium text-warning">{monthlyStats.pendingReports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
                    <span className="text-sm font-medium text-foreground">
                      {Math.round((monthlyStats.completedReports / (monthlyStats.completedReports + monthlyStats.pendingReports)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Consultas/Dia</span>
                    <span className="text-sm font-medium text-foreground">~5.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dias Trabalhados</span>
                    <span className="text-sm font-medium text-foreground">22</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de Presença</span>
                    <span className="text-sm font-medium text-foreground">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}