import DiagramEditor from '@/Components/DiagramEditor';
import { graphqlRequest } from '@/Services/graphql';
import { useEffect, useState } from 'react';

const DIAGRAM_QUERY = `
    query Diagram($id: ID!) {
        diagram(id: $id) { id title filename nodes edges pages updated_at }
    }
`;

export default function DiagramEditorPage({ diagramId = null }) {
    const [diagram, setDiagram] = useState(null);
    const [loading, setLoading] = useState(Boolean(diagramId));
    const [error, setError] = useState('');

    useEffect(() => {
        if (!diagramId) return;

        graphqlRequest(DIAGRAM_QUERY, { id: diagramId })
            .then((data) => setDiagram(data.diagram))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, [diagramId]);

    if (loading) return <div className="editor-loading">Loading diagram…</div>;
    if (error) return <div className="editor-loading editor-load-error">{error}</div>;

    return <DiagramEditor key={diagram?.id || 'new'} diagram={diagram} />;
}
