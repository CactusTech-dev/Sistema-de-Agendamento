interface Agendamento {
  start_time: string | Date
  end_time: string | Date
}

export function obterVagasDisponíveis(
  duração: number,
  agendamentosExistentes: Agendamento[]
): string[] {
  const inicio = new Date()
  inicio.setHours(8, 0, 0, 0)

  const fim = new Date()
  fim.setHours(18, 0, 0, 0)

  const reservas = agendamentosExistentes.map(item => ({
    start: item.start_time instanceof Date ? item.start_time : parseTime(item.start_time),
    end: item.end_time instanceof Date ? item.end_time : parseTime(item.end_time),
  })).filter(item => item.end > item.start)

  const slots: string[] = []
  let cursor = new Date(inicio)

  while (cursor.getTime() + duração * 60000 <= fim.getTime()) {
    const slotStart = new Date(cursor)
    const slotEnd = new Date(slotStart.getTime() + duração * 60000)

    const conflict = reservas.some(r => overlap(slotStart, slotEnd, r.start, r.end))
    if (!conflict) {
      slots.push(formatTime(slotStart))
    }

    cursor = new Date(cursor.getTime() + 30 * 60000) // 30 min
  }

  return slots
}

function parseTime(time: string): Date {
  const [hh, mm] = time.split(':').map(Number)
  const now = new Date()
  const result = new Date(now)
  result.setHours(hh, mm, 0, 0)
  return result
}

function formatTime(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd
}