<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagramController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('NonEmbedded/DiagramDashboard', [
            'diagrams' => Diagram::query()
                ->latest('updated_at')
                ->get(['id', 'title', 'filename', 'nodes', 'edges', 'created_at', 'updated_at'])
                ->map(fn (Diagram $diagram) => [
                    'id' => $diagram->id,
                    'title' => $diagram->title,
                    'filename' => $diagram->filename,
                    'node_count' => count($diagram->nodes ?? []),
                    'edge_count' => count($diagram->edges ?? []),
                    'updated_at' => $diagram->updated_at?->toIso8601String(),
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('NonEmbedded/DiagramEditorPage');
    }

    public function store(Request $request): JsonResponse
    {
        $diagram = Diagram::create($this->validated($request));

        return response()->json([
            'message' => 'Diagram created.',
            'diagram' => $diagram,
            'edit_url' => route('diagrams.edit', $diagram),
        ], 201);
    }

    public function edit(Diagram $diagram): Response
    {
        return Inertia::render('NonEmbedded/DiagramEditorPage', [
            'diagram' => $diagram->only(['id', 'title', 'filename', 'nodes', 'edges', 'updated_at']),
        ]);
    }

    public function update(Request $request, Diagram $diagram): JsonResponse
    {
        $diagram->update($this->validated($request));

        return response()->json([
            'message' => 'Diagram saved.',
            'diagram' => $diagram->fresh(),
        ]);
    }

    public function destroy(Diagram $diagram): RedirectResponse
    {
        $diagram->delete();

        return redirect()->route('dashboard')->with('success', 'Diagram deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'filename' => ['required', 'string', 'max:120'],
            'nodes' => ['present', 'array'],
            'edges' => ['present', 'array'],
        ]);
    }
}
