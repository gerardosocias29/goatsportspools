import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { useAxios } from '../../../app/contexts/AxiosContext';

/**
 * Fetches CMS-managed content by key and renders sanitized HTML.
 * Admin edits at /admin/content go live immediately.
 */
const SiteContent = ({ contentKey, className = '' }) => {
  const { get } = useAxios();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await get(`/api/site-content/${contentKey}`);
        if (!ignore && res?.data?.status) setHtml(res.data.data?.body || '');
      } catch {
        // Leave empty on error — caller can show its own empty state if needed
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [contentKey, get]);

  const safe = useMemo(() => DOMPurify.sanitize(html || ''), [html]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!safe) {
    return <p className="text-sm text-gray-400 italic py-4">No content yet.</p>;
  }

  return (
    <div
      className={`site-content-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};

export default SiteContent;
