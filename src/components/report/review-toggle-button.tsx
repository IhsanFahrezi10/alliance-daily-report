'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCheck, RotateCcw, Loader2 } from 'lucide-react'

export default function ReviewToggleButton({
  reportId,
  initialReviewId,
  reviewerName,
  reviewedAt,
}: {
  reportId: string
  initialReviewId: string | null
  reviewerName: string | null
  reviewedAt: string | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const [reviewId, setReviewId] = useState(initialReviewId)
  const [loading, setLoading] = useState(false)

  const isReviewed = !!reviewId

  const handleToggle = async () => {
    setLoading(true)

    if (isReviewed && reviewId) {
      // Hapus review (batal ditinjau)
      const { error } = await supabase
        .from('report_reviews')
        .delete()
        .eq('id', reviewId)

      setLoading(false)

      if (error) {
        toast.error('Gagal batalin: ' + error.message)
        return
      }

      setReviewId(null)
      toast.success('Tanda tinjau dibatalkan')
      router.refresh()
    } else {
      // Insert review (tandai ditinjau)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        toast.error('Sesi habis, login ulang')
        return
      }

      const { data, error } = await supabase
        .from('report_reviews')
        .insert({ report_id: reportId, reviewed_by: user.id })
        .select('id')
        .single()

      setLoading(false)

      if (error) {
        toast.error('Gagal tandai: ' + error.message)
        return
      }

      setReviewId(data.id)
      toast.success('Logbook ditandai sudah ditinjau')
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 transition-colors disabled:opacity-50 ${
        isReviewed
          ? 'text-ink/60 hover:bg-ink/[0.03]'
          : 'bg-brand-primary text-white hover:bg-brand-hover'
      }`}
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span className="mono text-[11px] uppercase tracking-[0.15em]">
            Memproses...
          </span>
        </>
      ) : isReviewed ? (
        <>
          <RotateCcw size={14} />
          <span className="mono text-[11px] uppercase tracking-[0.15em]">
            Batal Tinjau
          </span>
        </>
      ) : (
        <>
          <CheckCheck size={14} />
          <span className="mono text-[11px] uppercase tracking-[0.15em]">
            Tandai Ditinjau
          </span>
        </>
      )}
    </button>
  )
}