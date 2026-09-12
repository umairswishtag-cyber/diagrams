<?php

namespace App\Http\Controllers;

use App\Services\DiagramAssetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagramAssetController extends Controller
{
    public function __construct(private readonly DiagramAssetService $assets) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'asset' => ['required', 'file', 'max:30720', 'mimes:svg,png,jpg,jpeg,webp,gif'],
        ]);

        return response()->json(
            $this->assets->storeFor($request->user(), $request->file('asset')),
            201,
        );
    }
}
