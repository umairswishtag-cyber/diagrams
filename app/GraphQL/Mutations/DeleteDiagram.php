<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Services\DiagramService;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final readonly class DeleteDiagram
{
    public function __construct(private DiagramService $diagrams) {}

    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        /** @var User $user */
        $user = $context->user();
        $this->diagrams->deleteFor($user, (int) $args['id']);

        return true;
    }
}
