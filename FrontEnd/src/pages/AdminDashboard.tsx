import React, { useState, useEffect } from 'react'
import { usarInquilino } from '../hooks/useTenant'
import { supabase } from '../lib/supabase'

interface Booking {
  id: string
  customer_name: string
  start_time: string
  status: string
  services: { nome: string } | null
}

function AdminDashboard() {
  const { inquilino, carregando, erro } = usarInquilino()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [corPrimaria, setCorPrimaria] = useState('')

  useEffect(() => {
    if (inquilino) {
      setNomeEmpresa(inquilino.nome)
      setCorPrimaria(inquilino.cor_primaria)
      const load = async () => await fetchBookings()
      load()
    }
  }, [inquilino])

  const fetchBookings = async () => {
    if (!inquilino) return
    const { data, error } = await supabase
      .from('bookings')
      .select('id, customer_name, start_time, status, services!inner(nome)')
      .eq('tenant_id', inquilino.id) as { data: Booking[] | null; error: any }
    if (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return
    }
    setBookings((data as Booking[]) || [])
  }

  const cancelBooking = async (id: string) => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    await fetchBookings()
  }

  const saveSettings = async () => {
    if (!inquilino) return
    await supabase.from('tenants').update({ nome: nomeEmpresa, cor_primaria: corPrimaria }).eq('id', inquilino.id)
    alert('Configurações salvas!')
  }

  if (carregando) return <div className="p-4">Carregando...</div>
  if (erro) return <div className="p-4 text-red-500">Erro: {erro}</div>

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: inquilino?.cor_primaria }}>
        Painel Administrativo - {inquilino?.nome}
      </h1>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Agendamentos</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Cliente</th>
              <th className="border border-gray-300 p-2">Serviço</th>
              <th className="border border-gray-300 p-2">Data</th>
              <th className="border border-gray-300 p-2">Hora</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="border border-gray-300 p-2">{b.customer_name}</td>
                <td className="border border-gray-300 p-2">{b.services?.nome}</td>
                <td className="border border-gray-300 p-2">{new Date(b.start_time).toLocaleDateString()}</td>
                <td className="border border-gray-300 p-2">{new Date(b.start_time).toLocaleTimeString()}</td>
                <td className="border border-gray-300 p-2">{b.status}</td>
                <td className="border border-gray-300 p-2">
                  {b.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-2xl mb-4">Configurações</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Nome da Empresa</label>
            <input
              type="text"
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Cor Primária</label>
            <input
              type="color"
              value={corPrimaria}
              onChange={(e) => setCorPrimaria(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={saveSettings}
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: corPrimaria }}
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard