import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check for API key in headers for public access
  const apiKey = request.headers.get('x-api-key')

  if (apiKey) {
    // Validate API key
    const { data: keyData } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single()

    if (!keyData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
  } else {
    // Check if user is authenticated (for admin access)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let query = supabase.from('projects').select('*').eq('id', params.id)

  // For API key access, only return published projects and exclude private individual projects
  if (apiKey) {
    query = query.eq('status', 'published')
  }

  const { data: project, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Check if private individual project for API access
  if (apiKey && project.type === 'individual' && project.is_private) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({ project })
}

// PUT /api/projects/[id] - Update project (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const { data: project, error } = await supabase
      .from('projects')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        action: 'update',
        resource_type: 'project',
        resource_id: project.id,
        user_id: user.id,
        details: { title: project.title },
      },
    ])

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE /api/projects/[id] - Delete project (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get project details before deletion for logging
  const { data: project } = await supabase
    .from('projects')
    .select('title')
    .eq('id', params.id)
    .single()

  const { error } = await supabase.from('projects').delete().eq('id', params.id)

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  if (project) {
    await supabase.from('activity_logs').insert([
      {
        action: 'delete',
        resource_type: 'project',
        resource_id: params.id,
        user_id: user.id,
        details: { title: project.title },
      },
    ])
  }

  return NextResponse.json({ message: 'Project deleted successfully' })
}
