<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Services\DiagramService;
use Illuminate\Support\Facades\Validator;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final readonly class CreateDiagram
{
    public function __construct(private DiagramService $diagrams) {}

    public function __invoke(mixed $root, array $args, GraphQLContext $context): array
    {
        /** @var User $user */
        $user = $context->user();
        $data = Validator::make($args['input'], DiagramService::rules())->validate();

        return $this->diagrams->payload($this->diagrams->createFor($user, $data));
    }
}
