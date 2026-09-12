<?php

namespace App\Services;

use App\Models\Diagram;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DiagramService
{
    public function listFor(User $user): Collection
    {
        return Diagram::query()
            ->whereNotNull('user_id')
            ->when(! $user->isAdmin(), fn ($query) => $query->where('user_id', $user->id))
            ->with('user:id,name,email,role')
            ->latest('updated_at')
            ->get();
    }

    public function findFor(User $user, int $id): Diagram
    {
        return Diagram::query()
            ->whereNotNull('user_id')
            ->when(! $user->isAdmin(), fn ($query) => $query->where('user_id', $user->id))
            ->with('user:id,name,email,role')
            ->findOrFail($id);
    }

    public function createFor(User $user, array $data): Diagram
    {
        return $user->diagrams()->create($data)->load('user:id,name,email,role');
    }

    public function updateFor(User $user, int|Diagram $diagram, array $data): Diagram
    {
        $diagram = $this->findFor($user, $diagram instanceof Diagram ? (int) $diagram->getKey() : $diagram);
        $diagram->update($data);

        return $diagram->fresh()->load('user:id,name,email,role');
    }

    public function deleteFor(User $user, int|Diagram $diagram): void
    {
        $diagram = $this->findFor($user, $diagram instanceof Diagram ? (int) $diagram->getKey() : $diagram);
        $diagram->delete();
    }

    public function listUnassigned(): Collection
    {
        return Diagram::query()
            ->whereNull('user_id')
            ->orderBy('id')
            ->get();
    }

    public function assignOwner(Diagram $diagram, User $user): Diagram
    {
        $diagram->update(['user_id' => $user->id]);

        return $diagram->fresh()->load('user:id,name,email,role');
    }

    public function payload(Diagram $diagram): array
    {
        $pages = $diagram->pages;

        return [
            'id' => (string) $diagram->id,
            'title' => $diagram->title,
            'filename' => $diagram->filename,
            'nodes' => $diagram->nodes ?? [],
            'edges' => $diagram->edges ?? [],
            'pages' => $pages,
            'node_count' => $pages
                ? collect($pages)->sum(fn ($page) => count($page['nodes'] ?? []))
                : count($diagram->nodes ?? []),
            'edge_count' => $pages
                ? collect($pages)->sum(fn ($page) => count($page['edges'] ?? []))
                : count($diagram->edges ?? []),
            'owner' => $diagram->user ? [
                'id' => (string) $diagram->user->id,
                'name' => $diagram->user->name,
                'email' => $diagram->user->email,
                'role' => $diagram->user->role?->value ?? 'user',
            ] : null,
            'created_at' => $diagram->created_at?->toIso8601String(),
            'updated_at' => $diagram->updated_at?->toIso8601String(),
        ];
    }

    public static function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'filename' => ['required', 'string', 'max:120'],
            'nodes' => ['present', 'array'],
            'edges' => ['present', 'array'],
            'pages' => ['nullable', 'array', 'min:1'],
            'pages.*.id' => ['required_with:pages', 'string', 'max:80'],
            'pages.*.name' => ['required_with:pages', 'string', 'max:80'],
            'pages.*.width' => ['required_with:pages', 'integer', 'min:320', 'max:4000'],
            'pages.*.height' => ['required_with:pages', 'integer', 'min:240', 'max:4000'],
            'pages.*.nodes' => ['present_with:pages', 'array'],
            'pages.*.edges' => ['present_with:pages', 'array'],
            'pages.*.backgroundImage' => ['nullable', 'string', 'max:2048'],
            'pages.*.backgroundName' => ['nullable', 'string', 'max:160'],
            'pages.*.backgroundType' => ['nullable', 'string', 'max:12'],
            'pages.*.backgroundFit' => ['nullable', 'in:cover,contain,fill'],
            'pages.*.paperStyle' => ['nullable', 'in:plain,narrow-lines,wide-lines,four-lines,boxes,graph-dots'],
            'pages.*.showTopBox' => ['nullable', 'boolean'],
            'pages.*.printGuides' => ['nullable', 'array'],
            'pages.*.printGuides.enabled' => ['nullable', 'boolean'],
            'pages.*.printGuides.visible' => ['nullable', 'boolean'],
            'pages.*.printGuides.unit' => ['nullable', 'in:in'],
            'pages.*.printGuides.margins' => ['nullable', 'array'],
            'pages.*.printGuides.margins.left' => ['nullable', 'numeric', 'min:0', 'max:4000'],
            'pages.*.printGuides.margins.right' => ['nullable', 'numeric', 'min:0', 'max:4000'],
            'pages.*.printGuides.margins.top' => ['nullable', 'numeric', 'min:0', 'max:4000'],
            'pages.*.printGuides.margins.bottom' => ['nullable', 'numeric', 'min:0', 'max:4000'],
            'pages.*.printGuides.vertical' => ['nullable', 'array'],
            'pages.*.printGuides.vertical.*.x' => ['required', 'numeric', 'min:0', 'max:4000'],
            'pages.*.printGuides.vertical.*.label' => ['nullable', 'string', 'max:80'],
            'pages.*.printGuides.vertical.*.tone' => ['nullable', 'in:safe,trim,spine,bleed,margin'],
            'pages.*.printGuides.horizontal' => ['nullable', 'array'],
            'pages.*.printGuides.horizontal.*.y' => ['required', 'numeric', 'min:0', 'max:4000'],
            'pages.*.printGuides.horizontal.*.label' => ['nullable', 'string', 'max:80'],
            'pages.*.printGuides.horizontal.*.tone' => ['nullable', 'in:safe,trim,spine,bleed,margin'],
            'pages.*.viewport' => ['nullable', 'array:x,y,zoom'],
            'pages.*.viewport.x' => ['required_with:pages.*.viewport', 'numeric'],
            'pages.*.viewport.y' => ['required_with:pages.*.viewport', 'numeric'],
            'pages.*.viewport.zoom' => ['required_with:pages.*.viewport', 'numeric', 'min:0.01', 'max:10'],
        ];
    }
}
