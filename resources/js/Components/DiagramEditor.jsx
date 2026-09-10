import {
    Background, BaseEdge, ConnectionMode, Controls, Handle, MarkerType, MiniMap,
    Panel, Position, ReactFlow, ReactFlowProvider, addEdge, applyEdgeChanges,
    applyNodeChanges, getNodesBounds, getSmoothStepPath, getViewportForBounds, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    AppWindow, ArrowLeft, Box, Braces, Check, ChevronDown, Circle as CircleIcon, Cloud,
    Code2, Database, Diamond, Download, FileText, GitBranch, Grid2X2, Image as ImageIcon,
    Menu, MessageSquareText, MousePointer2, Network, Play, Plus, Redo2, Save,
    Server, Settings, Sparkles, Square, Trash2, Type, Undo2, Upload, Users, X, Zap,
} from 'lucide-react';
import { toCanvas, toSvg } from 'html-to-image';
import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ACTIONS = createContext({ updateNode: () => {} });

const ICONS = {
    none: null, window: AppWindow, code: Code2, database: Database, cloud: Cloud,
    server: Server, file: FileText, users: Users, zap: Zap, branch: GitBranch, settings: Settings,
};

const SHAPES = [
    { type: 'rectangle', label: 'Process', icon: Square },
    { type: 'rounded', label: 'Rounded', icon: Box },
    { type: 'circle', label: 'Circle', icon: CircleIcon },
    { type: 'diamond', label: 'Decision', icon: Diamond },
    { type: 'pill', label: 'Terminal', icon: Play },
    { type: 'document', label: 'Document', icon: FileText },
];

const COLORS = [
    { name: 'Indigo', value: '#6d5dfc', soft: '#eeebff' },
    { name: 'Coral', value: '#f06b51', soft: '#fff0ec' },
    { name: 'Amber', value: '#e6a51c', soft: '#fff7df' },
    { name: 'Teal', value: '#16a085', soft: '#e5faf4' },
    { name: 'Blue', value: '#3182ce', soft: '#e8f3ff' },
    { name: 'Slate', value: '#536174', soft: '#eef1f5' },
];

function makeEdge(id, source, target, color = '#6d5dfc', lineStyle = 'dashed') {
    return {
        id, source, target, type: 'workflowEdge', data: { color, lineStyle },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 18, height: 18 },
    };
}

const seedNodes = [
    { id: '1', type: 'workflow', position: { x: 70, y: 80 }, data: { label: 'User request', shape: 'rounded', icon: 'users', color: COLORS[0] } },
    { id: '2', type: 'workflow', position: { x: 330, y: 80 }, data: { label: 'Web server', shape: 'rectangle', icon: 'server', color: COLORS[3] } },
    { id: '3', type: 'workflow', position: { x: 330, y: 290 }, data: { label: 'Database', shape: 'circle', icon: 'database', color: COLORS[1] } },
    { id: '4', type: 'workflow', position: { x: 610, y: 80 }, data: { label: 'Authentication', shape: 'diamond', icon: 'settings', color: COLORS[4] } },
    { id: '5', type: 'workflow', position: { x: 610, y: 290 }, data: { label: 'Complete', shape: 'pill', icon: 'zap', color: COLORS[2] } },
];

const seedEdges = [
    makeEdge('e1-2', '1', '2', '#6d5dfc'), makeEdge('e2-3', '2', '3', '#16a085'),
    makeEdge('e2-4', '2', '4', '#3182ce', 'solid'), makeEdge('e3-5', '3', '5', '#f06b51'),
];

function setUint24(bytes, offset, value) {
    bytes[offset] = value & 255;
    bytes[offset + 1] = (value >> 8) & 255;
    bytes[offset + 2] = (value >> 16) & 255;
}

function webpChunk(name, data) {
    const paddedLength = data.length + (data.length % 2);
    const output = new Uint8Array(8 + paddedLength);
    output.set([...name].map((character) => character.charCodeAt(0)), 0);
    new DataView(output.buffer).setUint32(4, data.length, true);
    output.set(data, 8);
    return output;
}

function concatBytes(parts) {
    const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0;
    parts.forEach((part) => { output.set(part, offset); offset += part.length; });
    return output;
}

async function createAnimatedWebp(frames, width, height, delay) {
    const animationFrames = [];
    for (const frame of frames) {
        const source = new Uint8Array(await frame.arrayBuffer());
        const imageChunks = [];
        for (let offset = 12; offset + 8 <= source.length;) {
            const name = String.fromCharCode(...source.slice(offset, offset + 4));
            const length = new DataView(source.buffer, source.byteOffset).getUint32(offset + 4, true);
            if (['ALPH', 'VP8 ', 'VP8L'].includes(name)) imageChunks.push(source.slice(offset, offset + 8 + length + (length % 2)));
            offset += 8 + length + (length % 2);
        }
        const header = new Uint8Array(16);
        setUint24(header, 6, width - 1);
        setUint24(header, 9, height - 1);
        setUint24(header, 12, delay);
        animationFrames.push(webpChunk('ANMF', concatBytes([header, ...imageChunks])));
    }
    const vp8x = new Uint8Array(10);
    vp8x[0] = 0x02;
    setUint24(vp8x, 4, width - 1);
    setUint24(vp8x, 7, height - 1);
    const anim = new Uint8Array(6);
    const body = concatBytes([webpChunk('VP8X', vp8x), webpChunk('ANIM', anim), ...animationFrames]);
    const riff = new Uint8Array(12);
    riff.set([82, 73, 70, 70], 0);
    new DataView(riff.buffer).setUint32(4, body.length + 4, true);
    riff.set([87, 69, 66, 80], 8);
    return new Blob([riff, body], { type: 'image/webp' });
}

function WorkflowNode({ id, data, selected }) {
    const { updateNode } = useContext(ACTIONS);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(data.label);
    const Icon = ICONS[data.icon] || null;

    useEffect(() => setDraft(data.label), [data.label]);
    const finishEditing = () => {
        updateNode(id, { label: draft.trim() || 'Untitled' });
        setEditing(false);
    };

    return (
        <div
            className={`workflow-node workflow-node--${data.shape} ${selected ? 'is-selected' : ''}`}
            style={{ '--node-color': data.color.value, '--node-soft': data.color.soft }}
            onDoubleClick={(event) => { event.stopPropagation(); setEditing(true); }}
        >
            {[Position.Top, Position.Right, Position.Bottom, Position.Left].map((position) => (
                <Handle key={position} type="source" id={position} position={position} className="workflow-handle" />
            ))}
            <div className="workflow-node__inner">
                {data.imageUrl ? <span className="workflow-node__icon workflow-node__icon--custom"><img src={data.imageUrl} alt="" /></span> : Icon && <span className="workflow-node__icon"><Icon size={20} strokeWidth={1.9} /></span>}
                {editing ? (
                    <input
                        className="workflow-node__input nodrag" value={draft} autoFocus
                        onChange={(event) => setDraft(event.target.value)} onBlur={finishEditing}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') finishEditing();
                            if (event.key === 'Escape') { setDraft(data.label); setEditing(false); }
                        }}
                    />
                ) : <span className="workflow-node__label">{data.label}</span>}
            </div>
        </div>
    );
}

function WorkflowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected, data }) {
    const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 18 });
    const dash = data?.lineStyle === 'dotted' ? '2 8' : data?.lineStyle === 'dashed' ? '10 8' : undefined;
    return <BaseEdge id={id} path={path} markerEnd={markerEnd} interactionWidth={24} className={data?.animated ? 'animated-flow-edge' : ''} style={{ stroke: data?.color || '#6d5dfc', strokeWidth: selected ? 3.5 : 2.5, strokeDasharray: dash }} />;
}

const MemoWorkflowNode = memo(WorkflowNode);
const MemoWorkflowEdge = memo(WorkflowEdge);

function ToolButton({ icon: Icon, label, onClick, active, disabled }) {
    return (
        <button type="button" className={`icon-button ${active ? 'is-active' : ''}`} onClick={onClick} disabled={disabled} title={label} aria-label={label}>
            <Icon size={17} strokeWidth={2} />
        </button>
    );
}

function Sidebar({ onAddNode, onUpload, uploading, collapsed, setCollapsed }) {
    return (
        <aside className={`editor-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
            <button className="sidebar-collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
                {collapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
            {!collapsed && <>
                <div className="sidebar-heading"><p>ELEMENTS</p><span>Drag or click to add</span></div>
                <div className="shape-grid">
                    {SHAPES.map(({ type, label, icon: Icon }) => (
                        <button
                            key={type} type="button" className="shape-card" draggable
                            onDragStart={(event) => { event.dataTransfer.setData('application/workflow-shape', type); event.dataTransfer.effectAllowed = 'move'; }}
                            onClick={() => onAddNode(type)}
                        >
                            <span className={`shape-preview shape-preview--${type}`}><Icon size={22} strokeWidth={1.6} /></span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
                <div className="sidebar-section-title"><span>QUICK START</span></div>
                <button type="button" className="quick-node" onClick={() => onAddNode('rounded', { label: 'New screen', icon: 'window' })}>
                    <span className="quick-node__icon purple"><AppWindow size={17} /></span><span><strong>Screen</strong><small>Interface or page</small></span><Plus size={15} />
                </button>
                <button type="button" className="quick-node" onClick={() => onAddNode('rectangle', { label: 'API request', icon: 'code' })}>
                    <span className="quick-node__icon green"><Braces size={17} /></span><span><strong>API request</strong><small>Service or endpoint</small></span><Plus size={15} />
                </button>
                <button type="button" className="quick-node" onClick={() => onAddNode('circle', { label: 'Data store', icon: 'database' })}>
                    <span className="quick-node__icon coral"><Database size={17} /></span><span><strong>Data store</strong><small>Database or cache</small></span><Plus size={15} />
                </button>
                <label className={`upload-media-button ${uploading ? 'is-loading' : ''}`}>
                    <Upload size={16} /><span><strong>{uploading ? 'Uploading...' : 'Upload media'}</strong><small>SVG, PNG, JPG, WebP or GIF</small></span>
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/*" disabled={uploading} onChange={(event) => { onUpload(event.target.files?.[0]); event.target.value = ''; }} />
                </label>
                <div className="sidebar-tip"><Sparkles size={16} /><p><strong>Pro tip</strong><br />Double-click any shape to edit its text.</p></div>
            </>}
        </aside>
    );
}

function PropertiesPanel({ selectedNode, selectedEdge, onUpdateNode, onUpdateEdge, onUpload, uploading, onDelete, onClose }) {
    if (!selectedNode && !selectedEdge) return null;
    return (
        <aside className="properties-panel">
            <div className="properties-title">
                <div><span>STYLE</span><strong>{selectedNode ? 'Shape settings' : 'Connector settings'}</strong></div>
                <button onClick={onClose} aria-label="Close properties"><X size={17} /></button>
            </div>
            {selectedNode ? <>
                <label className="field-label" htmlFor="node-label">Label</label>
                <input id="node-label" className="property-input" value={selectedNode.data.label} onChange={(event) => onUpdateNode(selectedNode.id, { label: event.target.value })} />
                <label className="field-label" htmlFor="node-icon">Icon</label>
                <div className="select-wrap">
                    <select id="node-icon" value={selectedNode.data.icon || 'none'} onChange={(event) => onUpdateNode(selectedNode.id, { icon: event.target.value })}>
                        {Object.keys(ICONS).map((name) => <option key={name} value={name}>{name[0].toUpperCase() + name.slice(1)}</option>)}
                    </select><ChevronDown size={15} />
                </div>
                <label className="property-upload">
                    <Upload size={15} /> {uploading ? 'Uploading...' : selectedNode.data.imageUrl ? 'Replace custom icon' : 'Upload custom icon'}
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/*" disabled={uploading} onChange={(event) => { onUpload(event.target.files?.[0], selectedNode.id); event.target.value = ''; }} />
                </label>
                <span className="field-label">Color</span>
                <div className="color-row">
                    {COLORS.map((color) => (
                        <button key={color.value} type="button" className={`color-swatch ${selectedNode.data.color.value === color.value ? 'is-selected' : ''}`} style={{ backgroundColor: color.value }} onClick={() => onUpdateNode(selectedNode.id, { color })} aria-label={color.name}>
                            {selectedNode.data.color.value === color.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
                <span className="field-label">Shape</span>
                <div className="mini-shape-grid">
                    {SHAPES.map(({ type, icon: Icon }) => <button key={type} className={selectedNode.data.shape === type ? 'is-selected' : ''} onClick={() => onUpdateNode(selectedNode.id, { shape: type })} title={type}><Icon size={17} /></button>)}
                </div>
            </> : <>
                <span className="field-label">Line style</span>
                <div className="line-style-grid">
                    {['solid', 'dashed', 'dotted'].map((style) => (
                        <button key={style} className={selectedEdge.data?.lineStyle === style ? 'is-selected' : ''} onClick={() => onUpdateEdge(selectedEdge.id, { lineStyle: style })}>
                            <i className={`line-sample line-sample--${style}`} />{style}
                        </button>
                    ))}
                </div>
                <span className="field-label">Color</span>
                <div className="color-row">
                    {COLORS.map((color) => <button key={color.value} className={`color-swatch ${selectedEdge.data?.color === color.value ? 'is-selected' : ''}`} style={{ backgroundColor: color.value }} onClick={() => onUpdateEdge(selectedEdge.id, { color: color.value })} aria-label={color.name} />)}
                </div>
                <div className="animation-toggle">
                    <div><strong>Animate flow</strong><span>Moves dashes in GIF and WebP</span></div>
                    <button type="button" role="switch" aria-checked={Boolean(selectedEdge.data?.animated)} className={selectedEdge.data?.animated ? 'is-on' : ''} onClick={() => onUpdateEdge(selectedEdge.id, { animated: !selectedEdge.data?.animated, ...(!selectedEdge.data?.animated && selectedEdge.data?.lineStyle === 'solid' ? { lineStyle: 'dashed' } : {}) })}><i /></button>
                </div>
            </>}
            <button type="button" className="delete-button" onClick={onDelete}><Trash2 size={16} /> Delete {selectedNode ? 'shape' : 'connector'}</button>
        </aside>
    );
}

function ExportMenu({ onExport, exporting, filename, onFilenameChange }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const close = (event) => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);
    return (
        <div className="export-wrap" ref={menuRef}>
            <button type="button" className="export-button" onClick={() => setOpen(!open)} disabled={exporting}>
                <Download size={16} /> {exporting ? 'Exporting...' : 'Export'} <ChevronDown size={14} />
            </button>
            {open && <div className="export-menu">
                <div><strong>Export diagram</strong><span>Choose a name and format</span></div>
                <label className="export-filename"><span>File name</span><input value={filename} onChange={(event) => onFilenameChange(event.target.value)} placeholder="my-workflow" /></label>
                {[['png', 'PNG', 'Best quality'], ['jpeg', 'JPEG', 'Smaller file'], ['webp', 'WEBP', 'Animated WebP'], ['gif', 'GIF', 'Animated GIF'], ['svg', 'SVG', 'Scalable vector']].map(([value, label, hint]) => (
                    <button key={value} onClick={() => { setOpen(false); onExport(value); }}><ImageIcon size={17} /><span><strong>{label}</strong><small>{hint}</small></span></button>
                ))}
            </div>}
        </div>
    );
}

function EditorCanvas({ diagram }) {
    const flow = useReactFlow();
    const [nodes, setNodes] = useState(diagram?.nodes || seedNodes);
    const [edges, setEdges] = useState(diagram?.edges || seedEdges);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [history, setHistory] = useState([]);
    const [future, setFuture] = useState([]);
    const [title, setTitle] = useState(diagram?.title || 'Website architecture');
    const [filename, setFilename] = useState(diagram?.filename || 'website-architecture');
    const [editingTitle, setEditingTitle] = useState(false);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const dragStart = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (diagram) return;
        try {
            const stored = JSON.parse(localStorage.getItem('flowcraft-diagram'));
            if (stored?.nodes && stored?.edges) {
                setNodes(stored.nodes);
                setEdges(stored.edges);
                setTitle(stored.title || 'Untitled workflow');
                setFilename(stored.filename || 'untitled-workflow');
            }
        } catch (error) {
            console.warn('Saved diagram could not be loaded.', error);
        }
    }, [diagram]);

    const nodeTypes = useMemo(() => ({ workflow: MemoWorkflowNode }), []);
    const edgeTypes = useMemo(() => ({ workflowEdge: MemoWorkflowEdge }), []);
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const selectedEdge = edges.find((item) => item.id === selectedEdgeId);
    const snapshot = useCallback(() => ({ nodes, edges }), [nodes, edges]);
    const remember = useCallback(() => { setHistory((items) => [...items.slice(-39), snapshot()]); setFuture([]); setSaved(false); }, [snapshot]);

    const updateNode = useCallback((id, patch) => {
        remember();
        setNodes((items) => items.map((node) => node.id === id ? { ...node, data: { ...node.data, ...patch } } : node));
    }, [remember]);
    const updateEdge = useCallback((id, patch) => {
        remember();
        setEdges((items) => items.map((item) => item.id === id ? { ...item, data: { ...item.data, ...patch }, markerEnd: { ...item.markerEnd, color: patch.color || item.data.color } } : item));
    }, [remember]);

    const addNodeAt = useCallback((shape, position, overrides = {}) => {
        remember();
        const definition = SHAPES.find((item) => item.type === shape);
        const id = `node-${Date.now()}-${Math.round(Math.random() * 999)}`;
        setNodes((items) => [...items, {
            id, type: 'workflow', position,
            data: { label: overrides.label || definition?.label || 'New shape', shape, icon: overrides.icon || 'none', imageUrl: overrides.imageUrl || null, color: COLORS[items.length % COLORS.length] },
        }]);
        setSelectedNodeId(id); setSelectedEdgeId(null);
    }, [remember]);

    const addNodeFromSidebar = (shape, overrides = {}) => {
        const center = flow.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        addNodeAt(shape, { x: center.x - 75 + nodes.length * 5, y: center.y - 40 + nodes.length * 5 }, overrides);
    };
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const shape = event.dataTransfer.getData('application/workflow-shape');
        if (!shape) return;
        const position = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        addNodeAt(shape, { x: position.x - 75, y: position.y - 40 });
    }, [flow, addNodeAt]);
    const onConnect = useCallback((connection) => {
        remember();
        setEdges((items) => addEdge({ ...connection, id: `edge-${Date.now()}`, type: 'workflowEdge', data: { color: '#6d5dfc', lineStyle: 'dashed' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6d5dfc', width: 18, height: 18 } }, items));
    }, [remember]);
    const deleteSelection = useCallback(() => {
        if (!selectedNodeId && !selectedEdgeId) return;
        remember();
        if (selectedNodeId) {
            setNodes((items) => items.filter((node) => node.id !== selectedNodeId));
            setEdges((items) => items.filter((item) => item.source !== selectedNodeId && item.target !== selectedNodeId));
            setSelectedNodeId(null);
        } else { setEdges((items) => items.filter((item) => item.id !== selectedEdgeId)); setSelectedEdgeId(null); }
    }, [selectedNodeId, selectedEdgeId, remember]);
    const undo = useCallback(() => {
        if (!history.length) return;
        const previous = history[history.length - 1];
        setFuture((items) => [snapshot(), ...items]); setHistory((items) => items.slice(0, -1));
        setNodes(previous.nodes); setEdges(previous.edges); setSaved(false);
    }, [history, snapshot]);
    const redo = useCallback(() => {
        if (!future.length) return;
        const next = future[0];
        setHistory((items) => [...items, snapshot()]); setFuture((items) => items.slice(1));
        setNodes(next.nodes); setEdges(next.edges); setSaved(false);
    }, [future, snapshot]);

    useEffect(() => {
        const onKeyDown = (event) => {
            const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
            if ((event.key === 'Delete' || event.key === 'Backspace') && !typing) deleteSelection();
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) { event.preventDefault(); undo(); }
            if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) { event.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [deleteSelection, undo, redo]);

    const uploadAsset = async (file, targetNodeId = null) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { window.alert('Please choose a file smaller than 5 MB.'); return; }
        setUploading(true);
        try {
            const form = new FormData();
            form.append('asset', file);
            const response = await fetch(route('diagram-assets.store'), { method: 'POST', headers: { Accept: 'application/json' }, body: form });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Upload failed.');
            if (targetNodeId) updateNode(targetNodeId, { imageUrl: result.url, icon: 'none' });
            else addNodeFromSidebar('rounded', { label: result.name || 'Uploaded media', imageUrl: result.url });
        } catch (error) {
            window.alert(error.message || 'The file could not be uploaded.');
        } finally {
            setUploading(false);
        }
    };

    const saveDiagram = async () => {
        setSaving(true);
        try {
            const cleanFilename = filename.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'workflow';
            const response = await fetch(diagram ? route('diagrams.update', diagram.id) : route('diagrams.store'), {
                method: diagram ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ title: title.trim() || 'Untitled workflow', filename: cleanFilename, nodes, edges }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Save failed.');
            localStorage.setItem('flowcraft-diagram', JSON.stringify({ title, filename: cleanFilename, nodes, edges }));
            setFilename(cleanFilename);
            setSaved(true);
            if (!diagram && result.edit_url) window.location.assign(result.edit_url);
        } catch (error) {
            window.alert(error.message || 'The diagram could not be saved.');
        } finally {
            setSaving(false);
        }
    };
    const exportDiagram = async (format) => {
        if (!nodes.length) return;
        setExporting(true);
        const animatedPaths = [...wrapperRef.current.querySelectorAll('.animated-flow-edge')];
        const originalPathStyles = animatedPaths.map((path) => ({ animation: path.style.animation, strokeDashoffset: path.style.strokeDashoffset }));
        try {
            const bounds = getNodesBounds(nodes);
            const width = Math.max(1200, Math.min(2400, Math.ceil(bounds.width + 240)));
            const height = Math.max(700, Math.min(1600, Math.ceil(bounds.height + 240)));
            const viewport = getViewportForBounds(bounds, width, height, 0.4, 2, 0.12);
            const viewportElement = wrapperRef.current.querySelector('.react-flow__viewport');
            const captureOptions = {
                backgroundColor: '#fbfbfa', width, height, pixelRatio: 1,
                style: { width: `${width}px`, height: `${height}px`, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` },
            };
            let blob;
            if (format === 'svg') {
                const dataUrl = await toSvg(viewportElement, captureOptions);
                blob = await (await fetch(dataUrl)).blob();
            } else if ((format === 'gif' || format === 'webp') && animatedPaths.length) {
                const frameCount = 12;
                const delay = 80;
                const frames = [];
                for (let frame = 0; frame < frameCount; frame += 1) {
                    animatedPaths.forEach((path) => {
                        path.style.animation = 'none';
                        path.style.strokeDashoffset = `${-(frame * 3)}px`;
                    });
                    await new Promise((resolve) => requestAnimationFrame(resolve));
                    frames.push(await toCanvas(viewportElement, captureOptions));
                }
                if (format === 'gif') {
                    const gif = GIFEncoder();
                    frames.forEach((canvas) => {
                        const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                        const palette = quantize(image.data, 256);
                        gif.writeFrame(applyPalette(image.data, palette), canvas.width, canvas.height, { palette, delay, repeat: 0 });
                    });
                    gif.finish();
                    blob = new Blob([gif.bytes()], { type: 'image/gif' });
                } else {
                    const webpFrames = await Promise.all(frames.map((canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92))));
                    blob = await createAnimatedWebp(webpFrames, frames[0].width, frames[0].height, delay);
                }
            } else {
                const canvas = await toCanvas(viewportElement, captureOptions);
                if (format === 'gif') {
                    const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                    const palette = quantize(image.data, 256);
                    const gif = GIFEncoder();
                    gif.writeFrame(applyPalette(image.data, palette), canvas.width, canvas.height, { palette });
                    gif.finish();
                    blob = new Blob([gif.bytes()], { type: 'image/gif' });
                } else {
                    const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
                    blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.94));
                }
            }
            if (!blob) throw new Error('The selected image format is not supported by this browser.');
            const safeName = (filename || title || 'workflow').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/(^-|-$)/g, '');
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url; anchor.download = `${safeName || 'workflow'}.${format === 'jpeg' ? 'jpg' : format}`; anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) { console.error('Export failed', error); window.alert('The export could not be created. Please try again.'); }
        finally {
            animatedPaths.forEach((path, index) => {
                path.style.animation = originalPathStyles[index].animation;
                path.style.strokeDashoffset = originalPathStyles[index].strokeDashoffset;
            });
            setExporting(false);
        }
    };

    return (
        <ACTIONS.Provider value={useMemo(() => ({ updateNode }), [updateNode])}>
            <div className="diagram-app">
                <header className="editor-header">
                    <div className="editor-brand-wrap"><a href={route('dashboard')} className="back-to-dashboard" title="Back to diagrams"><ArrowLeft size={18} /></a><a href={route('dashboard')} className="brand"><span className="brand-mark"><Network size={21} /></span><span>Flowcraft</span></a></div>
                    <div className="document-name">
                        {editingTitle ? <input value={title} autoFocus onChange={(event) => { setTitle(event.target.value); setSaved(false); }} onBlur={() => setEditingTitle(false)} onKeyDown={(event) => event.key === 'Enter' && setEditingTitle(false)} /> : <button onClick={() => setEditingTitle(true)}>{title}</button>}
                        <span><i className={saved ? 'saved-dot' : 'unsaved-dot'} /> {saved ? 'Saved to dashboard' : 'Unsaved changes'}</span>
                    </div>
                    <div className="header-actions">
                        <ToolButton icon={Undo2} label="Undo" onClick={undo} disabled={!history.length} /><ToolButton icon={Redo2} label="Redo" onClick={redo} disabled={!future.length} />
                        <span className="toolbar-divider" /><button type="button" className="save-button" onClick={saveDiagram} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
                        <ExportMenu onExport={exportDiagram} exporting={exporting} filename={filename} onFilenameChange={(value) => { setFilename(value); setSaved(false); }} /><button type="button" className="avatar" title="Your profile">SW</button>
                    </div>
                </header>
                <div className="editor-body">
                    <Sidebar onAddNode={addNodeFromSidebar} onUpload={uploadAsset} uploading={uploading} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                    <main className="canvas-shell" ref={wrapperRef}>
                        <ReactFlow
                            nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                            onNodesChange={(changes) => setNodes((items) => applyNodeChanges(changes, items))}
                            onEdgesChange={(changes) => setEdges((items) => applyEdgeChanges(changes, items))}
                            onNodeDragStart={() => { dragStart.current = snapshot(); }}
                            onNodeDragStop={() => { if (dragStart.current) { setHistory((items) => [...items.slice(-39), dragStart.current]); setFuture([]); setSaved(false); dragStart.current = null; } }}
                            onConnect={onConnect}
                            onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId(null); }}
                            onEdgeClick={(_, item) => { setSelectedEdgeId(item.id); setSelectedNodeId(null); }}
                            onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
                            onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                            connectionMode={ConnectionMode.Loose} connectionLineStyle={{ stroke: '#6d5dfc', strokeWidth: 2.5, strokeDasharray: '8 7' }}
                            minZoom={0.25} maxZoom={2.5} fitView fitViewOptions={{ padding: 0.24, maxZoom: 1.05 }} proOptions={{ hideAttribution: true }}
                        >
                            <Background color="#d8d8dd" gap={22} size={1.1} /><Controls position="bottom-left" showInteractive={false} />
                            <MiniMap position="bottom-right" pannable zoomable nodeColor={(node) => node.data.color.value} maskColor="rgba(247,247,248,.78)" />
                            <Panel position="top-center" className="canvas-toolbar">
                                <ToolButton icon={MousePointer2} label="Select" active /><ToolButton icon={Type} label="Add text" onClick={() => addNodeFromSidebar('rounded', { label: 'Your text' })} />
                                <ToolButton icon={MessageSquareText} label="Add note" onClick={() => addNodeFromSidebar('document', { label: 'Add a note' })} /><span className="toolbar-divider" />
                                <ToolButton icon={Grid2X2} label="Fit view" onClick={() => flow.fitView({ padding: 0.25, duration: 300 })} />
                            </Panel>
                        </ReactFlow>
                        <PropertiesPanel selectedNode={selectedNode} selectedEdge={selectedEdge} onUpdateNode={updateNode} onUpdateEdge={updateEdge} onUpload={uploadAsset} uploading={uploading} onDelete={deleteSelection} onClose={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }} />
                    </main>
                </div>
            </div>
        </ACTIONS.Provider>
    );
}

export default function DiagramEditor({ diagram = null }) {
    return <ReactFlowProvider><EditorCanvas diagram={diagram} /></ReactFlowProvider>;
}
