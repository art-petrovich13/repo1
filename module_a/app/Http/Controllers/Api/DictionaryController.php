<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Club;
use Illuminate\Http\JsonResponse;

class DictionaryController extends Controller
{
    /** GET /api/clubs */
    public function clubs(): JsonResponse
    {
        $clubs = Club::withCount(['events as published_events_count' => fn ($q) => $q->where('status', 'published')])
            ->orderBy('name')
            ->get()
            ->map(fn (Club $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'description' => $c->description,
                'published_events_count' => $c->published_events_count,
            ]);

        return response()->json(['data' => $clubs]);
    }

    /** GET /api/categories */
    public function categories(): JsonResponse
    {
        $categories = Category::orderBy('id')->get(['id', 'name', 'slug']);

        return response()->json(['data' => $categories]);
    }
}
