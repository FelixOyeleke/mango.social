import { pool } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedJobs() {
  try {
    console.log('🌱 Seeding sample jobs...');

    // Get the admin user ID
    const adminResult = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@immigrantvoices.com' LIMIT 1"
    );

    if (adminResult.rows.length === 0) {
      console.error('❌ Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    const employerId = adminResult.rows[0].id;

    const sampleJobs = [
      {
        employer_id: employerId,
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer to join our team. You will work on cutting-edge technologies and help build scalable applications.',
        company_name: 'TechCorp Inc',
        location: 'San Francisco, CA',
        remote_type: 'hybrid',
        job_type: 'full-time',
        experience_level: 'senior',
        salary_min: 120000,
        salary_max: 180000,
        salary_currency: 'USD',
        visa_sponsorship: true,
        visa_types: ['H1B', 'Green Card'],
        relocation_assistance: true,
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        requirements: '5+ years of experience in software development\nStrong knowledge of React and Node.js\nExperience with cloud platforms',
        benefits: 'Health insurance, 401k, unlimited PTO, stock options',
        application_email: 'jobs@techcorp.com',
        status: 'active'
      },
      {
        employer_id: employerId,
        title: 'Data Scientist',
        description: 'Join our data science team to work on machine learning models and data analytics projects.',
        company_name: 'DataFlow Analytics',
        location: 'New York, NY',
        remote_type: 'remote',
        job_type: 'full-time',
        experience_level: 'mid',
        salary_min: 100000,
        salary_max: 150000,
        salary_currency: 'USD',
        visa_sponsorship: true,
        visa_types: ['H1B', 'O1'],
        relocation_assistance: false,
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
        requirements: '3+ years of experience in data science\nStrong Python skills\nExperience with ML frameworks',
        benefits: 'Health insurance, 401k, remote work, professional development budget',
        application_email: 'careers@dataflow.com',
        status: 'active'
      },
      {
        employer_id: employerId,
        title: 'DevOps Engineer',
        description: 'We need a DevOps engineer to help us build and maintain our cloud infrastructure.',
        company_name: 'CloudScale Solutions',
        location: 'Austin, TX',
        remote_type: 'hybrid',
        job_type: 'full-time',
        experience_level: 'mid',
        salary_min: 110000,
        salary_max: 160000,
        salary_currency: 'USD',
        visa_sponsorship: true,
        visa_types: ['H1B', 'TN'],
        relocation_assistance: true,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
        requirements: '3+ years of DevOps experience\nStrong knowledge of AWS\nExperience with containerization',
        benefits: 'Health insurance, 401k, flexible hours, gym membership',
        application_email: 'hiring@cloudscale.com',
        status: 'active'
      },
      {
        employer_id: employerId,
        title: 'Frontend Developer',
        description: 'Looking for a talented frontend developer to create beautiful user interfaces.',
        company_name: 'DesignHub',
        location: 'Seattle, WA',
        remote_type: 'remote',
        job_type: 'full-time',
        experience_level: 'junior',
        salary_min: 80000,
        salary_max: 120000,
        salary_currency: 'USD',
        visa_sponsorship: false,
        visa_types: [],
        relocation_assistance: false,
        skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Figma'],
        requirements: '2+ years of frontend development\nStrong React skills\nEye for design',
        benefits: 'Health insurance, 401k, remote work',
        application_email: 'jobs@designhub.com',
        status: 'active'
      },
      {
        employer_id: employerId,
        title: 'Product Manager',
        description: 'We are seeking a product manager to lead our product development initiatives.',
        company_name: 'InnovateTech',
        location: 'Boston, MA',
        remote_type: 'onsite',
        job_type: 'full-time',
        experience_level: 'senior',
        salary_min: 130000,
        salary_max: 190000,
        salary_currency: 'USD',
        visa_sponsorship: true,
        visa_types: ['H1B', 'Green Card', 'L1'],
        relocation_assistance: true,
        skills: ['Product Management', 'Agile', 'User Research', 'Analytics'],
        requirements: '5+ years of product management experience\nStrong leadership skills\nTech background preferred',
        benefits: 'Health insurance, 401k, stock options, unlimited PTO',
        application_email: 'pm-jobs@innovatetech.com',
        status: 'active'
      }
    ];

    for (const job of sampleJobs) {
      await pool.query(
        `INSERT INTO jobs (
          employer_id, title, description, company_name, location, remote_type,
          job_type, experience_level, salary_min, salary_max, salary_currency,
          visa_sponsorship, visa_types, relocation_assistance, skills, requirements,
          benefits, application_email, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          job.employer_id, job.title, job.description, job.company_name, job.location,
          job.remote_type, job.job_type, job.experience_level, job.salary_min,
          job.salary_max, job.salary_currency, job.visa_sponsorship, job.visa_types,
          job.relocation_assistance, job.skills, job.requirements, job.benefits,
          job.application_email, job.status
        ]
      );
      console.log(`✅ Created job: ${job.title} at ${job.company_name}`);
    }

    console.log('\n✅ Successfully seeded sample jobs!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding jobs:', error);
    process.exit(1);
  }
}

seedJobs();

