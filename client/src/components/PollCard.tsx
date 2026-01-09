import { useState } from 'react';
import { CheckCircle2, BarChart3 } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface PollOption {
  id: string;
  option_text: string;
  votes_count: number;
  option_order: number;
  has_voted?: boolean;
}

interface Poll {
  id: string;
  story_id: string;
  question: string;
  expires_at?: string;
  options: PollOption[];
  total_votes: number;
  user_voted_option_id?: string;
}

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { isAuthenticated } = useAuthStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.user_voted_option_id || null);
  const queryClient = useQueryClient();

  const voteMutation = useMutation(
    async (optionId: string) => {
      await axios.post('/api/polls/vote', { poll_option_id: optionId });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stories');
      },
    }
  );

  const handleVote = (optionId: string) => {
    if (!isAuthenticated || selectedOption) return;
    setSelectedOption(optionId);
    voteMutation.mutate(optionId);
  };

  const hasVoted = !!selectedOption;
  const totalVotes = poll.total_votes || 0;

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  return (
    <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-900/50">
      {/* Poll Question */}
      <div className="flex items-start gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {poll.question}
        </h3>
      </div>

      {/* Poll Options */}
      <div className="space-y-2">
        {poll.options
          .sort((a, b) => a.option_order - b.option_order)
          .map((option) => {
            const percentage = getPercentage(option.votes_count);
            const isSelected = selectedOption === option.id;
            const isWinning = hasVoted && option.votes_count === Math.max(...poll.options.map(o => o.votes_count));

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isExpired || !isAuthenticated}
                className={`w-full text-left relative overflow-hidden rounded-xl border-2 transition-all ${
                  hasVoted || isExpired
                    ? 'cursor-default'
                    : 'cursor-pointer hover:border-primary-400 dark:hover:border-primary-600'
                } ${
                  isSelected
                    ? 'border-primary-600 dark:border-primary-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Progress Bar Background */}
                {hasVoted && (
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isWinning
                        ? 'bg-primary-100 dark:bg-primary-900/30'
                        : 'bg-gray-100 dark:bg-gray-800/50'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Option Content */}
                <div className="relative px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${
                      hasVoted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.option_text}
                    </span>
                  </div>

                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {percentage}%
                      </span>
                      {option.votes_count > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({option.votes_count} {option.votes_count === 1 ? 'vote' : 'votes'})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
      </div>

      {/* Poll Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        {poll.expires_at && (
          <span>
            {isExpired ? 'Poll ended' : `Ends ${new Date(poll.expires_at).toLocaleDateString()}`}
          </span>
        )}
      </div>
    </div>
  );
}

