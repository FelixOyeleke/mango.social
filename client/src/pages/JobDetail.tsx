import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { ArrowLeft, MapPin, Globe, DollarSign, Building2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    ['job', id],
    async () => {
      const response = await axios.get(`/api/jobs/${id}`);
      return response.data.data.job;
    },
    { enabled: Boolean(id) }
  );

  if (!id) {
    return <div className="min-h-screen flex items-center justify-center">Job ID is required</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400">We couldn&apos;t load this job.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-6 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center text-white text-lg font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{data.title}</h1>
              <div className="text-gray-400 text-sm">{data.company_name}</div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400 mt-2">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {data.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {data.remote_type || 'Onsite'}
                </span>
                {data.salary_min && data.salary_max && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {data.salary_currency} {data.salary_min?.toLocaleString()} - {data.salary_max?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-200 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
              <p className="whitespace-pre-line text-gray-300">{data.description || 'No description provided.'}</p>
            </section>

            {data.skills && data.skills.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {data.visa_types && data.visa_types.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-2">Visa Types</h2>
                <div className="flex flex-wrap gap-2">
                  {data.visa_types.map((visa: string) => (
                    <span key={visa} className="px-3 py-1 bg-primary-600/10 text-primary-400 rounded-lg text-sm">
                      {visa}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-400">
            <Link to="/jobs" className="text-primary-400 hover:underline">
              View more jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
