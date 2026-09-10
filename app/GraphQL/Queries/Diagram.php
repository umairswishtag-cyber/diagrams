<?php

namespace App\GraphQL\Queries;

use App\Models\User;
use App\Services\DiagramService;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final readonly class Diagram
{
    public function __construct(private DiagramService $diagrams) {}

    public function __invoke(mixed $root, array $args, GraphQLContext $context): array
    {
        /** @var User $user */
        $user = $context->user();

        return $this->diagrams->payload($this->diagrams->findFor($user, (int) $args['id']));
    }
}
