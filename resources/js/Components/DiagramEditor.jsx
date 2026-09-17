import {
    Background, BaseEdge, ConnectionMode, Controls, Handle, MarkerType, MiniMap, NodeResizer,
    Panel, Position, ReactFlow, ReactFlowProvider, addEdge, applyEdgeChanges,
    applyNodeChanges, getSmoothStepPath, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/inter/wght-italic.css';
import '@fontsource-variable/lora/wght.css';
import '@fontsource-variable/lora/wght-italic.css';
import '@fontsource-variable/playfair-display/wght.css';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/source-code-pro/wght.css';
import '@fontsource-variable/source-code-pro/wght-italic.css';
import '@fontsource-variable/roboto/wght.css';
import '@fontsource-variable/roboto/wght-italic.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/400-italic.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/700-italic.css';
import '@fontsource-variable/open-sans/wght.css';
import '@fontsource-variable/open-sans/wght-italic.css';
import '@fontsource-variable/montserrat/wght.css';
import '@fontsource-variable/montserrat/wght-italic.css';
import '@fontsource-variable/nunito/wght.css';
import '@fontsource-variable/nunito/wght-italic.css';
import '@fontsource/great-vibes/400.css';
import '@fontsource-variable/dancing-script/wght.css';
import '@fontsource/oxygen/400.css';
import '@fontsource/oxygen/700.css';
import '@fontsource-variable/cinzel/wght.css';
import '@fontsource/marcellus/400.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/700.css';
import '@fontsource-variable/noto-sans-arabic/wght.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/noto-serif-tc/chinese-traditional-400.css';
import '@fontsource/lateef/400.css';
import '@fontsource/lateef/700.css';
import '@fontsource/noto-naskh-arabic/400.css';
import '@fontsource/noto-naskh-arabic/700.css';
import '@fontsource-variable/arimo/wght.css';
import '@fontsource-variable/arimo/wght-italic.css';
import {
    AlignCenter, AlignHorizontalJustifyCenter, AlignHorizontalSpaceAround, AlignLeft, AlignRight, AlignVerticalJustifyCenter, AlignVerticalSpaceAround, AppWindow, ArrowDown, ArrowLeft, ArrowUp, Bold, Box,
    Braces, BringToFront, Check, ChevronDown, Circle as CircleIcon, Cloud, Code2, Copy,
    Database, Diamond, Download, FileText, GitBranch, Grid2X2, GripVertical,
    Image as ImageIcon, Italic, Layers3, List, ListOrdered, LogOut, Maximize2, Menu, MessageSquareText,
    Minimize2, MousePointer2, Network, PanelBottom, PanelTop, Play, Plus, Redo2, Save, SendToBack, Server,
    Settings, Shapes, Sparkles, Square, Trash2, Type, Underline, Undo2, Upload, Users, X, Zap,
} from 'lucide-react';
import { getFontEmbedCSS, toCanvas, toSvg } from 'html-to-image';
import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { graphqlRequest } from '@/Services/graphql';
import { Link, usePage } from '@inertiajs/react';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ACTIONS = createContext({ updateNode: () => {}, beginResize: () => {}, endResize: () => {} });

const ICONS = {
    none: null, window: AppWindow, code: Code2, database: Database, cloud: Cloud,
    server: Server, file: FileText, users: Users, zap: Zap, branch: GitBranch, settings: Settings,
};

const SHAPES = [
    { type: 'text', label: 'Rich text', icon: Type },
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

const FONT_FAMILIES = [
    { label: 'DM Sans', value: 'DM Sans Variable', stack: "'DM Sans Variable', sans-serif" },
    { label: 'Manrope', value: 'Manrope Variable', stack: "'Manrope Variable', sans-serif" },
    { label: 'Inter', value: 'Inter Variable', stack: "'Inter Variable', sans-serif" },
    { label: 'Roboto', value: 'Roboto Variable', stack: "'Roboto Variable', sans-serif" },
    { label: 'Poppins', value: 'Poppins', stack: "'Poppins', sans-serif" },
    { label: 'Arial', value: 'Arimo Variable', stack: "'Arimo Variable', Arial, sans-serif" },
    { label: 'Open Sans', value: 'Open Sans Variable', stack: "'Open Sans Variable', sans-serif" },
    { label: 'Montserrat', value: 'Montserrat Variable', stack: "'Montserrat Variable', sans-serif" },
    { label: 'Nunito', value: 'Nunito Variable', stack: "'Nunito Variable', sans-serif" },
    { label: 'Oxygen', value: 'Oxygen', stack: "'Oxygen', sans-serif" },
    { label: 'Lora', value: 'Lora Variable', stack: "'Lora Variable', serif" },
    { label: 'Playfair Display', value: 'Playfair Display Variable', stack: "'Playfair Display Variable', serif" },
    { label: 'Source Code Pro', value: 'Source Code Pro Variable', stack: "'Source Code Pro Variable', monospace" },
    { label: 'Great Vibes', value: 'Great Vibes', stack: "'Great Vibes', cursive" },
    { label: 'Dancing Script', value: 'Dancing Script Variable', stack: "'Dancing Script Variable', cursive" },
    { label: 'Cinzel', value: 'Cinzel Variable', stack: "'Cinzel Variable', serif" },
    { label: 'Marcellus', value: 'Marcellus', stack: "'Marcellus', serif" },
    { label: 'Tajawal', value: 'Tajawal', stack: "'Tajawal', sans-serif" },
    { label: 'Noto Sans Arabic', value: 'Noto Sans Arabic Variable', stack: "'Noto Sans Arabic Variable', sans-serif" },
    { label: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic', stack: "'IBM Plex Sans Arabic', sans-serif" },
    { label: 'Lateef', value: 'Lateef', stack: "'Lateef', serif" },
    { label: 'Noto Naskh Arabic', value: 'Noto Naskh Arabic', stack: "'Noto Naskh Arabic', serif" },
    { label: 'Noto Serif Traditional Chinese', value: 'Noto Serif TC', stack: "'Noto Serif TC', serif" },
];

function fontStack(fontFamily = 'DM Sans Variable') {
    const legacyFamily = fontFamily === 'DM Sans' ? 'DM Sans Variable' : fontFamily === 'Manrope' ? 'Manrope Variable' : fontFamily;
    return FONT_FAMILIES.find((font) => font.value === legacyFamily)?.stack || FONT_FAMILIES[0].stack;
}

const DEFAULT_PAGE_SIZE = { width: 1200, height: 760 };
const PAGE_SIZES = {
    'Diagram': { width: 1200, height: 760 },
    'Presentation': { width: 1200, height: 675 },
    'A4 landscape': { width: 1123, height: 794 },
    'A4 portrait': { width: 794, height: 1123 },
    'Web': { width: 1440, height: 900 },
};

const PAPER_STYLES = [
    { value: 'plain', label: 'Plain page' },
    { value: 'narrow-lines', label: 'Narrow lines' },
    { value: 'wide-lines', label: 'Wide lines' },
    { value: 'four-lines', label: 'Four lines (English)' },
    { value: 'boxes', label: 'Boxes (Math)' },
    { value: 'graph-dots', label: 'Graph dots' },
];
const TOP_BOX_HEIGHT = 112;

function paperBackgroundStyle(style = 'plain', scale = 1) {
    const unit = (value) => `${Math.max(0.65, value * scale)}px`;
    const blue = 'rgba(91, 145, 198, .42)';
    const softBlue = 'rgba(91, 145, 198, .3)';
    if (style === 'narrow-lines' || style === 'wide-lines') {
        const spacing = (style === 'narrow-lines' ? 28 : 48) * scale;
        return {
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent calc(${spacing}px - ${unit(1)}), ${blue} calc(${spacing}px - ${unit(1)}), ${blue} ${spacing}px)`,
        };
    }
    if (style === 'boxes') {
        const spacing = 32 * scale;
        return {
            backgroundImage: `linear-gradient(${softBlue} ${unit(1)}, transparent ${unit(1)}), linear-gradient(90deg, ${softBlue} ${unit(1)}, transparent ${unit(1)})`,
            backgroundSize: `${spacing}px ${spacing}px`,
        };
    }
    if (style === 'graph-dots') {
        const spacing = 24 * scale;
        return {
            backgroundImage: 'radial-gradient(circle, rgba(72, 105, 139, .55) 1.15px, transparent 1.3px)',
            backgroundSize: `${spacing}px ${spacing}px`,
        };
    }
    if (style === 'four-lines') {
        const group = 90 * scale;
        const offsets = [0, 18, 36, 54].map((value) => value * scale);
        const line = (color) => `linear-gradient(to bottom, ${color} ${unit(1)}, transparent ${unit(1)})`;
        return {
            backgroundImage: [line('rgba(214, 103, 103, .48)'), line(blue), line(blue), line('rgba(214, 103, 103, .48)')].join(', '),
            backgroundSize: `100% ${group}px`,
            backgroundPosition: offsets.map((offset) => `0 ${offset}px`).join(', '),
        };
    }
    return {};
}

function drawPaperPattern(context, style, width, height) {
    if (!style || style === 'plain') return;
    context.save();
    context.lineWidth = 1;
    const drawHorizontalLines = (spacing, color = '#b9cee4') => {
        context.strokeStyle = color;
        context.beginPath();
        for (let y = spacing; y < height; y += spacing) { context.moveTo(0, y - 0.5); context.lineTo(width, y - 0.5); }
        context.stroke();
    };
    if (style === 'narrow-lines') drawHorizontalLines(28);
    if (style === 'wide-lines') drawHorizontalLines(48);
    if (style === 'boxes') {
        drawHorizontalLines(32, '#c3d4e5');
        context.strokeStyle = '#c3d4e5'; context.beginPath();
        for (let x = 32; x < width; x += 32) { context.moveTo(x - 0.5, 0); context.lineTo(x - 0.5, height); }
        context.stroke();
    }
    if (style === 'four-lines') {
        for (let group = 0; group < height; group += 90) {
            [0, 18, 36, 54].forEach((offset, index) => {
                const y = group + offset;
                if (y >= height) return;
                context.strokeStyle = index === 0 || index === 3 ? '#dfa5a5' : '#b9cee4';
                context.beginPath(); context.moveTo(0, y + 0.5); context.lineTo(width, y + 0.5); context.stroke();
            });
        }
    }
    if (style === 'graph-dots') {
        context.fillStyle = '#8199b0';
        for (let y = 24; y < height; y += 24) for (let x = 24; x < width; x += 24) {
            context.beginPath(); context.arc(x, y, 1.25, 0, Math.PI * 2); context.fill();
        }
    }
    context.restore();
}

function paperPatternSvg(style, width, height) {
    if (!style || style === 'plain') return '';
    const id = `paper-${style}`;
    let content = '';
    let patternWidth = width;
    let patternHeight = height;
    if (style === 'narrow-lines' || style === 'wide-lines') {
        patternWidth = 1; patternHeight = style === 'narrow-lines' ? 28 : 48;
        content = `<path d="M0 ${patternHeight - 0.5}H1" stroke="#b9cee4"/>`;
    } else if (style === 'boxes') {
        patternWidth = 32; patternHeight = 32;
        content = '<path d="M0 31.5H32M31.5 0V32" fill="none" stroke="#c3d4e5"/>';
    } else if (style === 'graph-dots') {
        patternWidth = 24; patternHeight = 24;
        content = '<circle cx="12" cy="12" r="1.25" fill="#8199b0"/>';
    } else if (style === 'four-lines') {
        patternWidth = 1; patternHeight = 90;
        content = '<path d="M0 .5H1M0 53.5H1" stroke="#dfa5a5"/><path d="M0 18.5H1M0 36.5H1" stroke="#b9cee4"/>';
    }
    return `<defs><pattern id="${id}" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse">${content}</pattern></defs><rect width="${width}" height="${height}" fill="url(#${id})"/>`;
}

function drawTopBox(context, width) {
    context.save();
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, TOP_BOX_HEIGHT);
    context.strokeStyle = '#cfd3da';
    context.lineWidth = 1;
    context.strokeRect(0.5, 0.5, width - 1, TOP_BOX_HEIGHT - 1);
    context.restore();
}

function topBoxSvg(width) {
    return `<rect x="0.5" y="0.5" width="${width - 1}" height="${TOP_BOX_HEIGHT - 1}" fill="#fff" stroke="#cfd3da"/>`;
}

function plainText(html = '') {
    if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, '');
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.textContent || '';
}

function cleanRichText(html = '') {
    if (typeof document === 'undefined') return html;
    const root = document.createElement('div');
    root.innerHTML = html;
    const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'BR', 'P', 'DIV', 'UL', 'OL', 'LI', 'SPAN', 'FONT']);
    [...root.querySelectorAll('*')].forEach((element) => {
        if (!allowed.has(element.tagName)) {
            element.replaceWith(...element.childNodes);
            return;
        }
        [...element.attributes].forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            if (name === 'style') {
                const alignment = element.style.textAlign;
                element.removeAttribute('style');
                if (['left', 'center', 'right', 'justify'].includes(alignment)) element.style.textAlign = alignment;
                return;
            }
            if (name === 'align' && ['left', 'center', 'right', 'justify'].includes(attribute.value.toLowerCase())) return;
            if (name !== 'color') element.removeAttribute(attribute.name);
        });
    });
    return root.innerHTML;
}

function insertEditorLineBreak(event, editor, onInsert) {
    if (event.key !== 'Enter' || event.isComposing) return false;
    const selection = window.getSelection();
    const anchor = selection?.anchorNode;
    const anchorElement = anchor?.nodeType === Node.ELEMENT_NODE ? anchor : anchor?.parentElement;
    if (anchorElement?.closest?.('li')) return false;

    event.preventDefault();
    const inserted = document.execCommand('insertLineBreak', false, null);
    if (!inserted && selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const lineBreak = document.createElement('br');
        range.deleteContents();
        range.insertNode(lineBreak);
        range.setStartAfter(lineBreak);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    onInsert(editor?.innerHTML || '');
    return true;
}

function isSvgAsset(url = '', type = '') {
    return type.toLowerCase() === 'svg' || /\.svg(?:[?#]|$)/i.test(url);
}

function withCsrf(headers = {}) {
    const cookieToken = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.slice('XSRF-TOKEN='.length);
    if (cookieToken) return { ...headers, 'X-XSRF-TOKEN': decodeURIComponent(cookieToken) };

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return token ? { ...headers, 'X-CSRF-TOKEN': token } : headers;
}

function createPage(number, content = {}) {
    return {
        id: `page-${Date.now()}-${number}-${Math.round(Math.random() * 999)}`,
        name: `Page ${number}`,
        ...DEFAULT_PAGE_SIZE,
        nodes: [],
        edges: [],
        paperStyle: 'plain',
        showTopBox: false,
        ...content,
    };
}

function applyLayerIndexes(nodes = []) {
    return nodes.map((node, index) => ({ ...node, zIndex: index + 1 }));
}

function normalizeLayerNodes(nodes = []) {
    return applyLayerIndexes([...nodes]
        .sort((first, second) => (Number(first.zIndex) || 0) - (Number(second.zIndex) || 0)));
}

function loadPages(diagram) {
    const storedPages = Array.isArray(diagram?.pages) && diagram.pages.length ? diagram.pages : null;
    const source = storedPages || [createPage(1, { nodes: diagram?.nodes || seedNodes, edges: diagram?.edges || seedEdges })];
    return source.map((page, index) => ({
        ...createPage(index + 1),
        ...page,
        name: page.name || `Page ${index + 1}`,
        width: Number(page.width) || DEFAULT_PAGE_SIZE.width,
        height: Number(page.height) || DEFAULT_PAGE_SIZE.height,
        nodes: normalizeLayerNodes(Array.isArray(page.nodes) ? page.nodes : []),
        edges: Array.isArray(page.edges) ? page.edges : [],
        paperStyle: PAPER_STYLES.some((style) => style.value === page.paperStyle) ? page.paperStyle : 'plain',
        showTopBox: Boolean(page.showTopBox),
    }));
}

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

function WorkflowNode({ id, data, selected, width, height }) {
    const { updateNode, beginResize, endResize } = useContext(ACTIONS);
    const isPageImage = data.kind === 'image' || data.shape === 'image';
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(data.richText || data.label);
    const draftRef = useRef(data.richText || data.label);
    const Icon = ICONS[data.icon] || null;
    const showShadow = data.showShadow ?? (!isPageImage && data.shape !== 'text');
    const backgroundColor = data.backgroundColor || (isPageImage || data.shape === 'text' ? 'transparent' : '#ffffff');

    useEffect(() => { const value = data.richText || data.label; setDraft(value); draftRef.current = value; }, [data.label, data.richText]);
    const finishEditing = () => {
        const cleaned = cleanRichText(draftRef.current).trim() || 'Untitled';
        updateNode(id, { richText: cleaned, label: plainText(cleaned).trim() || 'Untitled' });
        setEditing(false);
    };

    return (
        <div
            className={`workflow-node workflow-node--${data.shape} ${data.hideBorder ? 'has-hidden-border' : ''} ${showShadow ? 'has-shadow' : ''} ${selected ? 'is-selected' : ''}`}
            style={{ '--node-color': data.color.value, '--node-soft': data.color.soft, backgroundColor, width: width || undefined, height: height || undefined, fontFamily: fontStack(data.fontFamily) }}
            onDoubleClick={(event) => { if (!isPageImage) { event.stopPropagation(); setEditing(true); } }}
        >
            <NodeResizer
                isVisible={selected} minWidth={isPageImage ? 40 : data.shape === 'text' ? 120 : 80} minHeight={isPageImage ? 40 : data.shape === 'text' ? 36 : 48}
                keepAspectRatio={['circle', 'diamond'].includes(data.shape)} color={data.color.value}
                onResizeStart={beginResize} onResizeEnd={endResize}
            />
            {[Position.Top, Position.Right, Position.Bottom, Position.Left].map((position) => (
                <Handle
                    key={position} type="source" id={position} position={position} className="workflow-handle"
                    aria-label={`Draw connector from ${position}`} title="Drag to draw an arrow"
                />
            ))}
            <div className="workflow-node__inner">
                {isPageImage ? <img className="workflow-node__page-image" src={data.imageUrl} alt={data.label || ''} style={{ objectFit: data.imageFit || 'contain' }} /> : <>
                    {data.imageUrl ? <span className="workflow-node__icon workflow-node__icon--custom"><img src={data.imageUrl} alt="" /></span> : Icon && <span className="workflow-node__icon"><Icon size={20} strokeWidth={1.9} /></span>}
                    {editing ? (
                        <div
                            className="workflow-node__rich-input nodrag nowheel" contentEditable suppressContentEditableWarning autoFocus dir="auto"
                            dangerouslySetInnerHTML={{ __html: draft }}
                            style={{ color: data.textColor || undefined, fontSize: data.fontSize ? `${data.fontSize}px` : undefined, fontFamily: fontStack(data.fontFamily) }}
                            onInput={(event) => { draftRef.current = event.currentTarget.innerHTML; }} onBlur={finishEditing}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') { const value = data.richText || data.label; draftRef.current = value; setDraft(value); setEditing(false); }
                                else insertEditorLineBreak(event, event.currentTarget, (value) => { draftRef.current = value; });
                                event.stopPropagation();
                            }}
                        />
                    ) : <div className="workflow-node__label rich-content" dir="auto" style={{ color: data.textColor || undefined, fontSize: data.fontSize ? `${data.fontSize}px` : undefined, fontFamily: fontStack(data.fontFamily) }} dangerouslySetInnerHTML={{ __html: cleanRichText(data.richText || data.label) }} />}
                </>}
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

function LayerList({ nodes, selectedNodeId, onSelectNode, onMoveLayer, onReorderLayer }) {
    const frontToBack = [...nodes].reverse();

    return <div className="layers-view">
        <div className="sidebar-heading"><p>LAYERS</p><span>Front layers appear first</span></div>
        {frontToBack.length ? <div className="layer-list">
            {frontToBack.map((node, index) => {
                const isImage = node.data.kind === 'image' || node.data.shape === 'image';
                const label = plainText(node.data.richText || node.data.label || '').trim() || (isImage ? 'Image' : 'Untitled layer');
                return <div
                    key={node.id} draggable className={`layer-row ${selectedNodeId === node.id ? 'is-selected' : ''}`}
                    onDragStart={(event) => { event.dataTransfer.setData('application/workflow-layer', node.id); event.dataTransfer.effectAllowed = 'move'; }}
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(event) => { event.preventDefault(); const sourceId = event.dataTransfer.getData('application/workflow-layer'); if (sourceId) onReorderLayer(sourceId, node.id); }}
                    onClick={() => onSelectNode(node.id)}
                >
                    <GripVertical size={13} className="layer-grip" />
                    <span className="layer-thumbnail">{isImage && node.data.imageUrl ? <img src={node.data.imageUrl} alt="" /> : node.data.shape === 'text' ? <Type size={14} /> : <Shapes size={14} />}</span>
                    <span className="layer-name"><strong>{label}</strong><small>{isImage ? 'Image' : node.data.shape || 'Shape'}</small></span>
                    <span className="layer-row-actions">
                        <button type="button" disabled={index === 0} title="Move forward" onClick={(event) => { event.stopPropagation(); onMoveLayer(node.id, 'forward'); }}><ArrowUp size={12} /></button>
                        <button type="button" disabled={index === frontToBack.length - 1} title="Move backward" onClick={(event) => { event.stopPropagation(); onMoveLayer(node.id, 'backward'); }}><ArrowDown size={12} /></button>
                    </span>
                </div>;
            })}
        </div> : <div className="layers-empty"><Layers3 size={25} /><strong>No layers yet</strong><span>Add a shape, text, or image.</span></div>}
        <p className="layers-help">Drag layers to reorder them. The top item appears in front.</p>
    </div>;
}

function Sidebar({ onAddNode, onUpload, uploading, collapsed, setCollapsed, nodes, selectedNodeId, onSelectNode, onMoveLayer, onReorderLayer }) {
    const [view, setView] = useState('elements');
    return (
        <aside className={`editor-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
            <button className="sidebar-collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
                {collapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
            {!collapsed && <>
                <div className="sidebar-tabs">
                    <button type="button" className={view === 'elements' ? 'is-active' : ''} onClick={() => setView('elements')}><Shapes size={14} /> Elements</button>
                    <button type="button" className={view === 'layers' ? 'is-active' : ''} onClick={() => setView('layers')}><Layers3 size={14} /> Layers <b>{nodes.length}</b></button>
                </div>
                {view === 'elements' ? <>
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
                    <Upload size={16} /><span><strong>{uploading ? 'Uploading...' : 'Add image to page'}</strong><small>Draggable SVG, PNG, JPG, WebP or GIF</small></span>
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/*" disabled={uploading} onChange={(event) => { onUpload(event.target.files?.[0]); event.target.value = ''; }} />
                </label>
                <div className="sidebar-tip"><Sparkles size={16} /><p><strong>Pro tip</strong><br />Double-click text to edit it. Use the style panel for lists, emphasis and alignment.</p></div>
                </> : <LayerList nodes={nodes} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} onMoveLayer={onMoveLayer} onReorderLayer={onReorderLayer} />}
            </>}
        </aside>
    );
}

function RichTextControl({ node, onChange }) {
    const editorRef = useRef(null);
    const [draft, setDraft] = useState(node.data.richText || node.data.label || '');
    const draftRef = useRef(draft);

    useEffect(() => { const value = node.data.richText || node.data.label || ''; setDraft(value); draftRef.current = value; }, [node.id, node.data.richText, node.data.label]);

    const commit = () => {
        const cleaned = cleanRichText(editorRef.current?.innerHTML || draft).trim() || 'Untitled';
        draftRef.current = cleaned;
        setDraft(cleaned);
        onChange({ richText: cleaned, label: plainText(cleaned).trim() || 'Untitled' });
    };
    const command = (name, value = null) => {
        editorRef.current?.focus();
        document.execCommand(name, false, value);
        draftRef.current = editorRef.current?.innerHTML || draftRef.current;
        commit();
    };

    return <>
        <div className="rich-toolbar" onMouseDown={(event) => event.preventDefault()}>
            <button type="button" onClick={() => command('bold')} title="Bold"><Bold size={14} /></button>
            <button type="button" onClick={() => command('italic')} title="Italic"><Italic size={14} /></button>
            <button type="button" onClick={() => command('underline')} title="Underline"><Underline size={14} /></button>
            <i />
            <button type="button" onClick={() => command('justifyLeft')} title="Align left"><AlignLeft size={14} /></button>
            <button type="button" onClick={() => command('justifyCenter')} title="Align center"><AlignCenter size={14} /></button>
            <button type="button" onClick={() => command('justifyRight')} title="Align right"><AlignRight size={14} /></button>
            <button type="button" onClick={() => command('insertUnorderedList')} title="Bullet list"><List size={14} /></button>
            <button type="button" onClick={() => command('insertOrderedList')} title="Numbered list"><ListOrdered size={14} /></button>
        </div>
        <div
            ref={editorRef} className="rich-editor" contentEditable suppressContentEditableWarning dir="auto"
            style={{ fontFamily: fontStack(node.data.fontFamily) }}
            dangerouslySetInnerHTML={{ __html: draft }} onInput={(event) => { draftRef.current = event.currentTarget.innerHTML; }}
            onKeyDown={(event) => {
                insertEditorLineBreak(event, event.currentTarget, (value) => { draftRef.current = value; });
                event.stopPropagation();
            }}
            onBlur={commit}
        />
    </>;
}

function LayerControls({ node, onMoveLayer }) {
    return <div className="layer-controls">
        <span className="field-label">Layer position</span>
        <div>
            <button type="button" onClick={() => onMoveLayer(node.id, 'front')} title="Bring to front"><BringToFront size={14} /><span>Front</span></button>
            <button type="button" onClick={() => onMoveLayer(node.id, 'forward')} title="Move one layer forward"><ArrowUp size={14} /><span>Forward</span></button>
            <button type="button" onClick={() => onMoveLayer(node.id, 'backward')} title="Move one layer backward"><ArrowDown size={14} /><span>Backward</span></button>
            <button type="button" onClick={() => onMoveLayer(node.id, 'back')} title="Send to back"><SendToBack size={14} /><span>Back</span></button>
        </div>
        <small>Shortcuts: Ctrl/Cmd + [ or ]</small>
    </div>;
}

function AlignmentPanel({ count, onAlign, onDistribute, onClose }) {
    return (
        <aside className="properties-panel selection-panel">
            <div className="properties-title">
                <div><span>ARRANGE</span><strong>{count} shapes selected</strong></div>
                <button onClick={onClose} aria-label="Clear selection"><X size={17} /></button>
            </div>
            <span className="field-label">Align selection</span>
            <div className="alignment-grid alignment-grid--three">
                <button type="button" onClick={() => onAlign('left')} title="Align left edges"><AlignLeft size={17} /><span>Left</span></button>
                <button type="button" onClick={() => onAlign('center')} title="Align horizontal centers"><AlignHorizontalJustifyCenter size={17} /><span>Center</span></button>
                <button type="button" onClick={() => onAlign('right')} title="Align right edges"><AlignRight size={17} /><span>Right</span></button>
                <button type="button" onClick={() => onAlign('top')} title="Align top edges"><PanelTop size={17} /><span>Top</span></button>
                <button type="button" onClick={() => onAlign('middle')} title="Align vertical centers"><AlignVerticalJustifyCenter size={17} /><span>Middle</span></button>
                <button type="button" onClick={() => onAlign('bottom')} title="Align bottom edges"><PanelBottom size={17} /><span>Bottom</span></button>
            </div>
            <span className="field-label">Equal space between</span>
            <div className="alignment-grid">
                <button type="button" disabled={count < 3} onClick={() => onDistribute('horizontal')} title="Distribute with equal horizontal spacing"><AlignHorizontalSpaceAround size={17} /><span>Horizontal</span></button>
                <button type="button" disabled={count < 3} onClick={() => onDistribute('vertical')} title="Distribute with equal vertical spacing"><AlignVerticalSpaceAround size={17} /><span>Vertical</span></button>
            </div>
            <p className="selection-help">Hold Shift, Ctrl, or Cmd while clicking to select more shapes.</p>
        </aside>
    );
}

function PropertiesPanel({ selectedNode, selectedEdge, onUpdateNode, onUpdateEdge, onUpload, uploading, onMoveLayer, onDelete, onClose }) {
    if (!selectedNode && !selectedEdge) return null;
    const isImage = selectedNode && (selectedNode.data.kind === 'image' || selectedNode.data.shape === 'image');
    const showShadow = selectedNode && (selectedNode.data.showShadow ?? (!isImage && selectedNode.data.shape !== 'text'));
    return (
        <aside className="properties-panel">
            <div className="properties-title">
                <div><span>STYLE</span><strong>{isImage ? 'Image settings' : selectedNode ? 'Shape settings' : 'Connector settings'}</strong></div>
                <button onClick={onClose} aria-label="Close properties"><X size={17} /></button>
            </div>
            {selectedNode ? <>{isImage ? <>
                <div className="image-property-preview"><img src={selectedNode.data.imageUrl} alt={selectedNode.data.label || ''} /></div>
                <label className="field-label" htmlFor="image-name">Image name</label>
                <input id="image-name" className="property-input" value={selectedNode.data.label || ''} onChange={(event) => onUpdateNode(selectedNode.id, { label: event.target.value })} />
                <label className="field-label" htmlFor="image-fit">Image fit</label>
                <div className="select-wrap"><select id="image-fit" value={selectedNode.data.imageFit || 'contain'} onChange={(event) => onUpdateNode(selectedNode.id, { imageFit: event.target.value })}><option value="contain">Contain</option><option value="cover">Cover</option><option value="fill">Stretch</option></select><ChevronDown size={15} /></div>
                <label className="property-upload"><Upload size={15} /> {uploading ? 'Uploading...' : 'Replace image'}
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/*" disabled={uploading} onChange={(event) => { onUpload(event.target.files?.[0], selectedNode.id); event.target.value = ''; }} />
                </label>
                <div className="animation-toggle border-toggle">
                    <div><strong>Show border</strong><span>Display the image outline</span></div>
                    <button type="button" role="switch" aria-checked={!selectedNode.data.hideBorder} className={!selectedNode.data.hideBorder ? 'is-on' : ''} onClick={() => onUpdateNode(selectedNode.id, { hideBorder: !selectedNode.data.hideBorder })}><i /></button>
                </div>
                <div className="animation-toggle border-toggle">
                    <div><strong>Show shadow</strong><span>Add depth behind the image</span></div>
                    <button type="button" role="switch" aria-checked={showShadow} className={showShadow ? 'is-on' : ''} onClick={() => onUpdateNode(selectedNode.id, { showShadow: !showShadow })}><i /></button>
                </div>
            </> : <>
                <span className="field-label">Rich text</span>
                <RichTextControl key={selectedNode.id} node={selectedNode} onChange={(patch) => onUpdateNode(selectedNode.id, patch)} />
                <div className="type-style-row">
                    <label className="font-family-field"><span>Font</span><select value={selectedNode.data.fontFamily || 'DM Sans Variable'} onChange={(event) => onUpdateNode(selectedNode.id, { fontFamily: event.target.value })}>
                        {FONT_FAMILIES.map((font) => <option key={font.value} value={font.value} style={{ fontFamily: font.stack }}>{font.label}</option>)}
                    </select></label>
                    <label><span>Size</span><select value={selectedNode.data.fontSize || (selectedNode.data.shape === 'text' ? 17 : 13)} onChange={(event) => onUpdateNode(selectedNode.id, { fontSize: Number(event.target.value) })}>
                        {[10, 12, 13, 14, 16, 17, 20, 24, 30, 36, 48].map((size) => <option key={size} value={size}>{size} px</option>)}
                    </select></label>
                    <label><span>Text color</span><input type="color" value={selectedNode.data.textColor || '#20212a'} onChange={(event) => onUpdateNode(selectedNode.id, { textColor: event.target.value })} /></label>
                    <label><span>Background</span><input type="color" value={selectedNode.data.backgroundColor && selectedNode.data.backgroundColor !== 'transparent' ? selectedNode.data.backgroundColor : '#ffffff'} onChange={(event) => onUpdateNode(selectedNode.id, { backgroundColor: event.target.value })} /></label>
                    <label><span>Fill</span><button type="button" className="no-fill-button" onClick={() => onUpdateNode(selectedNode.id, { backgroundColor: 'transparent' })}>No fill</button></label>
                </div>
                <div className="animation-toggle border-toggle">
                    <div><strong>Show border</strong><span>Display the element outline</span></div>
                    <button type="button" role="switch" aria-checked={!selectedNode.data.hideBorder} className={!selectedNode.data.hideBorder ? 'is-on' : ''} onClick={() => onUpdateNode(selectedNode.id, { hideBorder: !selectedNode.data.hideBorder })}><i /></button>
                </div>
                <div className="animation-toggle border-toggle">
                    <div><strong>Show shadow</strong><span>Add depth behind the element</span></div>
                    <button type="button" role="switch" aria-checked={showShadow} className={showShadow ? 'is-on' : ''} onClick={() => onUpdateNode(selectedNode.id, { showShadow: !showShadow })}><i /></button>
                </div>
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
            </>}</> : <>
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
            {selectedNode && <LayerControls node={selectedNode} onMoveLayer={onMoveLayer} />}
            <button type="button" className="delete-button" onClick={onDelete}><Trash2 size={16} /> Delete {selectedNode ? 'shape' : 'connector'}</button>
        </aside>
    );
}

function PagesBar({ pages, activePageId, onSelect, onAdd, onDuplicate, onRename, onDelete }) {
    return (
        <div className="pages-bar">
            <div className="pages-bar__label"><PanelBottom size={15} /><span>Pages</span><b>{pages.length}</b></div>
            <div className="page-tabs">
                {pages.map((page, index) => (
                    <button key={page.id} type="button" className={`page-tab ${page.id === activePageId ? 'is-active' : ''}`} onClick={() => onSelect(page.id)} onDoubleClick={() => {
                        const name = window.prompt('Page name', page.name);
                        if (name?.trim()) onRename(page.id, name.trim());
                    }}>
                        <span>{index + 1}</span><strong>{page.name}</strong><small>{page.width} × {page.height}</small>
                    </button>
                ))}
            </div>
            <button type="button" className="page-action" onClick={onAdd} title="Add page"><Plus size={16} /><span>Add page</span></button>
            <button type="button" className="page-action page-action--icon" onClick={onDuplicate} title="Duplicate current page"><Copy size={16} /></button>
            <button type="button" className="page-action page-action--icon is-danger" onClick={onDelete} disabled={pages.length === 1} title="Delete current page"><Trash2 size={16} /></button>
        </div>
    );
}

function ExportMenu({ onExport, exporting, filename, onFilenameChange, pages }) {
    const [open, setOpen] = useState(false);
    const [selectedPageIds, setSelectedPageIds] = useState(() => pages.map((page) => page.id));
    const menuRef = useRef(null);
    const pageKey = pages.map((page) => page.id).join('|');
    useEffect(() => setSelectedPageIds(pages.map((page) => page.id)), [pageKey]);
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
                <div><strong>Export document</strong><span>Select exactly which pages to include</span></div>
                <div className="export-page-picker">
                    <div><strong>Pages ({selectedPageIds.length} selected)</strong><button type="button" onClick={() => setSelectedPageIds(selectedPageIds.length === pages.length ? [] : pages.map((page) => page.id))}>{selectedPageIds.length === pages.length ? 'Clear' : 'Select all'}</button></div>
                    <div className="export-page-list">
                        {pages.map((page, index) => <label key={page.id}>
                            <input type="checkbox" checked={selectedPageIds.includes(page.id)} onChange={() => setSelectedPageIds((ids) => ids.includes(page.id) ? ids.filter((id) => id !== page.id) : [...ids, page.id])} />
                            <span>{index + 1}</span><strong>{page.name}</strong>
                        </label>)}
                    </div>
                </div>
                <label className="export-filename"><span>File name</span><input value={filename} onChange={(event) => onFilenameChange(event.target.value)} placeholder="my-workflow" /></label>
                {[['pdf', 'PDF', `${selectedPageIds.length} page${selectedPageIds.length === 1 ? '' : 's'} in one PDF`], ['png', 'PNG', 'High quality image'], ['jpeg', 'JPEG', 'Smaller image'], ['webp', 'WEBP', 'Modern image'], ['gif', 'GIF', 'Animated connectors'], ['svg', 'SVG', 'Scalable vector']].map(([value, label, hint]) => (
                    <button key={value} disabled={!selectedPageIds.length} onClick={() => { setOpen(false); onExport(value, selectedPageIds); }}>{value === 'pdf' ? <FileText size={17} /> : <ImageIcon size={17} />}<span><strong>{label}</strong><small>{hint}</small></span></button>
                ))}
            </div>}
        </div>
    );
}

function PageControls({ page, elementCount, onResize, onAddImage, onImportBackground, importing, onBackgroundFit, onRemoveBackground, onPaperStyle, onTopBox, expanded, onToggleExpanded }) {
    const preset = Object.entries(PAGE_SIZES).find(([, size]) => size.width === page.width && size.height === page.height)?.[0] || 'Custom';
    const [custom, setCustom] = useState({ width: page.width, height: page.height });
    const [selectedPreset, setSelectedPreset] = useState(preset);
    useEffect(() => { setCustom({ width: page.width, height: page.height }); setSelectedPreset(preset); }, [page.id, page.width, page.height, preset]);
    const applyCustom = () => onResize({
        width: Math.max(320, Math.min(4000, Number(custom.width) || page.width)),
        height: Math.max(240, Math.min(4000, Number(custom.height) || page.height)),
    });
    return (
        <div className="artboard-controls">
            <div className="artboard-summary"><strong>{page.name}</strong><span>{elementCount} elements</span></div>
            <div className="page-settings">
                <label>Paper<select value={page.paperStyle || 'plain'} onChange={(event) => onPaperStyle(event.target.value)}>
                    {PAPER_STYLES.map((style) => <option key={style.value} value={style.value}>{style.label}</option>)}
                </select></label>
                <button type="button" className={`page-top-box-button ${page.showTopBox ? 'is-active' : ''}`} onClick={() => onTopBox(!page.showTopBox)} aria-pressed={Boolean(page.showTopBox)} title={page.showTopBox ? 'Hide the top information box' : 'Show a top information box'}>
                    <PanelTop size={14} /> Top box
                </button>
                <label className="page-import-button page-add-image"><ImageIcon size={14} />{importing ? 'Uploading…' : 'Add image'}
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/*" disabled={importing} onChange={(event) => { onAddImage(event.target.files?.[0]); event.target.value = ''; }} />
                </label>
                {/* <label className="page-import-button"><Upload size={14} />{importing ? 'Importing…' : 'Page background'}
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" disabled={importing} onChange={(event) => { onImportBackground(event.target.files?.[0]); event.target.value = ''; }} />
                </label>
                {page.backgroundImage && <>
                    <label>Image fit<select value={page.backgroundFit || 'cover'} onChange={(event) => onBackgroundFit(event.target.value)}><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Stretch</option></select></label>
                    <button type="button" className="remove-page-image" onClick={onRemoveBackground} title="Remove page image"><X size={14} /></button>
                </>} */}
                <label>Page size<select value={selectedPreset} onChange={(event) => {
                    setSelectedPreset(event.target.value);
                    const size = PAGE_SIZES[event.target.value];
                    if (size) onResize(size);
                }}>{Object.keys(PAGE_SIZES).map((name) => <option key={name}>{name}</option>)}<option>Custom</option></select></label>
                {selectedPreset === 'Custom' && <div className="custom-page-size">
                    <label><span>W</span><input type="number" min="320" max="4000" value={custom.width} onChange={(event) => setCustom((value) => ({ ...value, width: event.target.value }))} onBlur={applyCustom} onKeyDown={(event) => event.key === 'Enter' && applyCustom()} /></label>
                    <b>×</b>
                    <label><span>H</span><input type="number" min="240" max="4000" value={custom.height} onChange={(event) => setCustom((value) => ({ ...value, height: event.target.value }))} onBlur={applyCustom} onKeyDown={(event) => event.key === 'Enter' && applyCustom()} /></label>
                </div>}
                <ToolButton icon={expanded ? Minimize2 : Maximize2} label={expanded ? 'Restore canvas size' : 'Expand canvas'} onClick={onToggleExpanded} active={expanded} />
            </div>
        </div>
    );
}

function ArtboardFrame({ page, children }) {
    const workspaceRef = useRef(null);
    const [workspaceSize, setWorkspaceSize] = useState({ width: 1200, height: 760 });
    useEffect(() => {
        const element = workspaceRef.current;
        if (!element) return undefined;
        const resize = () => setWorkspaceSize({ width: element.clientWidth, height: element.clientHeight });
        resize();
        const observer = new ResizeObserver(resize); observer.observe(element);
        return () => observer.disconnect();
    }, []);
    const scale = Math.max(0.1, Math.min(1, (workspaceSize.width - 64) / page.width, (workspaceSize.height - 62) / page.height));
    return (
        <div className="artboard-workspace" ref={workspaceRef}>
            <div className="artboard-label">{page.name} <span>{page.width} × {page.height} px</span></div>
            <section className="artboard-frame" style={{
                width: page.width * scale, height: page.height * scale,
                backgroundImage: page.backgroundImage ? `url("${page.backgroundImage}")` : undefined,
                backgroundSize: page.backgroundFit || 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            }}>
                <div className="artboard-paper-pattern" style={paperBackgroundStyle(page.paperStyle, scale)} aria-hidden="true" />
                {page.showTopBox && <div className="artboard-top-box" style={{ height: TOP_BOX_HEIGHT * scale, borderWidth: Math.max(0.65, scale) }} aria-hidden="true" />}
                {children}
            </section>
        </div>
    );
}

function EditorCanvas({ diagram }) {
    const flow = useReactFlow();
    const { auth } = usePage().props;
    const draftStorageKey = `flowcraft-diagram:${auth?.user?.id || 'anonymous'}`;
    const initialPages = useMemo(() => loadPages(diagram), [diagram]);
    const [pages, setPages] = useState(initialPages);
    const [activePageId, setActivePageId] = useState(initialPages[0].id);
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
    const [canvasExpanded, setCanvasExpanded] = useState(false);
    const dragStart = useRef(null);
    const wrapperRef = useRef(null);
    const pageViewports = useRef(new Map(initialPages.filter((page) => page.viewport).map((page) => [page.id, page.viewport])));
    const activePage = pages.find((page) => page.id === activePageId) || pages[0];
    const nodes = activePage?.nodes || [];
    const edges = activePage?.edges || [];

    const rememberPageViewport = useCallback((page, viewport) => {
        const flowElement = wrapperRef.current?.querySelector('.react-flow');
        if (!page || !viewport || !flowElement?.clientWidth || !flowElement?.clientHeight) return;
        const scaleX = page.width / flowElement.clientWidth;
        const scaleY = page.height / flowElement.clientHeight;
        pageViewports.current.set(page.id, {
            x: viewport.x * scaleX,
            y: viewport.y * scaleY,
            zoom: viewport.zoom * scaleX,
        });
    }, []);

    const restorePageViewport = useCallback((page, viewport, instance = flow) => {
        const flowElement = wrapperRef.current?.querySelector('.react-flow');
        if (!page || !viewport || !flowElement?.clientWidth || !flowElement?.clientHeight) return false;
        const scaleX = flowElement.clientWidth / page.width;
        const scaleY = flowElement.clientHeight / page.height;
        instance.setViewport({ x: viewport.x * scaleX, y: viewport.y * scaleY, zoom: viewport.zoom * scaleX }, { duration: 0 });
        return true;
    }, [flow]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const viewport = pageViewports.current.get(activePage?.id);
            if (!restorePageViewport(activePage, viewport)) flow.fitView({ padding: 0.2, duration: 260, maxZoom: 1.05 });
        }, 40);
        return () => clearTimeout(timer);
    }, [canvasExpanded, activePageId, flow, restorePageViewport]);

    useEffect(() => {
        const restoreOnEscape = (event) => { if (event.key === 'Escape') setCanvasExpanded(false); };
        window.addEventListener('keydown', restoreOnEscape);
        return () => window.removeEventListener('keydown', restoreOnEscape);
    }, []);

    const toggleCanvasExpanded = useCallback(() => {
        rememberPageViewport(activePage, flow.getViewport());
        setCanvasExpanded((value) => !value);
    }, [activePage, flow, rememberPageViewport]);

    const setPageContent = useCallback((key, updater) => {
        setPages((items) => items.map((page) => page.id === activePageId
            ? { ...page, [key]: typeof updater === 'function' ? updater(page[key]) : updater }
            : page));
    }, [activePageId]);
    const setNodes = useCallback((updater) => setPageContent('nodes', updater), [setPageContent]);
    const setEdges = useCallback((updater) => setPageContent('edges', updater), [setPageContent]);

    useEffect(() => {
        if (diagram) return;
        try {
            const stored = JSON.parse(localStorage.getItem(draftStorageKey));
            if (stored?.pages?.length || (stored?.nodes && stored?.edges)) {
                const restoredPages = loadPages(stored);
                setPages(restoredPages);
                pageViewports.current = new Map(restoredPages.filter((page) => page.viewport).map((page) => [page.id, page.viewport]));
                setActivePageId(restoredPages[0].id);
                setTitle(stored.title || 'Untitled workflow');
                setFilename(stored.filename || 'untitled-workflow');
            }
        } catch (error) {
            console.warn('Saved diagram could not be loaded.', error);
        }
    }, [diagram, draftStorageKey]);

    const nodeTypes = useMemo(() => ({ workflow: MemoWorkflowNode }), []);
    const edgeTypes = useMemo(() => ({ workflowEdge: MemoWorkflowEdge }), []);
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const selectedEdge = edges.find((item) => item.id === selectedEdgeId);
    const selectedNodes = nodes.filter((node) => node.selected);
    const snapshot = useCallback(() => ({ pages, activePageId }), [pages, activePageId]);
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
            id, type: 'workflow', position, zIndex: Math.max(0, ...items.map((node) => Number(node.zIndex) || 0)) + 1, ...(overrides.style ? { style: overrides.style } : {}),
            data: {
                label: overrides.label || definition?.label || 'New shape',
                richText: overrides.richText || overrides.label || definition?.label || 'New shape',
                shape, icon: overrides.icon || 'none', imageUrl: overrides.imageUrl || null,
                kind: overrides.kind || null, imageFit: overrides.imageFit || null, mediaType: overrides.mediaType || null,
                hideBorder: Boolean(overrides.hideBorder), backgroundColor: overrides.backgroundColor || null,
                showShadow: overrides.showShadow ?? null,
                fontFamily: overrides.fontFamily || 'DM Sans Variable',
                color: COLORS[items.length % COLORS.length],
            },
        }]);
        setSelectedNodeId(id); setSelectedEdgeId(null);
    }, [remember]);

    const addNodeFromSidebar = (shape, overrides = {}) => {
        const artboard = wrapperRef.current?.querySelector('.artboard-frame')?.getBoundingClientRect();
        const center = flow.screenToFlowPosition({ x: artboard ? artboard.left + artboard.width / 2 : window.innerWidth / 2, y: artboard ? artboard.top + artboard.height / 2 : window.innerHeight / 2 });
        const nodeWidth = Number(overrides.style?.width) || 150; const nodeHeight = Number(overrides.style?.height) || 80;
        addNodeAt(shape, { x: center.x - nodeWidth / 2 + nodes.length * 5, y: center.y - nodeHeight / 2 + nodes.length * 5 }, overrides);
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
        const selectedIds = selectedNodes.map((node) => node.id);
        if (!selectedIds.length && !selectedNodeId && !selectedEdgeId) return;
        remember();
        if (selectedIds.length || selectedNodeId) {
            const nodeIds = new Set(selectedIds.length ? selectedIds : [selectedNodeId]);
            setNodes((items) => items.filter((node) => !nodeIds.has(node.id)));
            setEdges((items) => items.filter((item) => !nodeIds.has(item.source) && !nodeIds.has(item.target)));
            setSelectedNodeId(null);
        } else { setEdges((items) => items.filter((item) => item.id !== selectedEdgeId)); setSelectedEdgeId(null); }
    }, [selectedNodes, selectedNodeId, selectedEdgeId, remember]);
    const undo = useCallback(() => {
        if (!history.length) return;
        const previous = history[history.length - 1];
        setFuture((items) => [snapshot(), ...items]); setHistory((items) => items.slice(0, -1));
        setPages(previous.pages); setActivePageId(previous.activePageId); setSaved(false);
    }, [history, snapshot]);
    const redo = useCallback(() => {
        if (!future.length) return;
        const next = future[0];
        setHistory((items) => [...items, snapshot()]); setFuture((items) => items.slice(1));
        setPages(next.pages); setActivePageId(next.activePageId); setSaved(false);
    }, [future, snapshot]);

    const selectPage = useCallback((id) => {
        rememberPageViewport(activePage, flow.getViewport());
        setActivePageId(id);
        setSelectedNodeId(null); setSelectedEdgeId(null);
    }, [activePage, flow, rememberPageViewport]);
    const addPage = useCallback(() => {
        remember();
        const page = createPage(pages.length + 1);
        setPages((items) => [...items, page]);
        setActivePageId(page.id); setSelectedNodeId(null); setSelectedEdgeId(null);
    }, [pages.length, remember]);
    const duplicatePage = useCallback(() => {
        remember();
        const suffix = `-${Date.now()}`;
        const viewport = pageViewports.current.get(activePage.id) || activePage.viewport;
        const page = createPage(pages.length + 1, {
            name: `${activePage.name} copy`, width: activePage.width, height: activePage.height,
            backgroundImage: activePage.backgroundImage, backgroundName: activePage.backgroundName, backgroundFit: activePage.backgroundFit, backgroundType: activePage.backgroundType,
            paperStyle: activePage.paperStyle || 'plain',
            showTopBox: Boolean(activePage.showTopBox),
            ...(viewport ? { viewport } : {}),
            nodes: activePage.nodes.map((node) => ({ ...node, id: `${node.id}${suffix}` })),
            edges: activePage.edges.map((edge) => ({ ...edge, id: `${edge.id}${suffix}`, source: `${edge.source}${suffix}`, target: `${edge.target}${suffix}` })),
        });
        if (viewport) pageViewports.current.set(page.id, viewport);
        setPages((items) => [...items, page]); setActivePageId(page.id);
        setSelectedNodeId(null); setSelectedEdgeId(null);
    }, [activePage, pages.length, remember]);
    const renamePage = useCallback((id, name) => {
        remember(); setPages((items) => items.map((page) => page.id === id ? { ...page, name } : page));
    }, [remember]);
    const deletePage = useCallback(() => {
        if (pages.length === 1) return;
        const index = pages.findIndex((page) => page.id === activePageId);
        if (!window.confirm(`Delete “${activePage.name}”? This can be undone.`)) return;
        remember();
        const nextPages = pages.filter((page) => page.id !== activePageId);
        setPages(nextPages); setActivePageId(nextPages[Math.max(0, index - 1)].id);
        setSelectedNodeId(null); setSelectedEdgeId(null);
    }, [pages, activePageId, activePage, remember]);
    const resizePage = useCallback((size) => {
        remember();
        pageViewports.current.delete(activePageId);
        setPages((items) => items.map((page) => page.id === activePageId ? { ...page, ...size } : page));
    }, [activePageId, remember]);
    const updatePageBackground = useCallback((patch) => {
        remember();
        setPages((items) => items.map((page) => page.id === activePageId ? { ...page, ...patch } : page));
    }, [activePageId, remember]);
    const beginResize = useCallback(() => { dragStart.current = snapshot(); }, [snapshot]);
    const endResize = useCallback(() => {
        if (!dragStart.current) return;
        setHistory((items) => [...items.slice(-39), dragStart.current]);
        setFuture([]); setSaved(false); dragStart.current = null;
    }, []);

    const moveLayer = useCallback((nodeId, direction) => {
        remember();
        setNodes((items) => {
            const currentIndex = items.findIndex((node) => node.id === nodeId);
            if (currentIndex < 0) return items;
            const targetIndex = direction === 'front'
                ? items.length - 1
                : direction === 'back'
                    ? 0
                    : direction === 'forward'
                        ? Math.min(items.length - 1, currentIndex + 1)
                        : Math.max(0, currentIndex - 1);
            if (targetIndex === currentIndex) return items;
            const ordered = [...items];
            const [moving] = ordered.splice(currentIndex, 1);
            ordered.splice(targetIndex, 0, moving);
            return applyLayerIndexes(ordered);
        });
    }, [remember, setNodes]);

    const reorderLayer = useCallback((sourceId, targetId) => {
        if (sourceId === targetId) return;
        remember();
        setNodes((items) => {
            const sourceIndex = items.findIndex((node) => node.id === sourceId);
            const targetIndex = items.findIndex((node) => node.id === targetId);
            if (sourceIndex < 0 || targetIndex < 0) return items;
            const ordered = [...items];
            const [moving] = ordered.splice(sourceIndex, 1);
            const targetAfterRemoval = ordered.findIndex((node) => node.id === targetId);
            ordered.splice(sourceIndex < targetIndex ? targetAfterRemoval + 1 : targetAfterRemoval, 0, moving);
            return applyLayerIndexes(ordered);
        });
    }, [remember, setNodes]);

    const clearSelection = useCallback(() => {
        setNodes((items) => items.map((node) => node.selected ? { ...node, selected: false } : node));
        setEdges((items) => items.map((edge) => edge.selected ? { ...edge, selected: false } : edge));
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
    }, [setNodes, setEdges]);

    const selectSingleNode = useCallback((id) => {
        setNodes((items) => items.map((node) => ({ ...node, selected: node.id === id })));
        setEdges((items) => items.map((edge) => edge.selected ? { ...edge, selected: false } : edge));
        setSelectedNodeId(id);
        setSelectedEdgeId(null);
    }, [setNodes, setEdges]);

    const alignSelectedNodes = useCallback((direction) => {
        if (selectedNodes.length < 2) return;
        const liveNodes = new Map(flow.getNodes().map((node) => [node.id, node]));
        const dimensions = selectedNodes.map((node) => {
            const liveNode = liveNodes.get(node.id) || node;
            return {
                id: node.id,
                x: node.position.x,
                y: node.position.y,
                width: Number.parseFloat(liveNode.measured?.width || liveNode.width || liveNode.style?.width) || 0,
                height: Number.parseFloat(liveNode.measured?.height || liveNode.height || liveNode.style?.height) || 0,
            };
        });
        const bounds = {
            left: Math.min(...dimensions.map((node) => node.x)),
            right: Math.max(...dimensions.map((node) => node.x + node.width)),
            top: Math.min(...dimensions.map((node) => node.y)),
            bottom: Math.max(...dimensions.map((node) => node.y + node.height)),
        };
        const target = {
            left: bounds.left,
            center: (bounds.left + bounds.right) / 2,
            right: bounds.right,
            top: bounds.top,
            middle: (bounds.top + bounds.bottom) / 2,
            bottom: bounds.bottom,
        }[direction];
        const selectedIds = new Set(dimensions.map((node) => node.id));

        remember();
        setNodes((items) => items.map((node) => {
            if (!selectedIds.has(node.id)) return node;
            const size = dimensions.find((item) => item.id === node.id);
            const position = { ...node.position };
            if (direction === 'left') position.x = target;
            if (direction === 'center') position.x = target - size.width / 2;
            if (direction === 'right') position.x = target - size.width;
            if (direction === 'top') position.y = target;
            if (direction === 'middle') position.y = target - size.height / 2;
            if (direction === 'bottom') position.y = target - size.height;
            return { ...node, position };
        }));
    }, [selectedNodes, flow, remember, setNodes]);

    const distributeSelectedNodes = useCallback((axis) => {
        if (selectedNodes.length < 3) return;
        const liveNodes = new Map(flow.getNodes().map((node) => [node.id, node]));
        const horizontal = axis === 'horizontal';
        const ordered = selectedNodes.map((node) => {
            const liveNode = liveNodes.get(node.id) || node;
            return {
                id: node.id,
                position: horizontal ? node.position.x : node.position.y,
                size: Number.parseFloat(horizontal
                    ? (liveNode.measured?.width || liveNode.width || liveNode.style?.width)
                    : (liveNode.measured?.height || liveNode.height || liveNode.style?.height)) || 0,
            };
        }).sort((first, second) => first.position - second.position);
        const first = ordered[0];
        const last = ordered[ordered.length - 1];
        const availableSpan = last.position + last.size - first.position;
        const occupiedSpace = ordered.reduce((total, node) => total + node.size, 0);
        const gap = (availableSpan - occupiedSpace) / (ordered.length - 1);
        const positions = new Map();
        let cursor = first.position;
        ordered.forEach((node) => {
            positions.set(node.id, cursor);
            cursor += node.size + gap;
        });

        remember();
        setNodes((items) => items.map((node) => {
            if (!positions.has(node.id)) return node;
            return {
                ...node,
                position: {
                    ...node.position,
                    ...(horizontal ? { x: positions.get(node.id) } : { y: positions.get(node.id) }),
                },
            };
        }));
    }, [selectedNodes, flow, remember, setNodes]);

    useEffect(() => {
        const onKeyDown = (event) => {
            const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
            if ((event.key === 'Delete' || event.key === 'Backspace') && !typing) deleteSelection();
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) { event.preventDefault(); undo(); }
            if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) { event.preventDefault(); redo(); }
            if ((event.ctrlKey || event.metaKey) && selectedNodeId && (event.key === '[' || event.key === ']')) {
                event.preventDefault();
                moveLayer(selectedNodeId, event.shiftKey ? (event.key === ']' ? 'front' : 'back') : (event.key === ']' ? 'forward' : 'backward'));
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [deleteSelection, undo, redo, selectedNodeId, moveLayer]);

    const uploadAsset = async (file, targetNodeId = null) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { window.alert('Please choose a file smaller than 5 MB.'); return; }
        setUploading(true);
        try {
            const form = new FormData();
            form.append('asset', file);
            const response = await fetch(route('diagram-assets.store'), { method: 'POST', headers: withCsrf({ Accept: 'application/json' }), body: form });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Upload failed.');
            if (targetNodeId) updateNode(targetNodeId, { imageUrl: result.url, mediaType: result.type, icon: 'none' });
            else {
                const dimensions = await new Promise((resolve) => {
                    const image = new Image();
                    image.onload = () => resolve({ width: image.naturalWidth || 360, height: image.naturalHeight || 240 });
                    image.onerror = () => resolve({ width: 360, height: 240 });
                    image.src = result.url;
                });
                const scale = Math.min(1, 420 / dimensions.width, 300 / dimensions.height);
                addNodeFromSidebar('image', {
                    kind: 'image', label: result.name || file.name || 'Page image', imageUrl: result.url,
                    imageFit: 'contain', mediaType: result.type, hideBorder: true,
                    style: { width: Math.max(60, Math.round(dimensions.width * scale)), height: Math.max(60, Math.round(dimensions.height * scale)) },
                });
            }
        } catch (error) {
            window.alert(error.message || 'The file could not be uploaded.');
        } finally {
            setUploading(false);
        }
    };
    const uploadPageBackground = async (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { window.alert('Please choose a file smaller than 5 MB.'); return; }
        setUploading(true);
        try {
            const form = new FormData(); form.append('asset', file);
            const response = await fetch(route('diagram-assets.store'), { method: 'POST', headers: withCsrf({ Accept: 'application/json' }), body: form });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Import failed.');
            updatePageBackground({ backgroundImage: result.url, backgroundName: result.name || file.name, backgroundType: result.type, backgroundFit: 'cover' });
        } catch (error) {
            window.alert(error.message || 'The page image could not be imported.');
        } finally {
            setUploading(false);
        }
    };

    const saveDiagram = async () => {
        setSaving(true);
        try {
            rememberPageViewport(activePage, flow.getViewport());
            const savedPages = pages.map((page) => {
                const viewport = pageViewports.current.get(page.id);
                return viewport ? { ...page, viewport } : page;
            });
            const cleanFilename = filename.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'workflow';
            const input = { title: title.trim() || 'Untitled workflow', filename: cleanFilename, nodes, edges, pages: savedPages };
            const operation = diagram
                ? `mutation UpdateDiagram($id: ID!, $input: DiagramInput!) { updateDiagram(id: $id, input: $input) { id } }`
                : `mutation CreateDiagram($input: DiagramInput!) { createDiagram(input: $input) { id } }`;
            const result = await graphqlRequest(operation, diagram ? { id: diagram.id, input } : { input });
            const savedDiagram = diagram ? result.updateDiagram : result.createDiagram;
            localStorage.setItem(draftStorageKey, JSON.stringify({ title, filename: cleanFilename, nodes, edges, pages: savedPages }));
            setFilename(cleanFilename);
            setSaved(true);
            if (!diagram && savedDiagram?.id) window.location.assign(route('diagrams.edit', savedDiagram.id));
        } catch (error) {
            window.alert(error.message || 'The diagram could not be saved.');
        } finally {
            setSaving(false);
        }
    };
    const exportDiagram = async (format, pageIds = []) => {
        rememberPageViewport(activePage, flow.getViewport());
        setExporting(true);
        const originalPageId = activePageId;
        const pdfVectorLayouts = new Map();
        const svgSourceCache = new Map();
        const safeName = (filename || title || 'workflow').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/(^-|-$)/g, '') || 'workflow';
        const loadSvgSource = async (url) => {
            if (!svgSourceCache.has(url)) {
                svgSourceCache.set(url, (async () => {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Could not load SVG (${response.status}).`);
                    const source = await response.text();
                    const documentNode = new DOMParser().parseFromString(source, 'image/svg+xml');
                    if (documentNode.querySelector('parsererror') || documentNode.documentElement?.tagName?.toLowerCase() !== 'svg') {
                        throw new Error('The uploaded SVG is not valid.');
                    }
                    return source;
                })());
            }
            return svgSourceCache.get(url);
        };
        const waitForPage = async (page) => {
            for (let attempt = 0; attempt < 15; attempt += 1) {
                await new Promise((resolve) => requestAnimationFrame(resolve));
                const nodeElements = [...(wrapperRef.current?.querySelectorAll('.react-flow__node') || [])];
                const renderedNodeIds = new Set(nodeElements.map((element) => element.getAttribute('data-id')));
                const renderedEdges = wrapperRef.current?.querySelectorAll('.react-flow__edge').length || 0;
                if (page.nodes.every((node) => renderedNodeIds.has(node.id)) && renderedEdges >= page.edges.length) {
                    await new Promise((resolve) => requestAnimationFrame(resolve));
                    return;
                }
            }
        };
        const download = (blob, name) => {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url; anchor.download = name; anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1500);
        };
        const capturePage = async (page, targetFormat) => {
            const viewportElement = wrapperRef.current?.querySelector('.react-flow__viewport');
            if (!viewportElement) throw new Error('Canvas is not ready.');
            const width = page.width || DEFAULT_PAGE_SIZE.width;
            const height = page.height || DEFAULT_PAGE_SIZE.height;
            const pageNodeIds = new Set(page.nodes.map((node) => node.id));
            const renderedNodes = flow.getNodes().filter((node) => pageNodeIds.has(node.id));
            const viewport = pageViewports.current.get(page.id) || (() => {
                rememberPageViewport(page, flow.getViewport());
                return pageViewports.current.get(page.id);
            })() || { x: 0, y: 0, zoom: 1 };
            if (document.fonts?.ready) await document.fonts.ready;
            let fontEmbedCSS = '';
            try {
                const [staticFonts, variableFonts] = await Promise.all([
                    getFontEmbedCSS(viewportElement, { preferredFontFormat: 'woff2' }),
                    getFontEmbedCSS(viewportElement, { preferredFontFormat: 'woff2-variations' }),
                ]);
                fontEmbedCSS = `${staticFonts}\n${variableFonts}`;
            } catch (error) {
                console.warn('Export font embedding could not be completed; loaded fonts will still be rendered.', error);
            }
            const vectorItems = [];
            if (targetFormat === 'pdf') {
                const renderedById = new Map(renderedNodes.map((node) => [node.id, node]));
                const candidates = page.nodes.filter((node) => (node.data?.kind === 'image' || node.data?.shape === 'image')
                    && node.data?.imageUrl && isSvgAsset(node.data.imageUrl, node.data.mediaType));
                for (const storedNode of candidates) {
                    try {
                        vectorItems.push({
                            node: renderedById.get(storedNode.id) || storedNode,
                            source: await loadSvgSource(storedNode.data.imageUrl),
                            layerIndex: page.nodes.findIndex((node) => node.id === storedNode.id),
                            overlay: null,
                        });
                    } catch (error) {
                        console.warn(`SVG ${storedNode.id} will use the raster fallback.`, error);
                    }
                }
                pdfVectorLayouts.set(page.id, { viewport, items: vectorItems });
            }
            const vectorNodeIds = new Set(vectorItems.map(({ node }) => node.id));
            const captureOptions = {
                width, height, pixelRatio: 1,
                fontEmbedCSS,
                style: { width: `${width}px`, height: `${height}px`, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` },
                filter: (element) => {
                    if (element?.classList?.contains('react-flow__resize-control') || element?.classList?.contains('workflow-handle')) return false;
                    if (targetFormat === 'pdf' && element?.classList?.contains('workflow-node__page-image')) {
                        const nodeId = element.closest?.('.react-flow__node')?.getAttribute('data-id');
                        if (vectorNodeIds.has(nodeId)) return false;
                    }
                    return true;
                },
            };
            const animatedPaths = [...wrapperRef.current.querySelectorAll('.animated-flow-edge')];
            const originalStyles = animatedPaths.map((path) => ({ animation: path.style.animation, strokeDashoffset: path.style.strokeDashoffset }));
            const selectionVisuals = [...wrapperRef.current.querySelectorAll('.workflow-node.is-selected, .react-flow__node.selected, .react-flow__edge.selected')];
            const selectionClasses = selectionVisuals.map((element) => element.classList.contains('is-selected') ? 'is-selected' : 'selected');
            selectionVisuals.forEach((element, index) => element.classList.remove(selectionClasses[index]));
            const borderlessNodes = [...wrapperRef.current.querySelectorAll('.workflow-node.has-hidden-border')];
            const borderlessStyles = borderlessNodes.map((element) => ({ borderColor: element.style.borderColor }));
            borderlessNodes.forEach((element) => { element.style.borderColor = 'transparent'; });
            const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
                const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob);
            });
            let backgroundImage = null;
            let backgroundDataUrl = null;
            if (page.backgroundImage) {
                const backgroundBlob = await (await fetch(page.backgroundImage)).blob();
                backgroundDataUrl = await blobToDataUrl(backgroundBlob);
                backgroundImage = await new Promise((resolve, reject) => {
                    const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = backgroundDataUrl;
                });
            }
            const composePage = (contentCanvas) => {
                const output = document.createElement('canvas'); output.width = width; output.height = height;
                const context = output.getContext('2d'); context.fillStyle = '#ffffff'; context.fillRect(0, 0, width, height);
                if (backgroundImage) {
                    if ((page.backgroundFit || 'cover') === 'fill') context.drawImage(backgroundImage, 0, 0, width, height);
                    else {
                        const scale = (page.backgroundFit || 'cover') === 'contain'
                            ? Math.min(width / backgroundImage.naturalWidth, height / backgroundImage.naturalHeight)
                            : Math.max(width / backgroundImage.naturalWidth, height / backgroundImage.naturalHeight);
                        const drawWidth = backgroundImage.naturalWidth * scale; const drawHeight = backgroundImage.naturalHeight * scale;
                        context.drawImage(backgroundImage, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
                    }
                }
                drawPaperPattern(context, page.paperStyle, width, height);
                if (page.showTopBox) drawTopBox(context, width);
                context.drawImage(contentCanvas, 0, 0, width, height);
                return output;
            };
            try {
                if (targetFormat === 'svg') {
                    const contentUrl = await toSvg(viewportElement, captureOptions);
                    const contentDataUrl = await blobToDataUrl(await (await fetch(contentUrl)).blob());
                    const fit = page.backgroundFit === 'fill' ? 'none' : page.backgroundFit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice';
                    const background = backgroundDataUrl ? `<image href="${backgroundDataUrl}" width="${width}" height="${height}" preserveAspectRatio="${fit}"/>` : '';
                    const paper = paperPatternSvg(page.paperStyle, width, height);
                    const topBox = page.showTopBox ? topBoxSvg(width) : '';
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#fff"/>${background}${paper}${topBox}<image href="${contentDataUrl}" width="${width}" height="${height}"/></svg>`;
                    return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                }
                if ((targetFormat === 'gif' || targetFormat === 'webp') && animatedPaths.length) {
                    const delay = 80;
                    const frames = [];
                    for (let frame = 0; frame < 12; frame += 1) {
                        animatedPaths.forEach((path) => { path.style.animation = 'none'; path.style.strokeDashoffset = `${-(frame * 3)}px`; });
                        await new Promise((resolve) => requestAnimationFrame(resolve));
                        frames.push(composePage(await toCanvas(viewportElement, captureOptions)));
                    }
                    if (targetFormat === 'gif') {
                        const gif = GIFEncoder();
                        frames.forEach((canvas) => {
                            const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                            const palette = quantize(image.data, 256);
                            gif.writeFrame(applyPalette(image.data, palette), canvas.width, canvas.height, { palette, delay, repeat: 0 });
                        });
                        gif.finish();
                        return new Blob([gif.bytes()], { type: 'image/gif' });
                    }
                    const webpFrames = await Promise.all(frames.map((canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92))));
                    return createAnimatedWebp(webpFrames, width, height, delay);
                }
                const canvas = composePage(await toCanvas(viewportElement, captureOptions));
                if (targetFormat === 'gif') {
                    const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                    const palette = quantize(image.data, 256);
                    const gif = GIFEncoder(); gif.writeFrame(applyPalette(image.data, palette), canvas.width, canvas.height, { palette }); gif.finish();
                    return new Blob([gif.bytes()], { type: 'image/gif' });
                }
                const rasterFormat = targetFormat === 'pdf' ? 'png' : targetFormat;
                const mime = rasterFormat === 'jpeg' ? 'image/jpeg' : `image/${rasterFormat}`;
                if (targetFormat === 'pdf' && vectorItems.length) {
                    for (let index = 0; index < vectorItems.length; index += 1) {
                        const vectorItem = vectorItems[index];
                        const nextVectorIndex = vectorItems[index + 1]?.layerIndex ?? page.nodes.length;
                        const overlayNodeIds = new Set(page.nodes
                            .slice(vectorItem.layerIndex + 1, nextVectorIndex)
                            .filter((node) => !vectorNodeIds.has(node.id))
                            .map((node) => node.id));
                        if (!overlayNodeIds.size) continue;
                        const overlayCanvas = await toCanvas(viewportElement, {
                            ...captureOptions,
                            filter: (element) => {
                                if (element?.classList?.contains('react-flow__resize-control') || element?.classList?.contains('workflow-handle')) return false;
                                if (element?.classList?.contains('react-flow__edges')) return false;
                                if (element?.classList?.contains('react-flow__node')) return overlayNodeIds.has(element.getAttribute('data-id'));
                                return true;
                            },
                        });
                        vectorItem.overlay = await new Promise((resolve) => overlayCanvas.toBlob(resolve, 'image/png'));
                    }
                }
                return await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.94));
            } finally {
                selectionVisuals.forEach((element, index) => element.classList.add(selectionClasses[index]));
                borderlessNodes.forEach((element, index) => { element.style.borderColor = borderlessStyles[index].borderColor; });
                animatedPaths.forEach((path, index) => {
                    path.style.animation = originalStyles[index].animation;
                    path.style.strokeDashoffset = originalStyles[index].strokeDashoffset;
                });
            }
        };

        try {
            const selectedIds = new Set(pageIds);
            const targetPages = pages.filter((page) => selectedIds.has(page.id));
            if (!targetPages.length) throw new Error('Select at least one page to export.');
            const captures = [];
            for (const page of targetPages) {
                setActivePageId(page.id);
                await waitForPage(page);
                captures.push({ page, blob: await capturePage(page, format) });
            }
            if (format === 'pdf') {
                const first = captures[0].page;
                const pdf = new jsPDF({ orientation: first.width >= first.height ? 'landscape' : 'portrait', unit: 'px', format: [first.width, first.height], hotfixes: ['px_scaling'] });
                for (let index = 0; index < captures.length; index += 1) {
                    const { page, blob } = captures[index];
                    if (index) pdf.addPage([page.width, page.height], page.width >= page.height ? 'landscape' : 'portrait');
                    const dataUrl = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                    const vectorLayout = pdfVectorLayouts.get(page.id);
                    for (const { node, source, overlay } of vectorLayout?.items || []) {
                        const documentNode = new DOMParser().parseFromString(source, 'image/svg+xml');
                        const svgElement = documentNode.documentElement;
                        const fit = node.data?.imageFit || 'contain';
                        svgElement.setAttribute('preserveAspectRatio', fit === 'fill' ? 'none' : fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet');
                        const position = node.positionAbsolute || node.position || { x: 0, y: 0 };
                        const nodeWidth = node.measured?.width || node.width || Number(node.style?.width) || 320;
                        const nodeHeight = node.measured?.height || node.height || Number(node.style?.height) || 200;
                        const borderInset = 2;
                        const x = vectorLayout.viewport.x + (position.x + borderInset) * vectorLayout.viewport.zoom;
                        const y = vectorLayout.viewport.y + (position.y + borderInset) * vectorLayout.viewport.zoom;
                        const vectorWidth = Math.max(1, nodeWidth - borderInset * 2) * vectorLayout.viewport.zoom;
                        const vectorHeight = Math.max(1, nodeHeight - borderInset * 2) * vectorLayout.viewport.zoom;
                        await pdf.svg(svgElement, {
                            x: x * (pdfWidth / page.width),
                            y: y * (pdfHeight / page.height),
                            width: vectorWidth * (pdfWidth / page.width),
                            height: vectorHeight * (pdfHeight / page.height),
                            loadExternalStyleSheets: false,
                            loadImages: true,
                        });
                        if (overlay) {
                            const overlayDataUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(overlay);
                            });
                            pdf.addImage(overlayDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                        }
                    }
                }
                pdf.save(`${safeName}.pdf`);
            } else if (captures.length === 1) {
                download(captures[0].blob, `${safeName}.${format === 'jpeg' ? 'jpg' : format}`);
            } else {
                const zip = new JSZip();
                const extension = format === 'jpeg' ? 'jpg' : format;
                captures.forEach(({ page, blob }, index) => {
                    const pageName = page.name.toLowerCase().replace(/[^a-z0-9-_]+/g, '-') || `page-${index + 1}`;
                    zip.file(`${String(index + 1).padStart(2, '0')}-${pageName}.${extension}`, blob);
                });
                download(await zip.generateAsync({ type: 'blob' }), `${safeName}-${extension}-pages.zip`);
            }
        } catch (error) {
            console.error('Export failed', error);
            window.alert('The export could not be created. Please try again.');
        } finally {
            setActivePageId(originalPageId);
            setExporting(false);
        }
    };

    return (
        <ACTIONS.Provider value={useMemo(() => ({ updateNode, beginResize, endResize }), [updateNode, beginResize, endResize])}>
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
                        <ExportMenu onExport={exportDiagram} exporting={exporting} filename={filename} onFilenameChange={(value) => { setFilename(value); setSaved(false); }} pages={pages} />
                        <Link href={route('logout')} method="post" as="button" className="editor-logout" title="Log out"><LogOut size={16} /><span>Log out</span></Link>
                    </div>
                </header>
                <div className="editor-body">
                    <Sidebar
                        onAddNode={addNodeFromSidebar} onUpload={uploadAsset} uploading={uploading}
                        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} nodes={nodes}
                        selectedNodeId={selectedNodeId} onSelectNode={selectSingleNode}
                        onMoveLayer={moveLayer} onReorderLayer={reorderLayer}
                    />
                    <main className={`canvas-shell ${canvasExpanded ? 'is-expanded' : ''}`} ref={wrapperRef}>
                        <PageControls
                            page={activePage} elementCount={nodes.length} onResize={resizePage}
                            onAddImage={uploadAsset} onImportBackground={uploadPageBackground} importing={uploading}
                            onBackgroundFit={(backgroundFit) => updatePageBackground({ backgroundFit })}
                            onRemoveBackground={() => updatePageBackground({ backgroundImage: null, backgroundName: null, backgroundType: null })}
                            onPaperStyle={(paperStyle) => updatePageBackground({ paperStyle })}
                            onTopBox={(showTopBox) => updatePageBackground({ showTopBox })}
                            expanded={canvasExpanded} onToggleExpanded={toggleCanvasExpanded}
                        />
                        <ArtboardFrame page={activePage}><ReactFlow
                            key={activePage.id}
                            nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                            onNodesChange={(changes) => setNodes((items) => applyNodeChanges(changes, items))}
                            onEdgesChange={(changes) => setEdges((items) => applyEdgeChanges(changes, items))}
                            onNodeDragStart={() => { dragStart.current = snapshot(); }}
                            onNodeDragStop={() => { if (dragStart.current) { setHistory((items) => [...items.slice(-39), dragStart.current]); setFuture([]); setSaved(false); dragStart.current = null; } }}
                            onConnect={onConnect}
                            onSelectionChange={({ nodes: selectionNodes, edges: selectionEdges }) => {
                                setSelectedNodeId(selectionNodes.length === 1 ? selectionNodes[0].id : null);
                                setSelectedEdgeId(!selectionNodes.length && selectionEdges.length === 1 ? selectionEdges[0].id : null);
                            }}
                            onInit={(instance) => {
                                const viewport = pageViewports.current.get(activePage.id);
                                if (viewport) requestAnimationFrame(() => restorePageViewport(activePage, viewport, instance));
                            }}
                            onMoveEnd={(_, viewport) => rememberPageViewport(activePage, viewport)}
                            onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                            connectionMode={ConnectionMode.Loose} connectionLineStyle={{ stroke: '#6d5dfc', strokeWidth: 2.5, strokeDasharray: '8 7' }}
                            minZoom={0.25} maxZoom={2.5} fitView={!pageViewports.current.has(activePage.id)} fitViewOptions={{ padding: 0.24, maxZoom: 1.05 }} proOptions={{ hideAttribution: true }} elevateNodesOnSelect={false}
                            multiSelectionKeyCode={['Shift', 'Control', 'Meta']}
                        >
                            {(activePage.paperStyle || 'plain') === 'plain' && <Background color="#d8d8dd" gap={22} size={1.1} />}<Controls position="bottom-left" showInteractive={false} />
                            <MiniMap position="bottom-right" pannable zoomable nodeColor={(node) => node.data.color.value} maskColor="rgba(247,247,248,.78)" />
                            <Panel position="top-center" className="canvas-toolbar">
                                <ToolButton icon={MousePointer2} label="Select" active /><ToolButton icon={Type} label="Add rich text" onClick={() => addNodeFromSidebar('text', { label: 'Start typing' })} />
                                <ToolButton icon={MessageSquareText} label="Add note" onClick={() => addNodeFromSidebar('document', { label: 'Add a note' })} /><span className="toolbar-divider" />
                                <ToolButton icon={Grid2X2} label="Fit view" onClick={() => flow.fitView({ padding: 0.25, duration: 300 })} />
                            </Panel>
                        </ReactFlow></ArtboardFrame>
                        {selectedNodes.length > 1
                            ? <AlignmentPanel count={selectedNodes.length} onAlign={alignSelectedNodes} onDistribute={distributeSelectedNodes} onClose={clearSelection} />
                            : <PropertiesPanel selectedNode={selectedNode} selectedEdge={selectedEdge} onUpdateNode={updateNode} onUpdateEdge={updateEdge} onUpload={uploadAsset} uploading={uploading} onMoveLayer={moveLayer} onDelete={deleteSelection} onClose={clearSelection} />}
                        <PagesBar pages={pages} activePageId={activePageId} onSelect={selectPage} onAdd={addPage} onDuplicate={duplicatePage} onRename={renamePage} onDelete={deletePage} />
                    </main>
                </div>
            </div>
        </ACTIONS.Provider>
    );
}

export default function DiagramEditor({ diagram = null }) {
    return <ReactFlowProvider><EditorCanvas diagram={diagram} /></ReactFlowProvider>;
}
