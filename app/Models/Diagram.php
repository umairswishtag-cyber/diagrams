<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diagram extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'filename', 'nodes', 'edges', 'pages'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'nodes' => 'array',
            'edges' => 'array',
            'pages' => 'array',
        ];
    }
}
