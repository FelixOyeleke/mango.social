import { pool } from './connection.js';
import bcrypt from 'bcryptjs';

async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Starting database seed...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await client.query('TRUNCATE users, stories, comments, likes, bookmarks, newsletter_subscribers CASCADE');
    
    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const usersResult = await client.query(`
      INSERT INTO users (email, password_hash, full_name, avatar_url, bio, country_of_origin, current_location, role)
      VALUES 
        ('maria.rodriguez@email.com', $1, 'Maria Rodriguez', 'https://i.pravatar.cc/150?img=1', 'Software engineer from Mexico, passionate about helping others navigate their immigration journey.', 'Mexico', 'San Francisco, USA', 'user'),
        ('ahmed.hassan@email.com', $1, 'Ahmed Hassan', 'https://i.pravatar.cc/150?img=12', 'Doctor from Egypt, sharing my experiences adapting to a new healthcare system.', 'Egypt', 'Toronto, Canada', 'user'),
        ('li.wei@email.com', $1, 'Li Wei', 'https://i.pravatar.cc/150?img=32', 'Entrepreneur from China, building bridges between cultures through business.', 'China', 'New York, USA', 'user'),
        ('priya.sharma@email.com', $1, 'Priya Sharma', 'https://i.pravatar.cc/150?img=5', 'Teacher from India, dedicated to education and cultural exchange.', 'India', 'London, UK', 'user'),
        ('carlos.santos@email.com', $1, 'Carlos Santos', 'https://i.pravatar.cc/150?img=15', 'Chef from Brazil, bringing flavors from home to my new community.', 'Brazil', 'Miami, USA', 'user'),
        ('fatima.ali@email.com', $1, 'Fatima Ali', 'https://i.pravatar.cc/150?img=9', 'Nurse from Pakistan, committed to healthcare and community service.', 'Pakistan', 'Sydney, Australia', 'user'),
        ('yuki.tanaka@email.com', $1, 'Yuki Tanaka', 'https://i.pravatar.cc/150?img=47', 'Designer from Japan, blending traditional and modern aesthetics.', 'Japan', 'Berlin, Germany', 'user'),
        ('elena.popov@email.com', $1, 'Elena Popov', 'https://i.pravatar.cc/150?img=10', 'Scientist from Russia, researching climate change solutions.', 'Russia', 'Stockholm, Sweden', 'user'),
        ('james.okonkwo@email.com', $1, 'James Okonkwo', 'https://i.pravatar.cc/150?img=33', 'Engineer from Nigeria, working on sustainable technology.', 'Nigeria', 'Vancouver, Canada', 'user'),
        ('sofia.garcia@email.com', $1, 'Sofia Garcia', 'https://i.pravatar.cc/150?img=20', 'Artist from Spain, expressing cultural identity through art.', 'Spain', 'Los Angeles, USA', 'user')
      RETURNING id, full_name
    `, [hashedPassword]);
    
    const users = usersResult.rows;
    console.log(`✅ Created ${users.length} users`);
    
    // Create stories
    console.log('Creating stories...');
    const stories = [
      {
        author_id: users[0].id,
        title: 'From Mexico to Silicon Valley: My Journey as a Software Engineer',
        excerpt: 'How I overcame language barriers and cultural differences to build a career in tech.',
        content: `When I first arrived in San Francisco five years ago, I could barely speak English and had never seen a tech startup. Today, I'm a senior software engineer at a leading company, and I want to share my journey with you.

The Beginning
I grew up in Guadalajara, Mexico, where I studied computer science. Despite having good grades, I knew that opportunities in tech were limited. I dreamed of working in Silicon Valley, but it seemed impossible.

The Visa Journey
Getting my H-1B visa was one of the most stressful experiences of my life. The uncertainty, the paperwork, the waiting – it was overwhelming. But I persevered, and when I finally got approved, I cried tears of joy.

Cultural Adaptation
The hardest part wasn't the technical work – it was the cultural differences. In Mexico, we're more direct and personal. In the US, especially in tech, communication is different. I had to learn to navigate meetings, understand implicit communication, and build relationships in a new way.

Language Barriers
My English was basic when I arrived. I spent nights watching American TV shows, reading technical documentation, and practicing with language exchange partners. Every presentation at work was terrifying, but each one made me stronger.

Finding Community
Connecting with other Latino immigrants in tech was crucial. We formed a support group where we could share experiences, practice English, and help each other navigate the system. This community became my second family.

Advice for Others
1. Don't let fear hold you back
2. Invest in language skills early
3. Find your community
4. Be patient with yourself
5. Remember why you started

Today, I mentor other immigrants trying to break into tech. If I can do it, so can you.`,
        category: 'Career',
        tags: ['technology', 'career', 'visa', 'language-learning'],
        featured_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        author_id: users[1].id,
        title: 'Healing Across Borders: A Doctor\'s Story of Adaptation',
        excerpt: 'Navigating medical licensing, cultural differences in healthcare, and finding my place in a new system.',
        content: `As a doctor who practiced in Egypt for 10 years, moving to Canada meant starting over. Here's my story of resilience and adaptation.

The Reality Check
I arrived in Toronto thinking my medical degree would transfer easily. I was wrong. The licensing process took three years, countless exams, and more money than I had budgeted.

Working Below My Qualifications
While studying for my Canadian medical exams, I worked as a medical assistant. It was humbling to take orders from doctors younger than me, but it taught me patience and the Canadian healthcare system from the ground up.

Cultural Differences in Medicine
Healthcare in Canada is different from Egypt. The doctor-patient relationship, the pace of work, the emphasis on documentation – everything required adjustment. I had to unlearn some habits and develop new ones.

The Exam Marathon
MCCQE Part 1, Part 2, NAC OSCE – each exam was a mountain to climb. I studied while working full-time, supporting my family, and dealing with homesickness. There were moments I wanted to give up.

Finally Licensed
When I finally received my license to practice, it felt like winning the lottery. All those years of struggle suddenly made sense.

Giving Back
Now, I volunteer to help other immigrant doctors navigate the licensing process. I know how lonely and difficult it can be, and I want to make it easier for others.`,
        category: 'Healthcare',
        tags: ['healthcare', 'licensing', 'career-change', 'resilience'],
        featured_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        author_id: users[2].id,
        title: 'Building a Business in a Foreign Land: Lessons from My Startup Journey',
        excerpt: 'How I turned cultural differences into a competitive advantage and built a successful company.',
        content: `Starting a business is hard. Starting one in a foreign country where you don't speak the language fluently? That's a whole different challenge.

The Idea
I noticed that many Chinese businesses wanted to expand to the US, but struggled with cultural differences and business practices. Having lived in both countries, I saw an opportunity to bridge this gap.

Early Struggles
My first year was brutal. I didn't understand American business culture, networking felt awkward, and I made countless mistakes. I once showed up to a business meeting in a full suit when everyone else was in jeans and t-shirts.

Learning to Network
In China, business relationships are built over long dinners and personal connections. In the US, it's more transactional. I had to learn to pitch my business in 30 seconds, follow up professionally, and build trust differently.

The Breakthrough
My breakthrough came when I stopped trying to be "American" and started embracing my unique perspective. My Chinese background wasn't a weakness – it was my superpower. I understood both cultures deeply.

Growing the Team
Hiring was challenging. I wanted to build a diverse team that reflected both cultures, but finding people who understood my vision was difficult. I learned to look for cultural adaptability over just skills.

Current Success
Today, my company has 50 employees and works with over 100 clients. We've facilitated millions in cross-border business. But more importantly, we've helped hundreds of businesses understand each other across cultures.

Advice for Immigrant Entrepreneurs
1. Your cultural background is an asset, not a liability
2. Build a network before you need it
3. Don't be afraid to ask for help
4. Embrace failure as learning
5. Stay connected to both cultures`,
        category: 'Business',
        tags: ['entrepreneurship', 'business', 'networking', 'cross-cultural'],
        featured_image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        author_id: users[3].id,
        title: 'Teaching in a New Country: Adapting My Methods and Finding My Voice',
        excerpt: 'From India to the UK, how I learned to teach in a multicultural classroom.',
        content: `Teaching was my calling in India. When I moved to London, I discovered that being a good teacher means constantly adapting and learning.

The Classroom Culture Shock
My first day teaching in a London school was overwhelming. The students were from 30 different countries, spoke 20 different languages, and had vastly different educational backgrounds. My Indian teaching methods didn't work.

Rethinking Authority
In India, teachers are highly respected authority figures. In the UK, the relationship is more collaborative. Students question, debate, and challenge. At first, I felt disrespected. Then I realized this was an opportunity to grow.

Language Challenges
Even though I spoke English fluently, I struggled with accents, slang, and cultural references. When a student said something was "sick" (meaning cool), I thought they were ill!

Embracing Diversity
I learned to see diversity as a strength. My classroom became a place where students shared their cultures, and we all learned from each other. I incorporated stories and examples from different cultures into my lessons.

Professional Development
I had to get UK teaching qualifications, which meant studying while working full-time. It was exhausting but necessary. The process taught me about the British education system and pedagogy.

Making an Impact
Now, five years later, I'm head of the multicultural education program at my school. I help other immigrant teachers adapt and thrive. My Indian background gives me unique insights into supporting diverse learners.`,
        category: 'Education',
        tags: ['teaching', 'education', 'cultural-adaptation', 'diversity'],
        featured_image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        author_id: users[4].id,
        title: 'Flavors of Home: Opening a Brazilian Restaurant in Miami',
        excerpt: 'How I brought authentic Brazilian cuisine to America while adapting to local tastes.',
        content: `Food is more than sustenance – it's culture, memory, and identity. Opening my restaurant was about sharing a piece of Brazil with my new home.

The Dream
I grew up in my grandmother's kitchen in São Paulo, learning to make feijoada, pão de queijo, and brigadeiros. When I moved to Miami, I missed authentic Brazilian food. So I decided to create it.

The Business Challenge
I had cooking skills but no business experience. I took night classes in restaurant management, learned about US health codes, and studied the local market. The learning curve was steep.

Menu Adaptation
Americans weren't familiar with many Brazilian dishes. I had to balance authenticity with accessibility. Some dishes I kept traditional, others I adapted. My "Brazilian-American fusion" became our signature.

Building a Team
Finding staff who understood Brazilian cuisine was hard. I trained American cooks in Brazilian techniques and hired Brazilian immigrants who needed opportunities. We became a family.

Cultural Ambassador
My restaurant became more than a business – it's a cultural center. We host Brazilian music nights, teach cooking classes, and celebrate Brazilian holidays. We're keeping our culture alive while sharing it with others.

Success and Growth
Three years in, we're thriving. We've been featured in local magazines, won awards, and most importantly, we've created a community. Brazilians come for a taste of home, Americans come to experience Brazil.`,
        category: 'Business',
        tags: ['food', 'entrepreneurship', 'culture', 'community'],
        featured_image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        author_id: users[5].id,
        title: 'Caring Across Cultures: A Nurse\'s Journey from Pakistan to Australia',
        excerpt: 'Navigating healthcare systems, cultural sensitivities, and finding my place in nursing.',
        content: `Nursing is universal, but how we care is deeply cultural. My journey from Karachi to Sydney taught me that compassion transcends borders.

The Decision to Move
I was a senior nurse in Pakistan, but I wanted better opportunities for my children. Australia's nursing shortage meant opportunities, but also challenges.

Credential Recognition
Getting my nursing credentials recognized took 18 months. I had to prove my education was equivalent, pass English tests, and complete additional training. It was frustrating but necessary.

Cultural Competency
In Pakistan, family involvement in patient care is expected. In Australia, privacy laws are strict. I had to learn new boundaries while maintaining my compassionate approach.

Religious and Cultural Sensitivity
As a Muslim woman wearing hijab, I faced some prejudice. But I also found that my cultural background helped me connect with diverse patients. I could relate to their experiences of being "different."

Night Shifts and Family
Working night shifts while raising children was brutal. My husband had to adapt to new roles, and we relied heavily on our mosque community for support.

Making a Difference
Now I specialize in working with immigrant and refugee patients. I understand their fears, their cultural needs, and their challenges. I can be the nurse I wish I had when I first arrived.`,
        category: 'Healthcare',
        tags: ['nursing', 'healthcare', 'cultural-competency', 'family'],
        featured_image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        author_id: users[6].id,
        title: 'Design Without Borders: Blending Japanese Aesthetics with German Functionality',
        excerpt: 'How I found my unique design voice by combining two distinct cultural approaches.',
        content: `Design is my language, and moving from Tokyo to Berlin taught me to speak in new dialects.

The Move
I came to Berlin for its vibrant creative scene. As a designer, I was drawn to the city's experimental spirit and multicultural energy.

Cultural Design Differences
Japanese design emphasizes minimalism, harmony, and subtle beauty. German design values functionality, clarity, and efficiency. At first, these seemed contradictory.

Finding My Voice
Instead of choosing one approach, I learned to blend them. My work became known for combining Japanese aesthetic sensibility with German functional precision. This fusion became my signature.

The Freelance Journey
Starting as a freelance designer in a new country was scary. I had no network, limited German language skills, and didn't understand the business culture. Cold emailing became my survival skill.

Building a Portfolio
I took on small projects, often for less than I deserved, to build my portfolio and reputation. Each project taught me about German client expectations and business practices.

Studio Success
Today, I run a small design studio with an international team. We work with clients across Europe and Asia. My cross-cultural perspective is now my biggest asset.

Advice for Creative Immigrants
1. Your cultural background is your unique selling point
2. Network relentlessly
3. Be patient with language learning
4. Embrace both cultures in your work
5. Find your community`,
        category: 'Career',
        tags: ['design', 'creativity', 'freelancing', 'cross-cultural'],
        featured_image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        author_id: users[7].id,
        title: 'From Moscow to Stockholm: A Scientist\'s Climate Change Mission',
        excerpt: 'How I transitioned my research career and found new purpose in environmental science.',
        content: `Science knows no borders, but scientists do. My journey from Russia to Sweden was about more than changing locations – it was about finding my purpose.

The Research Opportunity
I was offered a position at a leading climate research institute in Stockholm. It was a dream opportunity, but it meant leaving everything familiar behind.

Academic Culture Shock
Russian and Swedish academic cultures are vastly different. In Russia, hierarchy is important. In Sweden, it's flat and collaborative. I had to learn to speak up and contribute differently.

Language in Science
While scientific work is in English, daily life required Swedish. I struggled with social integration because I couldn't participate in casual conversations.

The Imposter Syndrome
Being an immigrant in a prestigious institution made me doubt myself constantly. Was I good enough? Did I deserve to be here? It took years to overcome these feelings.

Finding My Research Focus
Working on climate change in the Arctic gave me new perspective. This wasn't just academic – it was urgent and important. My work could make a real difference.

International Collaboration
My Russian background became an asset when collaborating with Russian research stations. I could bridge communication gaps and facilitate cooperation.

Current Impact
Now I lead an international research team. We're making discoveries that inform climate policy. My immigrant journey taught me resilience – essential for tackling climate change.`,
        category: 'Career',
        tags: ['science', 'research', 'climate-change', 'academia'],
        featured_image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
        status: 'published',
        published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      }
    ];

    const storyResults = [];
    for (const story of stories) {
      const slug = story.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const result = await client.query(`
        INSERT INTO stories (author_id, title, slug, excerpt, content, category, tags, featured_image_url, status, published_at, views_count, reading_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, title, author_id
      `, [
        story.author_id,
        story.title,
        slug,
        story.excerpt,
        story.content,
        story.category,
        story.tags,
        story.featured_image_url,
        story.status,
        story.published_at,
        Math.floor(Math.random() * 500) + 100, // Random views between 100-600
        Math.ceil(story.content.split(' ').length / 200) // Approximate reading time
      ]);

      storyResults.push(result.rows[0]);
    }

    console.log(`✅ Created ${storyResults.length} stories`);

    // Create comments
    console.log('Creating comments...');
    const comments = [
      { story_id: storyResults[0].id, user_id: users[1].id, content: 'This resonates so much with me! I went through a similar visa journey. The waiting is the hardest part.' },
      { story_id: storyResults[0].id, user_id: users[3].id, content: 'Thank you for sharing this. Your advice about finding community is so important. It saved me too.' },
      { story_id: storyResults[0].id, user_id: users[5].id, content: 'Inspiring story! I\'m currently learning to code and this gives me hope.' },
      { story_id: storyResults[1].id, user_id: users[0].id, content: 'As someone in tech, I have so much respect for doctors who go through this process. The dedication is incredible.' },
      { story_id: storyResults[1].id, user_id: users[5].id, content: 'Fellow healthcare worker here! The licensing process is brutal but worth it. Keep going!' },
      { story_id: storyResults[2].id, user_id: users[4].id, content: 'This is exactly what I needed to read. I\'m thinking of starting my own business and your story is so motivating.' },
      { story_id: storyResults[2].id, user_id: users[6].id, content: 'The part about embracing your cultural background as an asset really hit home. Thank you!' },
      { story_id: storyResults[3].id, user_id: users[2].id, content: 'Beautiful story! Education is such a powerful way to bridge cultures.' },
      { story_id: storyResults[4].id, user_id: users[0].id, content: 'I need to visit your restaurant! Brazilian food is amazing.' },
      { story_id: storyResults[5].id, user_id: users[1].id, content: 'Thank you for your service in healthcare. We need more culturally competent nurses like you.' },
    ];

    for (const comment of comments) {
      await client.query(`
        INSERT INTO comments (story_id, user_id, content)
        VALUES ($1, $2, $3)
      `, [comment.story_id, comment.user_id, comment.content]);
    }

    console.log(`✅ Created ${comments.length} comments`);

    // Create likes
    console.log('Creating likes...');
    const likes = [];
    for (let i = 0; i < storyResults.length; i++) {
      const numLikes = Math.floor(Math.random() * 5) + 3; // 3-7 likes per story
      for (let j = 0; j < numLikes; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        likes.push({ story_id: storyResults[i].id, user_id: randomUser.id });
      }
    }

    for (const like of likes) {
      try {
        await client.query(`
          INSERT INTO likes (story_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, story_id) DO NOTHING
        `, [like.story_id, like.user_id]);
      } catch (err) {
        // Ignore duplicate likes
      }
    }

    console.log(`✅ Created likes`);

    // Create bookmarks
    console.log('Creating bookmarks...');
    const bookmarks = [
      { user_id: users[0].id, story_id: storyResults[1].id },
      { user_id: users[0].id, story_id: storyResults[2].id },
      { user_id: users[1].id, story_id: storyResults[0].id },
      { user_id: users[2].id, story_id: storyResults[3].id },
      { user_id: users[3].id, story_id: storyResults[0].id },
    ];

    for (const bookmark of bookmarks) {
      await client.query(`
        INSERT INTO bookmarks (user_id, story_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, story_id) DO NOTHING
      `, [bookmark.user_id, bookmark.story_id]);
    }

    console.log(`✅ Created ${bookmarks.length} bookmarks`);

    // Create newsletter subscribers
    console.log('Creating newsletter subscribers...');
    const subscribers = [
      'john.doe@email.com',
      'jane.smith@email.com',
      'immigrant.stories@email.com',
      'newsletter.fan@email.com',
    ];

    for (const email of subscribers) {
      await client.query(`
        INSERT INTO newsletter_subscribers (email)
        VALUES ($1)
        ON CONFLICT (email) DO NOTHING
      `, [email]);
    }

    console.log(`✅ Created ${subscribers.length} newsletter subscribers`);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);

