import { pool } from '../connection.js';

async function createJobsTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating jobs tables...');
    
    await client.query('BEGIN');

    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        
        -- Job Details
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        company_logo TEXT,
        location VARCHAR(255) NOT NULL,
        remote_type VARCHAR(50), -- 'remote', 'hybrid', 'onsite'
        
        -- Employment Details
        job_type VARCHAR(50) NOT NULL, -- 'full-time', 'part-time', 'contract', 'internship'
        experience_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'lead'
        salary_min INTEGER,
        salary_max INTEGER,
        salary_currency VARCHAR(10) DEFAULT 'USD',
        
        -- Visa Sponsorship
        visa_sponsorship BOOLEAN DEFAULT false,
        visa_types TEXT[], -- ['H1B', 'Green Card', 'UK Tier 2', 'Canada PR']
        relocation_assistance BOOLEAN DEFAULT false,
        
        -- Requirements
        skills TEXT[],
        requirements TEXT,
        benefits TEXT,
        
        -- Application
        application_url TEXT,
        application_email VARCHAR(255),
        application_deadline TIMESTAMP,
        
        -- Status
        status VARCHAR(50) DEFAULT 'active', -- 'active', 'closed', 'filled'
        views_count INTEGER DEFAULT 0,
        applications_count INTEGER DEFAULT 0,
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);

    // Create indexes for jobs table
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_visa_sponsorship ON jobs(visa_sponsorship);
      CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
      CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
    `);

    console.log('✅ Jobs table created');

    // Create job_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        
        -- Application Details
        cover_letter TEXT,
        resume_url TEXT,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewing', 'interview', 'rejected', 'accepted'
        
        -- Tracking
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(job_id, user_id)
      );
    `);

    // Create indexes for job_applications table
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_user ON job_applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
    `);

    console.log('✅ Job applications table created');

    // Create saved_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(user_id, job_id)
      );
    `);

    // Create indexes for saved_jobs table
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);
    `);

    console.log('✅ Saved jobs table created');

    // Create companies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL UNIQUE,
        logo TEXT,
        website TEXT,
        description TEXT,
        industry VARCHAR(100),
        size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'
        
        -- Immigration Friendliness
        sponsors_visas BOOLEAN DEFAULT false,
        visa_types_supported TEXT[],
        immigration_rating DECIMAL(3,2), -- 1.00 to 5.00
        
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Companies table created');

    await client.query('COMMIT');
    console.log('✅ All jobs tables created successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating jobs tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createJobsTables().catch(console.error);

