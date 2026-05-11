'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error specifically for the feed team to debug
    console.error('Public Feed Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-bold">The feed is temporarily unavailable.</h2>
      <button
        onClick={() => reset()} // Re-renders only the feed segment
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try Again
      </button>
    </div>
  );
}