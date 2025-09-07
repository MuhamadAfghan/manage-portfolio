-- Portfolio Management Database Schema

-- Create custom types
CREATE TYPE project_type AS ENUM ('individual', 'collaboration', 'client');
CREATE TYPE project_status AS ENUM ('draft', 'published');
CREATE TYPE skill_category AS ENUM ('frontend', 'backend', 'database', 'devops', 'design', 'other');
CREATE TYPE resource_type AS ENUM ('project', 'skill', 'api_key');

-- Projects table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    type project_type NOT NULL DEFAULT 'individual',
    status project_status NOT NULL DEFAULT 'draft',
    technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Media
    thumbnail_url TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Links
    demo_url TEXT,
    github_url TEXT,
    
    -- Project type specific fields
    client_name VARCHAR(255),
    client_contact VARCHAR(255),
    budget DECIMAL(10,2),
    team_members TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_private BOOLEAN DEFAULT false,
    
    -- Metadata
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Skills table
CREATE TABLE public.skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category skill_category NOT NULL DEFAULT 'other',
    level INTEGER CHECK (level >= 1 AND level <= 5) DEFAULT 3,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table
CREATE TABLE public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL UNIQUE,
    permissions TEXT[] DEFAULT ARRAY['read:projects', 'read:skills']::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Activity Logs table
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    resource_type resource_type NOT NULL,
    resource_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_type ON public.projects(type);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_priority ON public.projects(priority);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_skills_category ON public.skills(category);
CREATE INDEX idx_api_keys_key ON public.api_keys(key);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active);
CREATE INDEX idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Enable read access for authenticated users" ON public.projects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for project owners" ON public.projects
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Enable delete for project owners" ON public.projects
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for skills
CREATE POLICY "Enable read access for all" ON public.skills
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.skills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.skills
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.skills
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for api_keys  
CREATE POLICY "Enable read access for authenticated users" ON public.api_keys
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.api_keys
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.api_keys
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.api_keys
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for activity_logs
CREATE POLICY "Enable read access for authenticated users" ON public.activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample skills
INSERT INTO public.skills (name, category, level) VALUES
('React', 'frontend', 5),
('TypeScript', 'frontend', 5),
('Next.js', 'frontend', 5),
('Node.js', 'backend', 4),
('PostgreSQL', 'database', 4),
('Docker', 'devops', 3),
('Tailwind CSS', 'frontend', 5),
('Figma', 'design', 3),
('Git', 'other', 5),
('JavaScript', 'frontend', 5);

-- Generate a sample API key (you should change this in production)
INSERT INTO public.api_keys (name, key, permissions, is_active) VALUES
('Public Website Access', 'pk_portfolio_sample_key_change_me', ARRAY['read:projects', 'read:skills'], true);
