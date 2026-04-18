import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { useAxios } from '../../../app/contexts/AxiosContext';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import PageLoader from '../../components/common/PageLoader';

const SECTIONS = [
  { key: 'playoff_how_this_works', title: 'Playoff — How this Works' },
  { key: 'playoff_faqs', title: 'Playoff — FAQs' },
];

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'image', 'align',
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB soft cap — data URIs bloat the body

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ContentEditor = () => {
  const { get, put } = useAxios();
  const getRef = useRef(get);
  const putRef = useRef(put);
  getRef.current = get;
  putRef.current = put;

  const [activeKey, setActiveKey] = useState(SECTIONS[0].key);
  const [bodies, setBodies] = useState({});      // { key: htmlString }
  const [originals, setOriginals] = useState({}); // last-saved snapshot per key
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const quillRef = useRef(null);

  const flashToast = useCallback((kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const insertImageFromFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      flashToast('error', 'Please choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      flashToast('error', `Image too large (max ${MAX_IMAGE_BYTES / 1024 / 1024}MB).`);
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const editor = quillRef.current?.getEditor?.();
      if (!editor) return;
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', dataUrl, 'user');
      editor.setSelection(range.index + 1, 0);
    } catch {
      flashToast('error', 'Failed to read image.');
    }
  }, [flashToast]);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files && input.files[0]) {
        insertImageFromFile(input.files[0]);
      }
    };
    input.click();
  }, [insertImageFromFile]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        [{ align: [] }],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await Promise.all(
        SECTIONS.map(async ({ key }) => {
          try {
            const res = await getRef.current(`/api/site-content/${key}`);
            return [key, res?.data?.data?.body || ''];
          } catch {
            return [key, ''];
          }
        })
      );
      const map = Object.fromEntries(entries);
      setBodies(map);
      setOriginals(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const currentBody = bodies[activeKey] ?? '';
  const dirty = (originals[activeKey] ?? '') !== currentBody;

  const onChange = (html) => setBodies((prev) => ({ ...prev, [activeKey]: html }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await putRef.current(`/api/admin/site-content/${activeKey}`, { body: currentBody });
      if (res?.data?.status) {
        setOriginals((prev) => ({ ...prev, [activeKey]: currentBody }));
        flashToast('success', 'Saved. Players will see the new content on their next page load.');
      } else {
        flashToast('error', res?.data?.message || 'Failed to save');
      }
    } catch (err) {
      flashToast('error', err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const revert = () => {
    if (!dirty) return;
    if (window.confirm('Discard your unsaved changes to this section?')) {
      setBodies((prev) => ({ ...prev, [activeKey]: originals[activeKey] ?? '' }));
    }
  };

  const sanitizedPreview = useMemo(
    () => DOMPurify.sanitize(currentBody || '', {
      ADD_TAGS: ['img'],
      ADD_ATTR: ['src', 'alt', 'width', 'height'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    }),
    [currentBody]
  );

  if (loading) return <PageLoader inline />;

  return (
    <div className="space-y-5">
      <PageBreadcrumb pageTitle="Site Content" />

      {toast && (
        <div className={`rounded-lg border p-3 text-sm ${
          toast.kind === 'success'
            ? 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/20 text-success-600 dark:text-success-400'
            : 'bg-error-50 dark:bg-error-500/10 border-error-200 dark:border-error-500/20 text-error-600 dark:text-error-400'
        }`}>{toast.msg}</div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {SECTIONS.map((s) => {
          const isActive = s.key === activeKey;
          const sectionDirty = (originals[s.key] ?? '') !== (bodies[s.key] ?? '');
          return (
            <button
              key={s.key}
              onClick={() => setActiveKey(s.key)}
              className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 ${
                isActive
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {s.title}
              {sectionDirty && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-brand-500" title="Unsaved changes" />}
            </button>
          );
        })}
      </div>

      {/* Editor + preview */}
      <div className="grid lg:grid-cols-2 gap-5 mb-20">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Editor</h3>
            <span className="text-xs text-gray-400">{dirty ? 'Unsaved changes' : 'Up to date'}</span>
          </div>
          <div className="p-5 content-editor-quill">
            <ReactQuill
              key={activeKey}
              ref={quillRef}
              theme="snow"
              value={currentBody}
              onChange={onChange}
              modules={quillModules}
              formats={QUILL_FORMATS}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Preview</h3>
            <p className="text-xs text-gray-400">How it'll look on the players' page</p>
          </div>
          <div
            className="p-5 prose prose-sm dark:prose-invert max-w-none site-content-preview overflow-y-auto max-h-[600px] flex-1"
            dangerouslySetInnerHTML={{ __html: sanitizedPreview }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-10">
        <button
          onClick={revert}
          disabled={!dirty || saving}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >Revert</button>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>

      <p className="text-xs text-gray-400">
        Changes go live immediately. Players will see the new content the next time they open the playoff page.
      </p>
    </div>
  );
};

export default ContentEditor;
