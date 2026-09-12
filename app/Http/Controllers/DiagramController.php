<?php

namespace App\Http\Controllers;

use App\Models\Diagram;
use App\Services\DiagramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagramController extends Controller
{
    public function __construct(private readonly DiagramService $diagrams) {}

    public function index(): Response
    {
        return Inertia::render('NonEmbedded/DiagramDashboard');
    }

    public function create(): Response
    {
        return Inertia::render('NonEmbedded/DiagramEditorPage', [
            'fresh' => true,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $diagram = $this->diagrams->createFor($request->user(), $this->validated($request));

        return response()->json([
            'message' => 'Diagram created.',
            'diagram' => $diagram,
            'edit_url' => route('diagrams.edit', $diagram),
        ], 201);
    }

    public function edit(Request $request, Diagram $diagram): Response
    {
        $diagram = $this->diagrams->findFor($request->user(), (int) $diagram->id);

        return Inertia::render('NonEmbedded/DiagramEditorPage', [
            'diagramId' => (string) $diagram->id,
        ]);
    }

    public function update(Request $request, Diagram $diagram): JsonResponse
    {
        $diagram = $this->diagrams->updateFor($request->user(), $diagram, $this->validated($request));

        return response()->json([
            'message' => 'Diagram saved.',
            'diagram' => $diagram->fresh(),
        ]);
    }

    public function destroy(Request $request, Diagram $diagram): RedirectResponse
    {
        $this->diagrams->deleteFor($request->user(), $diagram);

        return redirect()->route('dashboard')->with('success', 'Diagram deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate(DiagramService::rules());
    }
}
