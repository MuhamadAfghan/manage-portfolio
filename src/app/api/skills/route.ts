import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/skills - Get all skills (public endpoint with API key auth)
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
  const category = searchParams.get('category')

  let query = supabase
    .from('skills')
    .select('*')
    .order('name', { ascending: true })

  // Apply filters
  if (
    category &&
    ['frontend', 'backend', 'database', 'devops', 'design', 'other'].includes(
      category,
    )
  ) {
    query = query.eq('category', category)
  }

  const { data: skills, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ skills })
}

// POST /api/skills - Create new skill (admin only)
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

    const { data: skill, error } = await supabase
      .from('skills')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        action: 'create',
        resource_type: 'skill',
        resource_id: skill.id,
        user_id: user.id,
        details: { name: skill.name },
      },
    ])

    return NextResponse.json({ skill }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
