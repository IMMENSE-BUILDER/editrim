import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Brand';
import { EditrimIcon } from '../components/EditrimIcon';
import { useToast } from '../components/Toast';
import { useSurface } from '../hooks/useSurface';
import { createVideoProject, deleteVideoProject, duplicateVideoProject, listVideoProjects, renameVideoProject, type VideoProjectMeta } from '../lib/video/storage';
import { formatTimecode } from '../lib/video/types';
import '../styles/videos.css';

export default function Videos() {
  useSurface('neutral');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<VideoProjectMeta[]>(() => listVideoProjects());
  const [query, setQuery] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    document.title = 'Videos — Editrim';
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? projects.filter(project => project.name.toLowerCase().includes(q)) : projects;
  }, [projects, query]);

  const refresh = () => setProjects(listVideoProjects());

  const newVideo = () => {
    const project = createVideoProject();
    navigate(`/video/${project.id}`);
  };

  const duplicate = (id: string) => {
    const copy = duplicateVideoProject(id);
    setMenuId(null);
    if (!copy) {
      toast('Could not duplicate');
      return;
    }
    refresh();
    toast('Duplicated');
  };

  const remove = (id: string) => {
    if (!window.confirm('Delete this video?')) return;
    deleteVideoProject(id);
    setMenuId(null);
    refresh();
    toast('Deleted');
  };

  const beginRename = (project: VideoProjectMeta) => {
    setMenuId(null);
    setRenamingId(project.id);
    setRenameValue(project.name);
  };

  const commitRename = () => {
    if (!renamingId) return;
    renameVideoProject(renamingId, renameValue);
    setRenamingId(null);
    refresh();
  };

  return (
    <div className="videos-page" onClick={() => setMenuId(null)}>
      <header className="videos-header">
        <div className="videos-head-left">
          <Link to="/dashboard" className="videos-back" aria-label="Back to dashboard"><EditrimIcon name="arrowLeft" size={17} /></Link>
          <Logo size={26} wordmark={false} />
          <h1>Videos</h1>
        </div>
        <div className="videos-head-right">
          <label className="videos-search">
            <EditrimIcon name="search" size={15} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search videos" aria-label="Search videos" />
          </label>
          <button className="videos-new" onClick={newVideo}><EditrimIcon name="plus" size={15} /> New video</button>
        </div>
      </header>

      <main className="videos-body">
        {projects.length === 0 ? (
          <div className="videos-empty">
            <span className="videos-empty-icon"><EditrimIcon name="film" size={28} /></span>
            <h2>No videos</h2>
            <button className="videos-new" onClick={newVideo}><EditrimIcon name="plus" size={15} /> New video</button>
          </div>
        ) : results.length === 0 ? (
          <div className="videos-empty">
            <h2>No matches</h2>
            <button className="videos-clear" onClick={() => setQuery('')}>Clear search</button>
          </div>
        ) : (
          <div className="videos-grid">
            {results.map(project => (
              <article
                key={project.id}
                className="video-card"
                data-project-id={project.id}
                onClick={() => { if (!menuId && renamingId !== project.id) navigate(`/video/${project.id}`); }}
              >
                <div className="video-card-poster" style={project.poster ? { backgroundImage: `url(${project.poster})` } : undefined}>
                  {!project.poster && <span className="video-card-fallback"><EditrimIcon name="film" size={28} /></span>}
                  <span className="video-card-duration">{formatTimecode(project.duration, false)}</span>
                  <span className="video-card-play"><EditrimIcon name="play" size={17} /></span>
                  <button
                    className="video-card-menu-btn"
                    onClick={event => { event.stopPropagation(); setMenuId(menuId === project.id ? null : project.id); }}
                    aria-label={`Actions for ${project.name}`}
                  >
                    <EditrimIcon name="more" size={16} />
                  </button>
                  {menuId === project.id && (
                    <div className="video-card-menu" onClick={event => event.stopPropagation()}>
                      <button onClick={() => beginRename(project)}><EditrimIcon name="pencil" size={13} /> Rename</button>
                      <button onClick={() => duplicate(project.id)}><EditrimIcon name="duplicate" size={13} /> Duplicate</button>
                      <button className="danger" onClick={() => remove(project.id)}><EditrimIcon name="trash" size={13} /> Delete</button>
                    </div>
                  )}
                </div>
                <div className="video-card-meta">
                  {renamingId === project.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={event => setRenameValue(event.target.value)}
                      onClick={event => event.stopPropagation()}
                      onBlur={commitRename}
                      onKeyDown={event => {
                        if (event.key === 'Enter') commitRename();
                        if (event.key === 'Escape') setRenamingId(null);
                      }}
                      aria-label="Video name"
                    />
                  ) : (
                    <strong>{project.name}</strong>
                  )}
                  <span>{project.width} × {project.height} · {project.clipCount} {project.clipCount === 1 ? 'clip' : 'clips'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
