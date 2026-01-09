import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, TrendingUp, Filter } from 'lucide-react';
import axios from 'axios';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  author?: string;
}

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');

  const sources = [
    { id: 'all', name: 'All Sources' },
    { id: 'bbc-news', name: 'BBC News' },
    { id: 'cnn', name: 'CNN' },
    { id: 'reuters', name: 'Reuters' },
    { id: 'the-guardian', name: 'The Guardian' },
  ];

  useEffect(() => {
    fetchNews();
  }, [selectedSource]);

  const fetchNews = async () => {
    setLoading(true);
    setError('');

    try {
      // Using NewsAPI - you'll need to add your API key
      const apiKey = (import.meta as any)?.env?.VITE_NEWS_API_KEY || 'demo';

      let url = '';
      if (selectedSource === 'all') {
        // Search for immigration-related news from all sources
        url = `https://newsapi.org/v2/everything?q=immigration OR visa OR citizenship&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
      } else {
        // Get news from specific source
        url = `https://newsapi.org/v2/everything?q=immigration OR visa OR citizenship&sources=${selectedSource}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
      }

      const response = await axios.get(url);

      if (response.data.status === 'ok') {
        setArticles(response.data.articles);
      } else {
        setError('Failed to fetch news');
      }
    } catch (err: any) {
      console.error('Error fetching news:', err);
      // If API fails, show demo data
      setArticles(getDemoArticles());
    } finally {
      setLoading(false);
    }
  };

  const getDemoArticles = (): NewsArticle[] => {
    return [
      {
        title: 'New Immigration Policy Changes Announced',
        description: 'Major updates to visa processing times and requirements have been announced by immigration authorities.',
        url: '#',
        urlToImage: '',
        publishedAt: new Date().toISOString(),
        source: { name: 'Reuters' },
        author: 'News Team'
      },
      {
        title: 'Global Migration Trends 2024',
        description: 'A comprehensive look at how migration patterns are evolving worldwide in response to economic and political changes.',
        url: '#',
        urlToImage: '',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'BBC News' },
        author: 'International Desk'
      },
      {
        title: 'Citizenship Application Processing Updates',
        description: 'Immigration services announce improvements to citizenship application processing times and digital services.',
        url: '#',
        urlToImage: '',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'CNN' },
        author: 'Policy Reporter'
      }
    ];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">

          {/* Source Filter */}
          <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSource === source.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}


        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* News Articles Grid */}
        {!loading && !error && (
          <div className="grid gap-6">
            {articles.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No articles found</h2>
                <p className="text-gray-400">
                  Try selecting a different source or check back later.
                </p>
              </div>
            ) : (
              articles.map((article, index) => (
                <article
                  key={index}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group"
                >
                  <div className="flex flex-col md:flex-row gap-4 p-6">
                    {/* Image */}
                    {article.urlToImage && (
                      <div className="md:w-48 h-48 md:h-32 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Source and Date */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/10 border border-primary-600/20 rounded-full text-xs font-medium text-primary-400">
                          <TrendingUp className="w-3 h-3" />
                          {article.source.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Description */}
                      {article.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {article.description}
                        </p>
                      )}

                      {/* Author and Read More */}
                      <div className="flex items-center justify-between">
                        {article.author && (
                          <span className="text-xs text-gray-500">
                            By {article.author}
                          </span>
                        )}
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          Read more
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Info Banner */}
        {!loading && articles.length > 0 && (
          <div className="mt-8 bg-primary-600/10 border border-primary-600/20 rounded-lg p-4">
            <p className="text-sm text-primary-400 text-center">
              News articles are aggregated from trusted sources including BBC, CNN, Reuters, and The Guardian
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
