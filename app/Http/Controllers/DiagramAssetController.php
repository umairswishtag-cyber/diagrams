<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DiagramAssetController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'asset' => ['required', 'file', 'max:5120', 'mimes:svg,png,jpg,jpeg,webp,gif'],
        ]);

        $file = $request->file('asset');
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::uuid() . '.' . $extension;
        $directory = public_path('uploads/diagram-assets');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        if ($extension === 'svg') {
            $svg = file_get_contents($file->getRealPath());
            $unsafe = preg_match('/<!DOCTYPE|<!ENTITY|<\s*(script|foreignObject|iframe|object|embed)\b|on\w+\s*=|(?:href|src)\s*=\s*["\']\s*(?:javascript|data):/i', $svg);
            if ($unsafe) {
                throw ValidationException::withMessages(['asset' => 'The SVG contains unsafe or executable content.']);
            }
            file_put_contents($directory . DIRECTORY_SEPARATOR . $filename, $svg);
        } else {
            $file->move($directory, $filename);
        }

        return response()->json([
            'url' => asset('uploads/diagram-assets/' . $filename),
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'type' => $extension,
        ], 201);
    }
}
