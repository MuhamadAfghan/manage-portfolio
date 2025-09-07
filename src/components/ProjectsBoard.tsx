'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { Project } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, ExternalLink, Github, Eye } from 'lucide-react'
import Link from 'next/link'

interface SortableProjectCardProps {
  project: Project
}

function SortableProjectCard({ project }: SortableProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getStatusColor = (status: string) => {
    return status === 'published'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800'
      case 'collaboration':
        return 'bg-purple-100 text-purple-800'
      case 'client':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-move transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{project.title}</CardTitle>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            </div>
            {project.thumbnail_url && (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="ml-4 h-16 w-16 rounded-md object-cover"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Badge className={getTypeColor(project.type)}>{project.type}</Badge>
          </div>

          {project.technologies.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.technologies.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/projects/${project.id}/edit`}>
                <Eye className="mr-1 h-4 w-4" />
                Edit
              </Link>
            </Button>
            {project.demo_url && (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Demo
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-1 h-4 w-4" />
                  Code
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProjectsBoard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createBrowserClient()

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('priority', { ascending: true })

        if (error) {
          console.error('Error fetching projects:', error)
        } else {
          setProjects(data || [])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = projects.findIndex((project) => project.id === active.id)
      const newIndex = projects.findIndex((project) => project.id === over?.id)

      const newProjects = arrayMove(projects, oldIndex, newIndex)
      setProjects(newProjects)

      // Update priorities in database
      const supabase = createBrowserClient()

      try {
        const updates = newProjects.map((project, index) => ({
          id: project.id,
          priority: index + 1,
        }))

        for (const update of updates) {
          await supabase
            .from('projects')
            .update({ priority: update.priority })
            .eq('id', update.id)
        }
      } catch (error) {
        console.error('Error updating project priorities:', error)
        // Revert on error
        const { data } = await supabase
          .from('projects')
          .select('*')
          .order('priority', { ascending: true })
        setProjects(data || [])
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="space-y-2">
                <div className="h-5 w-1/3 animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drag and drop to reorder projects
        </p>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
              <p className="mb-4 text-muted-foreground">
                Create your first project to get started
              </p>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {projects.map((project) => (
                <SortableProjectCard key={project.id} project={project} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
