import { graphqlRequest } from '@/Services/graphql';
import { Link } from '@inertiajs/react';
import {
    ArrowRight, CalendarClock, CirclePlus, FilePenLine, GitBranch, LayoutDashboard,
    LogOut, MoreHorizontal, Network, Plus, Search, Shapes, Trash2, UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const DIAGRAMS_QUERY = `
    query Diagrams {
        diagrams {
            id title filename node_count edge_count updated_at
            owner { id name email role }
        }
    }
`;

const DELETE_DIAGRAM = `
    mutation DeleteDiagram($id: ID!) { deleteDiagram(id: $id) }
`;

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function DiagramDashboard({ auth }) {
    const [diagrams, setDiagrams] = useState([]);
    const [query, setQuery] = useState('');
    const [openMenu, setOpenMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const isAdmin = auth?.user?.role === 'admin';

    useEffect(() => {
        graphqlRequest(DIAGRAMS_QUERY)
            .then((data) => setDiagrams(data.diagrams))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => diagrams.filter((diagram) =>
        `${diagram.title} ${diagram.filename} ${diagram.owner?.name || ''}`.toLowerCase().includes(query.toLowerCase())), [diagrams, query]);
    const totalShapes = diagrams.reduce((sum, diagram) => sum + diagram.node_count, 0);

    const removeDiagram = async (diagram) => {
        if (!window.confirm(`Delete “${diagram.title}”? This cannot be undone.`)) return;
        setDeletingId(diagram.id);
        setOpenMenu(null);
        try {
            await graphqlRequest(DELETE_DIAGRAM, { id: diagram.id });
            setDiagrams((items) => items.filter((item) => item.id !== diagram.id));
        } catch (requestError) {
            window.alert(requestError.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="dashboard-app">
            <header className="dashboard-header">
                <Link href={route('dashboard')} className="brand"><span className="brand-mark"><Network size={21} /></span><span>Flowcraft</span></Link>
                <nav><Link href={route('dashboard')} className="is-active"><LayoutDashboard size={16} /> Diagrams</Link></nav>
                <div className="dashboard-account-actions">
                    <Link href={route('diagrams.create')} className="primary-link"><Plus size={17} /> New diagram</Link>
                    <Link href={route('profile.edit')} className="account-link" title={auth?.user?.name || 'Account'}><UserRound size={17} /><span>{auth?.user?.name || 'Account'} · {isAdmin ? 'Admin' : 'User'}</span></Link>
                    <Link href={route('logout')} method="post" as="button" className="logout-button" title="Log out"><LogOut size={17} /><span>Log out</span></Link>
                </div>
            </header>
            <main className="dashboard-main">
                <section className="dashboard-welcome">
                    <div><span className="eyebrow">{isAdmin ? 'ADMIN WORKSPACE' : 'YOUR WORKSPACE'}</span><h1>Diagrams</h1><p>{isAdmin ? 'Review and manage every assigned diagram.' : 'Create, organize, and return to your visual workflows.'}</p></div>
                    <Link href={route('diagrams.create')} className="hero-create"><CirclePlus size={19} /> Create diagram</Link>
                </section>
                <section className="dashboard-stats">
                    <article><span className="stat-icon purple"><Shapes size={20} /></span><div><small>Total diagrams</small><strong>{diagrams.length}</strong></div></article>
                    <article><span className="stat-icon teal"><GitBranch size={20} /></span><div><small>Total shapes</small><strong>{totalShapes}</strong></div></article>
                    <article><span className="stat-icon amber"><CalendarClock size={20} /></span><div><small>Last updated</small><strong className="stat-date">{formatDate(diagrams[0]?.updated_at)}</strong></div></article>
                </section>
                <section className="diagram-list-card">
                    <div className="list-toolbar">
                        <div><h2>{isAdmin ? 'All user diagrams' : 'My diagrams'}</h2><span>{filtered.length} {filtered.length === 1 ? 'diagram' : 'diagrams'}</span></div>
                        <label className="dashboard-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search diagrams…" /></label>
                    </div>
                    {loading ? (
                        <div className="dashboard-empty"><span><Network size={27} /></span><h3>Loading diagrams…</h3></div>
                    ) : error ? (
                        <div className="dashboard-empty"><span><Network size={27} /></span><h3>Could not load diagrams</h3><p>{error}</p></div>
                    ) : filtered.length ? (
                        <div className="diagram-table-wrap">
                            <table className="diagram-table">
                                <thead><tr><th>Name</th><th>File name</th>{isAdmin && <th>Owner</th>}<th>Content</th><th>Last modified</th><th><span className="sr-only">Actions</span></th></tr></thead>
                                <tbody>{filtered.map((diagram) => (
                                    <tr key={diagram.id}>
                                        <td><Link className="diagram-name" href={route('diagrams.edit', diagram.id)}><span><Network size={18} /></span><div><strong>{diagram.title}</strong><small>Workflow diagram</small></div></Link></td>
                                        <td><span className="file-pill">{diagram.filename}</span></td>
                                        {isAdmin && <td><div className="diagram-owner"><strong>{diagram.owner?.name || 'Unknown'}</strong><small>{diagram.owner?.email}</small></div></td>}
                                        <td><span className="content-count"><strong>{diagram.node_count}</strong> shapes · <strong>{diagram.edge_count}</strong> links</span></td>
                                        <td>{formatDate(diagram.updated_at)}</td>
                                        <td className="row-actions">
                                            <Link href={route('diagrams.edit', diagram.id)} title="Edit diagram"><FilePenLine size={16} /></Link>
                                            <button onClick={() => setOpenMenu(openMenu === diagram.id ? null : diagram.id)} title="More actions"><MoreHorizontal size={17} /></button>
                                            {openMenu === diagram.id && <div className="row-menu">
                                                <Link href={route('diagrams.edit', diagram.id)}><FilePenLine size={15} /> Edit</Link>
                                                <button disabled={deletingId === diagram.id} onClick={() => removeDiagram(diagram)}><Trash2 size={15} /> Delete</button>
                                            </div>}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="dashboard-empty">
                            <span><Network size={27} /></span><h3>{query ? 'No matching diagrams' : 'Create your first diagram'}</h3>
                            <p>{query ? 'Try a different name, owner, or file name.' : 'Build a workflow with shapes, icons, connectors, and animation.'}</p>
                            {!query && <Link href={route('diagrams.create')}>Start creating <ArrowRight size={16} /></Link>}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
