<?php

namespace App\Console\Commands;

use App\Models\Diagram;
use App\Models\User;
use App\Services\DiagramService;
use Illuminate\Console\Command;

class AssignDiagramOwner extends Command
{
    protected $signature = 'diagram:assign-owner {diagram : Diagram ID} {email : Owner account email}';

    protected $description = 'Assign an existing or legacy diagram to a user account';

    public function __construct(private readonly DiagramService $diagrams)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $diagram = Diagram::query()->find($this->argument('diagram'));
        $user = User::query()->where('email', $this->argument('email'))->first();

        if (! $diagram) {
            $this->error('The diagram was not found.');

            return self::FAILURE;
        }

        if (! $user) {
            $this->error('The user account was not found.');

            return self::FAILURE;
        }

        $this->diagrams->assignOwner($diagram, $user);
        $this->info("Diagram {$diagram->id} is now owned by {$user->email}.");

        return self::SUCCESS;
    }
}
