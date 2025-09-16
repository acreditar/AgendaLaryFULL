
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { dbRead, dbWrite, init } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Pacientes CRUD
app.get('/api/patients', (req, res) => {
  (async () => {
    const data = await dbRead();
    const patients = data.patients.map(p => ({ ...p }));
    for (const p of patients) {
      p.appointments = data.appointments.filter(a => a.patientId === p.id).map(a => ({ ...a }));
    }
    res.json(patients);
  })().catch(err => res.status(500).json({ error: err.message }));
});

app.post('/api/patients', (req, res) => {
  (async () => {
    const data = await dbRead();
    const id = uuidv4();
    const { name, email, phone, registrationDate, lastConsult, totalConsults, notes } = req.body;
    const patient = { id, name, email, phone, registrationDate, lastConsult, totalConsults: totalConsults || 0, notes: notes || '' };
    data.patients.push(patient);
    await dbWrite(data);
    res.status(201).json({ ...patient, appointments: [] });
  })().catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/patients/:id', (req, res) => {
  (async () => {
    const data = await dbRead();
    const { id } = req.params;
    const { name, email, phone, registrationDate, lastConsult, totalConsults, notes } = req.body;
    const idx = data.patients.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    data.patients[idx] = { ...data.patients[idx], name, email, phone, registrationDate, lastConsult, totalConsults: totalConsults || 0, notes: notes || '' };
    await dbWrite(data);
    res.json(data.patients[idx]);
  })().catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/patients/:id', (req, res) => {
  (async () => {
    const data = await dbRead();
    const { id } = req.params;
    data.appointments = data.appointments.filter(a => a.patientId !== id);
    data.patients = data.patients.filter(p => p.id !== id);
    await dbWrite(data);
    res.status(204).end();
  })().catch(err => res.status(500).json({ error: err.message }));
});

// Agendamentos CRUD (por paciente)
app.post('/api/patients/:id/appointments', (req, res) => {
  (async () => {
    const data = await dbRead();
    const { id } = req.params;
    const { date, note, status, completed } = req.body;
    const aid = uuidv4();
    const appt = { id: aid, patientId: id, date, note: note || '', status: status || 'agendado', completed: !!completed };
    data.appointments.push(appt);
    await dbWrite(data);
    res.status(201).json({ ...appt });
  })().catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/patients/:id/appointments/:aid', (req, res) => {
  (async () => {
    const data = await dbRead();
    const { id, aid } = req.params;
    const { date, note, status, completed } = req.body;
    const idx = data.appointments.findIndex(a => a.id === aid && a.patientId === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    data.appointments[idx] = { ...data.appointments[idx], date, note: note || '', status: status || 'agendado', completed: !!completed };
    await dbWrite(data);
    res.json(data.appointments[idx]);
  })().catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/patients/:id/appointments/:aid', (req, res) => {
  (async () => {
    const data = await dbRead();
    const { id, aid } = req.params;
    data.appointments = data.appointments.filter(a => !(a.id === aid && a.patientId === id));
    await dbWrite(data);
    res.status(204).end();
  })().catch(err => res.status(500).json({ error: err.message }));
});

init().then(() => {
  app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Erro inicializando DB', err);
  process.exit(1);
});
