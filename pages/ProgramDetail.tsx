/**
 * Program Detail page - Updated to use Supabase data
 * Shows detailed information about a specific clinical program with real data
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Play, 
  Download,
  ArrowLeft,
  FileText,
  Bookmark,
  Video,
  File,
  FileSpreadsheet
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { safeText, getFileUrl } from '@/lib/cellValue'
import { downloadFileFromBucket, openFileFromBucket } from '@/lib/supabase'
import type { ClinicalProgram, TrainingModule, ProtocolManual, DocumentationForm } from '@/models'
import type { StorageFile } from '@/models'
import SafeText from '@/components/common/SafeText'
import Breadcrumbs from '@/components/common/Breadcrumbs'

interface ProgramDetailUI {
  id: string
  title: string
  description: string
  level?: string
  slug: string
  modules: TrainingModule[]
  protocols: ProtocolManual[]
  forms: DocumentationForm[]
}

// Bookmark state management
interface BookmarkState {
  [fileId: string]: boolean
}

// Get file type icon based on filename or content type
function getFileTypeIcon(fileName: string = '', isVideo: boolean = false) {
  if (isVideo) return Video
  
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return FileText
    case 'doc':
    case 'docx':
      return FileText
    case 'xls':
    case 'xlsx':
      return FileSpreadsheet
    case 'mp4':
    case 'mov':
    case 'avi':
      return Video
    default:
      return File
  }
}

// Determine if file is video based on extension
function isVideoFile(mimeType: string = '', fileName: string = ''): boolean {
  // Check MIME type first (more reliable)
  if (mimeType.startsWith('video/')) {
    return true
  }
  
  // Fallback to file extension
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v']
  const ext = fileName.split('.').pop()?.toLowerCase()
  return videoExtensions.includes(ext || '')
}

// Extract filename from path
function getFileName(filePath: string = ''): string {
  return filePath.split('/').pop() || filePath
}

// File row component for consistent layout
interface FileRowProps {
  id: string
  name: string
  filePath?: string
  fileUrl?: string
  link?: string
  duration?: string
  mimeType?: string
  bookmarked: boolean
  onBookmarkToggle: (id: string) => void
  onFileAction: (fileUrl?: string, fileName?: string, name?: string) => void
}

function FileRow({ id, name, filePath, fileUrl, link, duration, mimeType, bookmarked, onBookmarkToggle, onFileAction }: FileRowProps) {
  const isVideo = isVideoFile(mimeType || '', filePath || name)
  const fileName = getFileName(filePath || name)
  const FileIcon = getFileTypeIcon(fileName, isVideo)
  
  // Debug: log the file data to see what we're working with
  console.log('FileRow data:', { id, name, filePath, fileUrl, link, hasFile: !!(fileUrl || filePath || link) })
  
  const hasFile = !!(fileUrl || filePath || link)
  
  return (
    <div className="flex items-center gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* 1. Icon */}
      <div className="flex-shrink-0">
        <FileIcon className="h-4 w-4 text-gray-600" />
      </div>
      
      {/* 2. File Name (+ duration for videos) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 truncate">{name}</span>
          {isVideo && duration && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
              {duration}
            </span>
          )}
        </div>
      </div>
      
      {/* 3. Bookmark Icon */}
      <button
        type="button"
        onClick={() => onBookmarkToggle(id)}
        className="flex-shrink-0 p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
        title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Bookmark 
          className={`h-4 w-4 ${
            bookmarked 
              ? 'text-blue-600 fill-current' 
              : 'text-gray-400'
          }`} 
        />
      </button>
      
      {/* 4. Download/Play Button */}
      <button
        type="button"
        onClick={() => {
          console.log('=== BUTTON CLICKED ===')
          console.log('ID:', id)
          console.log('Name:', name)
          console.log('FileURL:', fileUrl || 'No URL')
          console.log('FilePath:', filePath || 'No path')
          console.log('About to call handleFileAction...')
          onFileAction(fileUrl || link, fileName, name)
        }}
        className={`
          flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors
          bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 
          cursor-pointer active:bg-gray-100
        `}
      >
        {isVideo ? (
          <>
            <Play className="h-3 w-3" />
            Play
          </>
        ) : (
          <>
            <Download className="h-3 w-3" />
            Download
          </>
        )}
      </button>
    </div>
  )
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>()
  const [program, setProgram] = useState<ProgramDetailUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookmarks, setBookmarks] = useState<BookmarkState>({})
  const [programFiles, setProgramFiles] = useState<StorageFile[]>([])

  // Toggle bookmark state
  const handleBookmarkToggle = (fileId: string) => {
    console.log('Bookmark toggled for:', fileId)
    setBookmarks(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }))
  }

  // Handle file action (download or play)
  const handleFileAction = async (fileUrl?: string, fileName?: string, resourceName?: string) => {
    console.log('=== PROGRAM FILE ACTION ===')
    console.log('FileURL:', fileUrl)
    console.log('FileName:', fileName)
    console.log('ResourceName:', resourceName)
    
    if (!fileUrl) {
      console.warn('No file URL provided')
      alert(`No file available for: ${resourceName || 'this resource'}`)
      return
    }
    
    const isVideo = isVideoFile('', fileName || '')
    console.log('Is video file:', isVideo)
    
    if (isVideo) {
      console.log('Opening video:', fileUrl)
      openFileFromBucket(fileUrl)
    } else {
      console.log('Downloading file:', fileUrl)
      await downloadFileFromBucket(fileUrl, fileName)
    }
  }

  // Toggle bookmark state (original function preserved)
  const handleBookmarkToggleOriginal = (fileId: string) => {
    setBookmarks(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }))
  }

  useEffect(() => {
    if (!id) return

    let mounted = true
    async function loadProgram() {
      try {
        setLoading(true)
        setError('')

        console.log('Loading program with ID:', id)
        
        // Find program by slug first, then by ID
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('*')
          .eq('slug', id)
          .maybeSingle()
        
        if (programError) {
          console.error('Program query error:', programError)
          throw new Error('Program not found')
        }

        if (!programData) {
          throw new Error('Program not found')
        }

        console.log('Program loaded:', programData.name)
        
        const { data: fileList, error: listError } = await supabase
          .from('storage_files_catalog')
          .select('*')
          .eq('bucket_name', 'clinicalrxqfiles')
          
        if (listError) {
          throw listError
        }
        
        console.log(`Total files in catalog: ${fileList?.length || 0}`)
        
        // Simple program name matching - map common patterns
        let searchPattern = programData.name.toLowerCase()
        console.log('Program name:', programData.name)
        console.log('Looking for files matching:', searchPattern)
        
        // Map program names to actual folder patterns
        if (searchPattern.includes('mtm')) {
          searchPattern = 'mtmthefuturetoday'
        } else if (searchPattern.includes('timemymeds')) {
          searchPattern = 'timemymeds'
        } else if (searchPattern.includes('test') && searchPattern.includes('treat')) {
          searchPattern = 'testandtreat'
        } else if (searchPattern.includes('hba1c')) {
          searchPattern = 'hba1c'
        } else if (searchPattern.includes('oral') && searchPattern.includes('contraceptive')) {
          searchPattern = 'oralcontraceptives'
        }
        
        const programFiles = fileList?.filter(file => {
          const matches = file.file_path && 
                         file.file_name !== '.emptyFolderPlaceholder' &&
                         file.file_path.toLowerCase().includes(searchPattern)
          if (matches) {
            console.log('Found matching file:', file.file_name, 'in path:', file.file_path)
          }
          return matches
        }) || []
        
        console.log(`Found ${programFiles.length} matching files`)
        
        if (mounted) {
          setProgramFiles(programFiles)
        }

        // Simple categorization
        let modules: TrainingModule[] = []
        let protocols: ProtocolManual[] = []
        let forms: DocumentationForm[] = []

        programFiles?.forEach((file, index) => {
          if (file.file_name && file.file_url) {
            console.log('Processing file:', file.file_name, 'path:', file.file_path)
            
            const baseItem = {
              id: file.id,
              name: file.file_name.replace(/\.[^/.]+$/, ''),
              created_at: file.created_at,
              updated_at: file.updated_at,
              program_id: programData.id
            }
            
            const filePath = (file.file_path || '').toLowerCase()
            
            if (filePath.includes('/training/')) {
              modules.push({
                ...baseItem,
                length: isVideoFile(file.mime_type, file.file_name) ? 'Video' : undefined,
                file_path: file.file_path,
                link: file.file_url,
                sort_order: index
              })
              console.log('Added training module:', file.file_name)
            } else if (filePath.includes('/protocols/') || filePath.includes('protocol')) {
              protocols.push({
                ...baseItem,
                file_path: file.file_path,
                link: file.file_url
              })
              console.log('Added protocol:', file.file_name)
            } else if (filePath.includes('/forms/') || filePath.includes('/resources/')) {
              forms.push({
                ...baseItem,
                file_path: file.file_path,
                category: 'General',
                link: file.file_url
              })
              console.log('Added form:', file.file_name)
            }
          }
        })
        
        console.log(`Final counts - modules: ${modules.length}, protocols: ${protocols.length}, forms: ${forms.length}`)
        
        const programDetailData: ProgramDetailUI = {
          id: programData.id,
          title: safeText(programData.name),
          description: safeText(programData.description),
          level: safeText(programData.experience_level),
          slug: safeText(programData.slug),
          modules,
          protocols,
          forms
        }

        if (mounted) {
          setProgram(programDetailData)
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Failed to load program')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProgram()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Program Not Found</h1>
          <p className="text-gray-600 mb-8">
            The program you're looking for doesn't exist or may have been moved.
          </p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Programs' },
            { label: program.title },
          ]}
        />
      </div>

      {/* Hero Section */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center text-cyan-600 hover:text-cyan-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 text-white rounded-2xl p-8 mb-6">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold">
                  <SafeText value={program.title} />
                </h1>
                {program.level && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    <SafeText value={program.level} />
                  </Badge>
                )}
              </div>
              <p className="text-lg text-white/90 mb-4">
                <SafeText value={program.description} />
              </p>
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{program.modules.length} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{program.protocols.length} protocols</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{program.forms.length} forms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
            <TabsTrigger value="protocols">Protocol Manuals</TabsTrigger>
            <TabsTrigger value="forms">Documentation Forms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    <SafeText value={program.description} />
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Training Modules</h3>
                      <p className="text-blue-700">{program.modules.length} modules available</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Protocol Manuals</h3>
                      <p className="text-green-700">{program.protocols.length} protocols available</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">Documentation Forms</h3>
                      <p className="text-purple-700">{program.forms.length} forms available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="modules" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Training Modules ({program.modules.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
              {program.modules.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No training modules available for this program.
                  </CardContent>
                </Card>
              ) : (
                program.modules.map((module) => (
                  <FileRow
                    key={module.id}
                    id={module.id}
                    name={safeText(module.name)}
                    filePath={module.file_path}
                    fileUrl={module.link}
                    duration={module.length}
                    mimeType=""
                    bookmarked={bookmarks[module.id] || false}
                    onBookmarkToggle={handleBookmarkToggle}
                    onFileAction={handleFileAction}
                  />
                ))
              )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="protocols" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Protocol Manuals ({program.protocols.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
              {program.protocols.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No protocol manuals available for this program.
                  </CardContent>
                </Card>
              ) : (
                program.protocols.map((protocol) => (
                  <Card key={protocol.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            <SafeText value={protocol.name} />
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          {protocol.link && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={protocol.link} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="forms" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Documentation Forms ({program.forms.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {program.forms.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No documentation forms available for this program.
                  </div>
                ) : (
                  program.forms.map((form) => (
                    <FileRow
                      key={form.id}
                      id={form.id}
                      name={safeText(form.name)}
                      filePath={form.file_path}
                      fileUrl={form.link}
                      link={form.link}
                      mimeType=""
                      bookmarked={bookmarks[form.id] || false}
                      onBookmarkToggle={handleBookmarkToggle}
                      onFileAction={handleFileAction}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}