import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/projects - Get all projects (public endpoint with API key auth)
export async function GET(request: NextRequest) {
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

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id)
  } else {
    // Check if user is authenticated (for admin access)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const limit = searchParams.get('limit')

  let query = supabase
    .from('projects')
    .select('*')
    .order('priority', { ascending: true })

  // Apply filters
  if (type && ['individual', 'collaboration', 'client'].includes(type)) {
    query = query.eq('type', type)
  }

  if (status && ['draft', 'published'].includes(status)) {
    query = query.eq('status', status)
  }

  // For API key access, only return published projects and exclude private individual projects
  if (apiKey) {
    query = query.eq('status', 'published')
    if (type !== 'individual') {
      query = query.neq('type', 'individual').or('is_private.eq.false')
    } else {
      query = query.eq('is_private', false)
    }
  }

  if (limit) {
    const limitNum = parseInt(limit)
    if (!isNaN(limitNum) && limitNum > 0) {
      query = query.limit(limitNum)
    }
  }

  const { data: projects, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects })
}

// POST /api/projects - Create new project (admin only)
export async function POST(request: NextRequest) {
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

    // Get the highest priority for new projects
    const { data: projects } = await supabase
      .from('projects')
      .select('priority')
      .order('priority', { ascending: false })
      .limit(1)

    const priority =
      projects && projects.length > 0 ? (projects[0].priority || 0) + 1 : 1

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          ...body,
          priority,
          created_by: user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        action: 'create',
        resource_type: 'project',
        resource_id: project.id,
        user_id: user.id,
        details: { title: project.title },
      },
    ])

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
