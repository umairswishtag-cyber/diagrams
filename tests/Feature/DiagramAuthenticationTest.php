<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Diagram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagramAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_must_login_to_open_the_workspace_or_graphql_api(): void
    {
        $this->get('/')->assertRedirect(route('login'));
        $this->get('/dashboard')->assertRedirect(route('login'));
        $this->get('/diagrams/create')->assertRedirect(route('login'));
        $this->postJson('/graphql', ['query' => '{ diagrams { id } }'])->assertUnauthorized();
        $this->postJson('/diagram-assets', [])->assertUnauthorized();
    }

    public function test_graphql_create_assigns_the_authenticated_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/graphql', [
            'query' => <<<'GRAPHQL'
                mutation CreateDiagram($input: DiagramInput!) {
                    createDiagram(input: $input) { id title owner { id role } }
                }
                GRAPHQL,
            'variables' => ['input' => $this->diagramInput('Private workflow')],
        ]);

        $response->assertOk()->assertJsonPath('data.createDiagram.title', 'Private workflow');
        $this->assertDatabaseHas('diagrams', [
            'id' => $response->json('data.createDiagram.id'),
            'user_id' => $user->id,
        ]);
    }

    public function test_graphql_accepts_pages_without_nodes_or_edges(): void
    {
        $user = User::factory()->create();
        $input = $this->diagramInput('Empty page');
        $input['pages'] = [[
            'id' => 'page-1',
            'name' => 'Page 1',
            'width' => 1200,
            'height' => 760,
            'nodes' => [],
            'edges' => [],
        ]];

        $response = $this->actingAs($user)->postJson('/graphql', [
            'query' => <<<'GRAPHQL'
                mutation CreateDiagram($input: DiagramInput!) {
                    createDiagram(input: $input) { id pages }
                }
                GRAPHQL,
            'variables' => ['input' => $input],
        ]);

        $response->assertOk()
            ->assertJsonMissingPath('errors')
            ->assertJsonPath('data.createDiagram.pages.0.nodes', [])
            ->assertJsonPath('data.createDiagram.pages.0.edges', []);
    }

    public function test_users_only_receive_their_own_assigned_diagrams(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->diagrams()->create($this->diagramInput('My workflow'));
        $otherDiagram = $otherUser->diagrams()->create($this->diagramInput('Hidden workflow'));
        Diagram::query()->create($this->diagramInput('Unowned legacy workflow'));

        $response = $this->actingAs($user)->postJson('/graphql', [
            'query' => '{ diagrams { id title } }',
        ]);

        $response->assertOk()
            ->assertJsonCount(1, 'data.diagrams')
            ->assertJsonPath('data.diagrams.0.title', 'My workflow');

        $this->actingAs($user)->get("/diagrams/{$otherDiagram->id}/edit")->assertNotFound();
        $this->actingAs($user)->postJson('/graphql', [
            'query' => 'query Diagram($id: ID!) { diagram(id: $id) { id } }',
            'variables' => ['id' => $otherDiagram->id],
        ])->assertOk()->assertJsonStructure(['errors']);
    }

    public function test_admins_can_manage_all_assigned_diagrams_but_not_unowned_legacy_rows(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();
        $first = $firstUser->diagrams()->create($this->diagramInput('First account'));
        $secondUser->diagrams()->create($this->diagramInput('Second account'));
        Diagram::query()->create($this->diagramInput('Unowned legacy workflow'));

        $response = $this->actingAs($admin)->postJson('/graphql', [
            'query' => '{ diagrams { id title owner { id email role } } }',
        ]);

        $response->assertOk()->assertJsonCount(2, 'data.diagrams');
        $this->actingAs($admin)->get("/diagrams/{$first->id}/edit")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('diagramId', (string) $first->id));
    }

    public function test_graphql_update_and_delete_enforce_the_same_role_aware_service(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $diagram = $owner->diagrams()->create($this->diagramInput('Owner only'));

        $this->actingAs($otherUser)->postJson('/graphql', [
            'query' => 'mutation DeleteDiagram($id: ID!) { deleteDiagram(id: $id) }',
            'variables' => ['id' => $diagram->id],
        ])->assertOk()->assertJsonStructure(['errors']);
        $this->assertDatabaseHas('diagrams', ['id' => $diagram->id]);

        $this->actingAs($owner)->postJson('/graphql', [
            'query' => <<<'GRAPHQL'
                mutation UpdateDiagram($id: ID!, $input: DiagramInput!) {
                    updateDiagram(id: $id, input: $input) { id title }
                }
                GRAPHQL,
            'variables' => [
                'id' => $diagram->id,
                'input' => $this->diagramInput('Updated by owner'),
            ],
        ])->assertOk()->assertJsonPath('data.updateDiagram.title', 'Updated by owner');

        $this->actingAs($owner)->postJson('/graphql', [
            'query' => 'mutation DeleteDiagram($id: ID!) { deleteDiagram(id: $id) }',
            'variables' => ['id' => $diagram->id],
        ])->assertOk()->assertJsonPath('data.deleteDiagram', true);
        $this->assertDatabaseMissing('diagrams', ['id' => $diagram->id]);
    }

    public function test_an_existing_account_role_can_be_changed_with_the_admin_command(): void
    {
        $user = User::factory()->create();

        $this->artisan('user:set-role', ['email' => $user->email, 'role' => 'admin'])
            ->assertSuccessful();

        $this->assertSame(UserRole::Admin, $user->fresh()->role);
    }

    public function test_a_legacy_diagram_can_be_assigned_to_the_correct_account(): void
    {
        $user = User::factory()->create();
        $diagram = Diagram::query()->create($this->diagramInput('Legacy workflow'));

        $this->artisan('diagram:assign-owner', ['diagram' => $diagram->id, 'email' => $user->email])
            ->assertSuccessful();

        $this->assertSame($user->id, $diagram->fresh()->user_id);
    }

    private function diagramInput(string $title): array
    {
        return [
            'title' => $title,
            'filename' => str($title)->slug()->toString(),
            'nodes' => [],
            'edges' => [],
            'pages' => null,
        ];
    }
}
