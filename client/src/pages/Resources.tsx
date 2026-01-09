export default function Resources() {
  const links = [
    { label: 'USCIS Visa Overview', href: 'https://www.uscis.gov/working-in-the-united-states' },
    { label: 'Resume review tips', href: 'https://www.coursera.org/articles/how-to-write-a-resume' },
    { label: 'Interview prep checklist', href: 'https://www.themuse.com/advice/interview-checklist' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-4">Resources</h1>
        <p className="text-gray-300 mb-6">
          Curated guides and references for immigrants navigating careers and visas.
        </p>
        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-gray-800 hover:border-primary-600 transition-colors bg-gray-900 text-primary-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
