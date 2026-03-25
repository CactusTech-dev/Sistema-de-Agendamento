import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Inquilino {
  id: string
  nome: string
  cor_primaria: string
}

export function usarInquilino() {
  const { slug } = useParams<{ slug: string }>()
  const [inquilino, setInquilino] = useState<Inquilino | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setErro('Slug não encontrado na URL')
      setCarregando(false)
      return
    }

    supabase
      .from('tenants')
      .select('id, nome, cor_primaria')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setErro('Inquilino não encontrado')
        } else {
          setInquilino(data)
        }
        setCarregando(false)
      })
  }, [slug])

  return { inquilino, carregando, erro }
}