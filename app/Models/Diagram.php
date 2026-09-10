<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diagram extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'filename', 'nodes', 'edges'];

    protected function casts(): array
    {
        return [
            'nodes' => 'array',
            'edges' => 'array',
        ];
    }
}
