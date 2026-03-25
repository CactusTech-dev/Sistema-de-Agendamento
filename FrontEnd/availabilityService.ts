export interface AgendamentoExistente {
  id?: string;
  tenant_id?: string;
  service_id?: string;
  staff_id?: string;
  customer_name?: string;
  start_time: string | Date;
  end_time: string | Date;
  status?: string;
}

export interface VagaDisponivel {
  start_time: string;
  end_time: string;
}

const parseTime = (time: string): Date => {
  const [hh, mm] = time.split(':').map(Number);
  const now = new Date();
  const result = new Date(now);
  result.setHours(hh, mm, 0, 0);
  return result;
};

const formatTime = (date: Date): string => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toDate = (value: string | Date): Date => {
  if (value instanceof Date) return new Date(value);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida: ${value}`);
  }
  return parsed;
};

const overlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean => {
  return aStart < bEnd && bStart < aEnd;
};

export function gerarVagasDisponiveis(
  dados: Record<string, any>,
  agenda_horaria: string,
  duracao_do_servico: number,
  agendamentos_existentes: AgendamentoExistente[]
): VagaDisponivel[] {
  if (!agenda_horaria || !agenda_horaria.includes('às')) {
    throw new Error('agenda_horaria deve estar no formato "08:00 às 18:00"');
  }

  const [inicioTxt, fimTxt] = agenda_horaria.split('às').map(str => str.trim());
  const inicio = parseTime(inicioTxt);
  const fim = parseTime(fimTxt);

  if (fim <= inicio) {
    throw new Error('Horario final deve ser após o horario inicial');
  }

  if (duracao_do_servico <= 0) {
    throw new Error('duracao_do_servico deve ser maior do que zero');
  }

  const lunchStart = dados?.horario_almoco_inicio
    ? parseTime(dados.horario_almoco_inicio)
    : parseTime('12:00');
  const lunchEnd = dados?.horario_almoco_fim ? parseTime(dados.horario_almoco_fim) : parseTime('13:00');

  const reservas = agendamentos_existentes
    .map(item => ({
      start: toDate(item.start_time),
      end: toDate(item.end_time),
    }))
    .filter(item => item.end > item.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const slots: VagaDisponivel[] = [];
  let cursor = new Date(inicio);

  while (cursor.getTime() + duracao_do_servico * 60000 <= fim.getTime()) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(slotStart.getTime() + duracao_do_servico * 60000);

    if (slotEnd > fim) break;

    const intersectsLunch = overlap(slotStart, slotEnd, lunchStart, lunchEnd);
    if (!intersectsLunch) {
      const conflict = reservas.some(r => overlap(slotStart, slotEnd, r.start, r.end));
      if (!conflict) {
        slots.push({ start_time: formatTime(slotStart), end_time: formatTime(slotEnd) });
      }
    }

    cursor = new Date(cursor.getTime() + 15 * 60000);
  }

  return slots;
}
