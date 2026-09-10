<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Validation\Rule;

class SetUserRole extends Command
{
    protected $signature = 'user:set-role {email} {role : admin or user}';

    protected $description = 'Assign an application role to an existing user';

    public function handle(): int
    {
        $data = validator([
            'email' => $this->argument('email'),
            'role' => $this->argument('role'),
        ], [
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', Rule::enum(UserRole::class)],
        ])->validate();

        $user = User::query()->where('email', $data['email'])->firstOrFail();
        $user->update(['role' => $data['role']]);
        $this->info("{$user->email} is now {$user->role->value}.");

        return self::SUCCESS;
    }
}
