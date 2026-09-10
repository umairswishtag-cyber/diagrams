<?php

namespace App\Console\Commands;

use App\Models\Diagram;
use App\Services\DiagramService;
use Illuminate\Console\Command;

class ListUnassignedDiagrams extends Command
{
    protected $signature = 'diagram:list-unassigned';

    protected $description = 'List legacy diagrams that do not have an owner account';

    public function __construct(private readonly DiagramService $diagrams)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $diagrams = $this->diagrams->listUnassigned();

        $this->table(
            ['ID', 'Title', 'Filename', 'Last updated'],
            $diagrams->map(fn (Diagram $diagram) => [
                $diagram->id,
                $diagram->title,
                $diagram->filename,
                $diagram->updated_at?->toDateTimeString(),
            ])->all(),
        );

        return self::SUCCESS;
    }
}
