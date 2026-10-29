<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Present;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/uploads (multipart/form-data): file, kind=cover|avatar.
     * Файл сохраняется в public/uploads/{kind}s — без symlink, чтобы одинаково работало на Windows.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'kind' => ['nullable', 'in:cover,avatar'],
        ]);

        $dir = ($data['kind'] ?? 'cover').'s';
        $file = $request->file('file');
        $name = now()->format('Ymd').'_'.Str::random(16).'.'.strtolower($file->getClientOriginalExtension());
        $file->move(public_path("uploads/{$dir}"), $name);

        $path = "/uploads/{$dir}/{$name}";

        return response()->json(['data' => ['path' => $path, 'url' => Present::url($path)]], 201);
    }
}
