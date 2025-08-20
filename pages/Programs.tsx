import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Search,
  Filter,
  ArrowRight,
  Activity,
  FileText,
  Zap,
  Heart,
  Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { safeText } from '@/lib/cellValue';
import type { ClinicalProgram, ProgramUI } from '@/models';

/**
 * Helper: map program names to appropriate icons
 */
function getIconForProgram(programName: string): React.ComponentType<{ className?: string }> {
  const name = programName.toLowerCase();
  if (name.includes('time') || name.includes('med')) return Clock;
  if (name.includes('mtm') || name.includes('future')) return Target;
  if (name.includes('test') || name.includes('treat')) return Zap;
  if (name.includes('a1c') || name.includes('hba1c')) return Activity;
  if (name.includes('oral') || name.includes('contraceptive')) return Heart;
  return BookOpen;
}

/**
 * Programs page - Browse all available clinical programs
 */
export default function Programs() {
  const [programs, setPrograms] = useState<ProgramUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  /**
   * Load clinical programs from Supabase
   */
  useEffect(() => {
    let mounted = true;
    
    async function loadPrograms() {
      try {
        setLoading(true);
        setError(null);

        // Fetch programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .order('name');

        if (programsError) {
          throw new Error(programsError.message);
        }

        if (!mounted) return;

        const programsUI: ProgramUI[] = [];

        // For each program, count related resources
        for (const program of programsData || []) {
          // Count training modules
          const { count: moduleCount } = await supabase
            .from('training_modules')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id);

          // Count protocol manuals
          const { count: protocolCount } = await supabase
            .from('protocol_manuals')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id);

          // Count documentation forms
          const { count: formsCount } = await supabase
            .from('documentation_forms')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id);

          // Count additional resources
          const { count: additionalCount } = await supabase
            .from('additional_resources')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id);

          const totalResources = (moduleCount || 0) + (protocolCount || 0) + 
                               (formsCount || 0) + (additionalCount || 0);

          programsUI.push({
            id: program.id,
            name: safeText(program.name),
            description: safeText(program.description || program.overview),
            slug: safeText(program.slug),
            level: safeText(program.experience_level),
            moduleCount: moduleCount || 0,
            resourceCount: totalResources
          });
        }

        if (mounted) {
          setPrograms(programsUI);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error loading programs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load programs');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPrograms();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter programs based on search and level
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || program.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Get unique experience levels
  const experienceLevels = ['all', ...new Set(programs.map(p => p.level).filter(Boolean))];

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Programs</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error loading programs: {error}</p>
            <p className="text-red-600 text-sm mt-1">
              Please check your Supabase configuration and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Clinical Training Programs</h1>
          <p className="text-gray-600">
            Comprehensive training modules and resources for community pharmacy clinical services
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">
              {programs.length} Programs Available
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700">
              Live from Supabase
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {experienceLevels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredPrograms.length} of {programs.length} programs
          </div>
        )}
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            {programs.length === 0 ? (
              <div>
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No programs available</p>
                <p className="text-sm">Clinical programs will appear here when added to the system.</p>
              </div>
            ) : (
              <div>
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No programs match your search</p>
                <p className="text-sm mb-4">Try adjusting your search terms or filters.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLevel('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrograms.map((program) => {
            const Icon = getIconForProgram(program.name);
            return (
              <Card key={program.id} className="hover:shadow-lg transition-shadow duration-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {program.name}
                        </CardTitle>
                        {program.level && (
                          <Badge className={`text-xs ${getExperienceLevelColor(program.level)}`}>
                            {program.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {program.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{program.moduleCount} modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{program.resourceCount} resources</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link to={`/program/${program.slug}`}>
                    <Button className="w-full bg-brand-gradient hover:opacity-90">
                      View Program
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Call to Action */}
      {programs.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready to Transform Your Practice?
            </h3>
            <p className="text-gray-600 mb-6">
              Each program includes comprehensive training, protocols, and implementation resources 
              designed specifically for community pharmacy teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/resources">
                <Button variant="outline" className="bg-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse All Resources
                </Button>
              </Link>
              <Link to="/contact">
                <Button className="bg-brand-gradient">
                  <Users className="h-4 w-4 mr-2" />
                  Get Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}