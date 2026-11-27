import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassButton, GlassButtonGroup, GlassButtonGroupItem, GlassCard } from '@/components/liquid-glass';
import {
  GlassDropdownMenu,
  GlassDropdownMenuContent,
  GlassDropdownMenuItem,
  GlassDropdownMenuSeparator,
  GlassDropdownMenuTrigger,
} from '@/components/liquid-glass/glass-dropdown-menu';
import { Logo } from '../components/Brand';
import { EditrimIcon } from '../components/EditrimIcon';
import { useToast } from '../components/Toast';
import { useSurface } from '../hooks/useSurface';
import { createVideoProject, deleteVideoProject, duplicateVideoProject, listVideoProjects, renameVideoProject, type VideoProjectMeta } from '../lib/video/storage';
import { formatTimecode } from '../lib/video/types';

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
          <GlassButton
            material="tinted"
            size="sm"
            className="videos-new bg-[#2440F0] text-white"
            onClick={newVideo}
            icon={<EditrimIcon name="plus" size={15} />}
            iconPosition="start"
          >
            New video
          </GlassButton>
        </div>
      </header>

      <main className="videos-body">
        {projects.length === 0 ? (
          <GlassCard blur={6} tint={0.68} className="videos-empty rounded-[24px]">
            <span className="videos-empty-icon"><EditrimIcon name="film" size={28} /></span>
            <h2>No videos</h2>
            <GlassButton
              material="tinted"
              size="md"
              className="videos-new bg-[#2440F0] text-white"
              onClick={newVideo}
              icon={<EditrimIcon name="plus" size={15} />}
              iconPosition="start"
            >
              New video
            </GlassButton>
          </GlassCard>
        ) : results.length === 0 ? (
          <GlassCard blur={6} tint={0.68} className="videos-empty rounded-[24px]">
            <h2>No matches</h2>
            <GlassButton material="clear" size="sm" onClick={() => setQuery('')}>Clear search</GlassButton>
          </GlassCard>
        ) : (
          <div className="videos-grid">
            {results.map(project => (
              <article
                key={project.id}
                className="video-card"
                data-project-id={project.id}
                onClick={() => { if (renamingId !== project.id) navigate(`/video/${project.id}`); }}
              >
                <div className="video-card-poster" style={project.poster ? { backgroundImage: `url(${project.poster})` } : undefined}>
                  {!project.poster && <span className="video-card-fallback"><EditrimIcon name="film" size={28} /></span>}
                  <span className="video-card-duration">{formatTimecode(project.duration, false)}</span>
                  <span className="video-card-play"><EditrimIcon name="play" size={17} /></span>
                  <div className="video-card-menu-btn" onClick={event => event.stopPropagation()}>
                    <GlassDropdownMenu>
                      <GlassButtonGroup size="sm" material="clear">
                        <GlassDropdownMenuTrigger asChild>
                          <GlassButtonGroupItem aria-label={`Actions for ${project.name}`}>
                            <EditrimIcon name="more" size={16} />
                          </GlassButtonGroupItem>
                        </GlassDropdownMenuTrigger>
                      </GlassButtonGroup>
                      <GlassDropdownMenuContent align="end">
                        <GlassDropdownMenuItem onSelect={() => beginRename(project)}>
                          <EditrimIcon name="pencil" size={13} /> Rename
                        </GlassDropdownMenuItem>
                        <GlassDropdownMenuItem onSelect={() => duplicate(project.id)}>
                          <EditrimIcon name="duplicate" size={13} /> Duplicate
                        </GlassDropdownMenuItem>
                        <GlassDropdownMenuSeparator />
                        <GlassDropdownMenuItem destructive onSelect={() => remove(project.id)}>
                          <EditrimIcon name="trash" size={13} /> Delete
                        </GlassDropdownMenuItem>
                      </GlassDropdownMenuContent>
                    </GlassDropdownMenu>
                  </div>
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
