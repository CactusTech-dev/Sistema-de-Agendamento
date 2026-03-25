import React, { useState, useEffect, ChangeEvent } from 'react'
import { usarInquilino } from '../hooks/useTenant'
import { supabase } from '../lib/supabase'

interface Service {
  id: string
  nome: string
  duracao: number
  preco: number
}

function BookingPage() {
  const { inquilino, carregando, erro } = usarInquilino()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    if (inquilino) {
      supabase
        .from('services')
        .select('*')
        .eq('id_inquilino', inquilino.id)
        .then(({ data }) => setServices(data || []))
    }
  }, [inquilino])

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName) {
      alert('Preencha todos os campos')
      return
    }

    const startTime = new Date(`${selectedDate}T${selectedTime}`)
    const { error } = await supabase.from('bookings').insert({
      tenant_id: inquilino?.id,
      service_id: selectedService.id,
      customer_name: customerName,
      start_time: startTime.toISOString()
    })

    if (error) {
      alert('Erro ao agendar: ' + error.message)
    } else {
      alert('Agendamento confirmado!')
      // Resetar ou redirecionar
      setSelectedService(null)
      setSelectedDate('')
      setSelectedTime('')
      setCustomerName('')
    }
  }

  const handleCustomerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value)
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleTimeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(e.target.value)
  }

  if (carregando) return <div className="p-4">Carregando...</div>
  if (erro) return <div className="p-4 text-red-500">Erro: {erro}</div>

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4" style={{ color: inquilino?.cor_primaria }}>
        Agendamento para {inquilino?.nome}
      </h1>

      {!selectedService ? (
        <div>
          <h2 className="text-xl mb-2">Selecione um serviço</h2>
          {services.map((s: Service) => (
            <button
              key={s.id}
              onClick={() => setSelectedService(s)}
              className="block w-full mb-2 p-3 border rounded text-white"
              style={{ backgroundColor: inquilino?.cor_primaria }}
            >
              {s.nome} - R$ {s.preco} ({s.duracao} min)
            </button>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-2">Agendar {selectedService.nome}</h2>
          <input
            type="text"
            placeholder="Nome do cliente"
            value={customerName}
            onChange={handleCustomerNameChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={selectedTime}
            onChange={handleTimeChange}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Selecione a hora</option>
            {Array.from({ length: 10 }, (_, i) => {
              const hour = 9 + i
              return (
                <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                  {hour}:00
                </option>
              )
            })}
          </select>
          <button
            onClick={handleConfirm}
            className="w-full p-3 text-white rounded"
            style={{ backgroundColor: inquilino?.cor_primaria }}
          >
            Confirmar Agendamento
          </button>
        </div>
      )}
    </div>
  )
}

export default BookingPage