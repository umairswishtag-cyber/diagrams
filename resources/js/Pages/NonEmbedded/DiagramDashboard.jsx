import { Link, router } from '@inertiajs/react';
import {
    ArrowRight, CalendarClock, CirclePlus, FilePenLine, GitBranch, LayoutDashboard,
    MoreHorizontal, Network, Plus, Search, Shapes, Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function DiagramDashboard({ diagrams = [] }) {
    const [query, setQuery] = useState('');
    const [openMenu, setOpenMenu] = useState(null);
    const filtered = useMemo(() => diagrams.filter((diagram) =>
        `${diagram.title} ${diagram.filename}`.toLowerCase().includes(query.toLowerCase())), [diagrams, query]);
    const totalShapes = diagrams.reduce((sum, diagram) => sum + diagram.node_count, 0);

    const removeDiagram = (diagram) => {
        if (!window.confirm(`Delete “${diagram.title}”? This cannot be undone.`)) return;
        router.delete(route('diagrams.destroy', diagram.id), { preserveScroll: true });
    };

    return (
        <div className="dashboard-app">
            <header className="dashboard-header">
                <Link href={route('dashboard')} className="brand"><span className="brand-mark"><Network size={21} /></span><span>Flowcraft</span></Link>
                <nav><Link href={route('dashboard')} className="is-active"><LayoutDashboard size={16} /> Diagrams</Link></nav>
                <Link href={route('diagrams.create')} className="primary-link"><Plus size={17} /> New diagram</Link>
            </header>
            <main className="dashboard-main">
                <section className="dashboard-welcome">
                    <div><span className="eyebrow">YOUR WORKSPACE</span><h1>Diagrams</h1><p>Create, organize, and return to your visual workflows.</p></div>
                    <Link href={route('diagrams.create')} className="hero-create"><CirclePlus size={19} /> Create diagram</Link>
                </section>
                <section className="dashboard-stats">
                    <article><span className="stat-icon purple"><Shapes size={20} /></span><div><small>Total diagrams</small><strong>{diagrams.length}</strong></div></article>
                    <article><span className="stat-icon teal"><GitBranch size={20} /></span><div><small>Total shapes</small><strong>{totalShapes}</strong></div></article>
                    <article><span className="stat-icon amber"><CalendarClock size={20} /></span><div><small>Last updated</small><strong className="stat-date">{formatDate(diagrams[0]?.updated_at)}</strong></div></article>
                </section>
                <section className="diagram-list-card">
                    <div className="list-toolbar">
                        <div><h2>All diagrams</h2><span>{filtered.length} {filtered.length === 1 ? 'diagram' : 'diagrams'}</span></div>
                        <label className="dashboard-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search diagrams…" /></label>
                    </div>
                    {filtered.length ? (
                        <div className="diagram-table-wrap">
                            <table className="diagram-table">
                                <thead><tr><th>Name</th><th>File name</th><th>Content</th><th>Last modified</th><th><span className="sr-only">Actions</span></th></tr></thead>
                                <tbody>{filtered.map((diagram) => (
                                    <tr key={diagram.id}>
                                        <td><Link className="diagram-name" href={route('diagrams.edit', diagram.id)}><span><Network size={18} /></span><div><strong>{diagram.title}</strong><small>Workflow diagram</small></div></Link></td>
                                        <td><span className="file-pill">{diagram.filename}</span></td>
                                        <td><span className="content-count"><strong>{diagram.node_count}</strong> shapes · <strong>{diagram.edge_count}</strong> links</span></td>
                                        <td>{formatDate(diagram.updated_at)}</td>
                                        <td className="row-actions">
                                            <Link href={route('diagrams.edit', diagram.id)} title="Edit diagram"><FilePenLine size={16} /></Link>
                                            <button onClick={() => setOpenMenu(openMenu === diagram.id ? null : diagram.id)} title="More actions"><MoreHorizontal size={17} /></button>
                                            {openMenu === diagram.id && <div className="row-menu">
                                                <Link href={route('diagrams.edit', diagram.id)}><FilePenLine size={15} /> Edit</Link>
                                                <button onClick={() => removeDiagram(diagram)}><Trash2 size={15} /> Delete</button>
                                            </div>}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="dashboard-empty">
                            <span><Network size={27} /></span><h3>{query ? 'No matching diagrams' : 'Create your first diagram'}</h3>
                            <p>{query ? 'Try a different name or file name.' : 'Build a workflow with shapes, icons, connectors, and animation.'}</p>
                            {!query && <Link href={route('diagrams.create')}>Start creating <ArrowRight size={16} /></Link>}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
