/**
 * Dashboard page - Updated to use Supabase data
 * Displays clinical programs fetched from Supabase
 */

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/state/auth'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { safeText } from '@/lib/cellValue'
import type { ClinicalProgram, ProgramUI } from '@/models'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, FileText, Activity } from 'lucide-react'
import SupabaseConnectionTest from '@/components/common/SupabaseConnectionTest'

/**
 * Helper: map string icon names to lucide-react components safely.
 */
function getIconForProgram(programName: string): React.ComponentType<{ className?: string }> {
  const name = programName.toLowerCase()
  if (name.includes('time') || name.includes('med')) return Activity
  if (name.includes('mtm') || name.includes('future')) return FileText
  if (name.includes('test') || name.includes('treat')) return Activity
  if (name.includes('a1c') || name.includes('hba1c')) return Activity
  if (name.includes('oral') || name.includes('contraceptive')) return FileText
  return BookOpen
}

/**
 * Dashboard component
 */
export default function Dashboard() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<ProgramUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load clinical programs from Supabase
   */
  useEffect(() => {
    let mounted = true
    
    async function loadPrograms() {
      try {
        setLoading(true)
        setError(null)

        // Fetch programs with counts of related resources
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select(`
            id,
            slug,
            name,
            description,
            overview,
            experience_level,
            created_at,
            updated_at
          `)

        if (programsError) {
          throw new Error(programsError.message)
        }

        if (!mounted) return

        const programsUI: ProgramUI[] = []

        // For each program, count related resources
        for (const program of programsData || []) {
          // Count training modules
          const { count: moduleCount } = await supabase
            .from('training_modules')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id)

          // Count protocol manuals
          const { count: protocolCount } = await supabase
            .from('protocol_manuals')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id)

          // Count documentation forms
          const { count: formsCount } = await supabase
            .from('documentation_forms')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id)

          // Count additional resources
          const { count: additionalCount } = await supabase
            .from('additional_resources')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id)

          const totalResources = (moduleCount || 0) + (protocolCount || 0) + 
                               (formsCount || 0) + (additionalCount || 0)

          programsUI.push({
            id: program.id,
            name: safeText(program.name),
            description: safeText(program.description),
            slug: safeText(program.slug),
            level: safeText(program.experience_level),
            moduleCount: moduleCount || 0,
            resourceCount: totalResources
          })
        }

        if (mounted) {
          setPrograms(programsUI)
        }
      } catch (err) {
        if (!mounted) return
        console.error('Error loading programs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load programs')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadPrograms()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.pharmacy_name ?? 'Member'}
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error loading dashboard: {error}</p>
            <p className="text-red-600 text-sm mt-1">
              Please check your Supabase configuration and try again.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
     <div className="space-y-6">
       {/* Welcome Header */}
       <div className="bg-white rounded-lg border p-6">
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">
               Welcome back, {user?.pharmacy_name ?? 'Member'}
             </h1>
             <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
               <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-medium">
                 {user?.subscription_status ?? 'Active'}
               </span>
               <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700">
                 Live from Supabase
               </span>
             </div>
           </div>
           <Link to="/resources">
             <Button variant="outline" className="bg-transparent">
               Browse Resources
             </Button>
           </Link>
         </div>
       </div>

       {/* Supabase Connection Status */}
       <SupabaseConnectionTest />

       {/* Programs overview */}
       <section className="mb-6">
         <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
           <h2 className="text-base font-semibold">Clinical Programs</h2>
           <div className="flex items-center gap-1.5">
             <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
               Live from Supabase
             </span>
             <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
               HIPAA Compliant
             </span>
           </div>
         </div>
         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
           {programs.map((program) => {
             const Icon = getIconForProgram(program.name)
             return (
              <Link key={program.slug} to={`/programs/${program.slug}`}>
                 <Card className="group border-blue-50 hover:border-blue-200 hover:shadow-md">
                   <CardHeader className="pb-1.5">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Icon className="h-4 w-4 text-blue-600" />
                         <CardTitle className="text-sm">{program.name}</CardTitle>
                       </div>
                       <Badge variant="secondary" className="text-[11px]">
                         {program.resourceCount} resources
                       </Badge>
                     </div>
                     {program.level && (
                       <div className="text-[12px] text-slate-500">
                         Level: {program.level}
                       </div>
                     )}
                   </CardHeader>
                   <CardContent>
                     <p className="text-[13px] text-slate-600">{program.description}</p>
                   </CardContent>
                 </Card>
               </Link>
             )
           })}
         </div>
         {programs.length === 0 && (
           <div className="text-center py-12 text-gray-500">
             <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
             <p>No clinical programs available</p>
           </div>
         )}
       </section>
     </div>
   )
}