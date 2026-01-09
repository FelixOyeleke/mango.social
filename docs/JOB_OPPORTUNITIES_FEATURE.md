# 💼 Job Opportunities Feature - Implementation Plan

## Overview

Add a job board feature to help immigrants find employment opportunities, especially jobs that sponsor work visas (PR, UK Tier 2, etc.).

---

## 🎯 Feature Goals

1. **Help immigrants find visa-sponsored jobs**
2. **Connect employers with immigrant talent**
3. **Filter by visa sponsorship type**
4. **Show immigration-friendly companies**
5. **Track application status**

---

## 📊 Database Schema

### New Tables

#### 1. `jobs` Table
```sql
CREATE TABLE jobs (
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
    job_type VARCHAR(50) NOT NULL, -- 'full-time', 'part-time', 'contract'
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

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_visa_sponsorship ON jobs(visa_sponsorship);
CREATE INDEX idx_jobs_location ON jobs(location);
```

#### 2. `job_applications` Table
```sql
CREATE TABLE job_applications (
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

CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_user ON job_applications(user_id);
```

#### 3. `saved_jobs` Table
```sql
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);
```

#### 4. `companies` Table (Optional - for verified employers)
```sql
CREATE TABLE companies (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 Frontend Components

### Pages

#### 1. `JobBoard.tsx` - Main job listing page
```tsx
- Search and filter jobs
- Filter by visa sponsorship
- Filter by location, remote type
- Sort by date, salary, relevance
- Pagination
```

#### 2. `JobDetail.tsx` - Individual job page
```tsx
- Full job description
- Company information
- Visa sponsorship details
- Apply button
- Save job button
- Share job
```

#### 3. `PostJob.tsx` - Employer job posting
```tsx
- Job details form
- Visa sponsorship options
- Preview before posting
- Edit existing jobs
```

#### 4. `MyApplications.tsx` - User's applications
```tsx
- List of applied jobs
- Application status
- Saved jobs
- Application history
```

#### 5. `EmployerDashboard.tsx` - Employer view
```tsx
- Posted jobs
- Applications received
- Analytics (views, applications)
- Edit/close jobs
```

### Components

```
client/src/components/jobs/
├── JobCard.tsx              # Job listing card
├── JobFilters.tsx           # Filter sidebar
├── JobSearchBar.tsx         # Search input
├── ApplicationForm.tsx      # Apply to job form
├── VisaSponsorBadge.tsx    # Visa sponsorship badge
└── CompanyCard.tsx          # Company info card
```

---

## 🔌 API Endpoints

### Jobs
```
GET    /api/jobs                    # List all jobs (with filters)
GET    /api/jobs/:id                # Get single job
POST   /api/jobs                    # Create job (employer only)
PUT    /api/jobs/:id                # Update job (employer only)
DELETE /api/jobs/:id                # Delete job (employer only)
GET    /api/jobs/:id/applications   # Get job applications (employer only)
```

### Applications
```
GET    /api/applications            # User's applications
POST   /api/applications            # Apply to job
GET    /api/applications/:id        # Get application details
PUT    /api/applications/:id        # Update application status
DELETE /api/applications/:id        # Withdraw application
```

### Saved Jobs
```
GET    /api/saved-jobs              # User's saved jobs
POST   /api/saved-jobs              # Save a job
DELETE /api/saved-jobs/:id          # Unsave a job
```

### Companies
```
GET    /api/companies               # List companies
GET    /api/companies/:id           # Get company details
GET    /api/companies/:id/jobs      # Get company's jobs
```

---

## 🎯 Key Features

### 1. Visa Sponsorship Filters
- Filter by visa type (H1B, Green Card, UK Tier 2, Canada PR, etc.)
- Show only jobs with sponsorship
- Highlight sponsorship in job cards

### 2. Immigration-Friendly Companies
- Badge for verified sponsors
- Company ratings for immigration support
- Reviews from immigrant employees

### 3. Application Tracking
- Track application status
- Email notifications
- Application history

### 4. Smart Matching
- Match jobs to user profile
- Recommend based on skills
- Alert for new matching jobs

### 5. Resources
- Visa process guides
- Interview tips for immigrants
- Resume templates
- Success stories

---

## 📱 UI/UX Mockup

```
┌─────────────────────────────────────────────────┐
│  🔍 Search jobs...          [Filters ▼]         │
├─────────────────────────────────────────────────┤
│  ☑ Visa Sponsorship Only                        │
│  Visa Type: [All ▼] Location: [All ▼]          │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │ 💼 Senior Software Engineer               │  │
│  │ TechCorp Inc. • San Francisco, CA         │  │
│  │ 💰 $120k-$180k  🌍 Remote  ✅ H1B Sponsor │  │
│  │ Posted 2 days ago • 45 applicants         │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ 💼 Data Analyst                           │  │
│  │ DataCo • London, UK                       │  │
│  │ 💰 £50k-£70k  🏢 Hybrid  ✅ Tier 2 Sponsor│  │
│  │ Posted 1 week ago • 23 applicants         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Steps

### Phase 1: Database & Backend (Week 1-2)
1. Create database migration for jobs tables
2. Create job models and controllers
3. Implement job CRUD API endpoints
4. Add authentication/authorization
5. Add search and filter logic

### Phase 2: Frontend - Basic (Week 3-4)
6. Create JobBoard page
7. Create JobDetail page
8. Create JobCard component
9. Add search and filters
10. Implement pagination

### Phase 3: Applications (Week 5-6)
11. Create application system
12. Add ApplicationForm component
13. Create MyApplications page
14. Add email notifications
15. Implement status tracking

### Phase 4: Employer Features (Week 7-8)
16. Create PostJob page
17. Create EmployerDashboard
18. Add job analytics
19. Implement application management

### Phase 5: Advanced Features (Week 9-10)
20. Add saved jobs feature
21. Implement smart matching
22. Add company profiles
23. Create resources section
24. Add job alerts/notifications

---

## 💡 Additional Ideas

1. **Visa Calculator** - Estimate visa processing time
2. **Salary Comparison** - Compare salaries across countries
3. **Immigration Lawyer Directory** - Connect with lawyers
4. **Success Stories** - Immigrants who got jobs
5. **Networking Events** - Job fairs, meetups
6. **Mentorship Program** - Connect with mentors
7. **Skills Assessment** - Match skills to jobs
8. **Resume Review** - AI-powered resume feedback

---

**Ready to implement? Let's start with Phase 1!** 🚀

