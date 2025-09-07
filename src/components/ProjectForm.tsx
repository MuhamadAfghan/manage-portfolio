'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RichTextEditor from '@/components/RichTextEditor'
import { Project } from '@/types/database'
import { Save, Upload, X } from 'lucide-react'

interface ProjectFormProps {
  project?: Partial<Project>
  isEdit?: boolean
}

export default function ProjectForm({
  project,
  isEdit = false,
}: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    content: project?.content || '',
    type:
      project?.type ||
      ('individual' as 'individual' | 'collaboration' | 'client'),
    status: project?.status || ('draft' as 'draft' | 'published'),
    technologies: project?.technologies || [],
    demo_url: project?.demo_url || '',
    github_url: project?.github_url || '',
    client_name: project?.client_name || '',
    client_contact: project?.client_contact || '',
    budget: project?.budget || '',
    team_members: project?.team_members || [],
    is_private: project?.is_private || false,
    thumbnail_url: project?.thumbnail_url || '',
  })

  const [techInput, setTechInput] = useState('')
  const [memberInput, setMemberInput] = useState('')

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }))
      setTechInput('')
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  const addTeamMember = () => {
    if (
      memberInput.trim() &&
      !formData.team_members.includes(memberInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        team_members: [...prev.team_members, memberInput.trim()],
      }))
      setMemberInput('')
    }
  }

  const removeTeamMember = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      team_members: prev.team_members.filter((m) => m !== member),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get the highest priority for new projects
      let priority = 1
      if (!isEdit) {
        const { data: projects } = await supabase
          .from('projects')
          .select('priority')
          .order('priority', { ascending: false })
          .limit(1)

        if (projects && projects.length > 0) {
          priority = (projects[0].priority || 0) + 1
        }
      }

      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget as string) : null,
        priority: isEdit ? project?.priority : priority,
        created_by: user.id,
      }

      let result
      if (isEdit && project?.id) {
        result = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id)
          .select()
      } else {
        result = await supabase.from('projects').insert([projectData]).select()
      }

      if (result.error) {
        throw result.error
      }

      router.push('/projects')
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error saving project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Project Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="client">Client Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the project"
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  handleInputChange('thumbnail_url', e.target.value)
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Detailed Content</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => handleInputChange('content', content)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technologies & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Technologies Used</Label>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology (e.g., React, Node.js)"
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTechnology())
                }
              />
              <Button type="button" onClick={addTechnology} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="gap-1">
                  {tech}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTechnology(tech)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="demo_url">Demo URL</Label>
              <Input
                id="demo_url"
                value={formData.demo_url}
                onChange={(e) => handleInputChange('demo_url', e.target.value)}
                placeholder="https://demo.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={formData.github_url}
                onChange={(e) =>
                  handleInputChange('github_url', e.target.value)
                }
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific fields */}
      {formData.type === 'client' && (
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) =>
                    handleInputChange('client_name', e.target.value)
                  }
                  placeholder="Client or company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_contact">Client Contact</Label>
                <Input
                  id="client_contact"
                  value={formData.client_contact}
                  onChange={(e) =>
                    handleInputChange('client_contact', e.target.value)
                  }
                  placeholder="Email or phone"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (Optional)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="Project budget"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {formData.type === 'collaboration' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="flex gap-2">
                <Input
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  placeholder="Add team member name"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addTeamMember())
                  }
                />
                <Button type="button" onClick={addTeamMember} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.team_members.map((member) => (
                  <Badge key={member} variant="outline" className="gap-1">
                    {member}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTeamMember(member)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? 'Update Project' : 'Create Project'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
