<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Present;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /** GET /api/me — профиль (доступен и заблокированному пользователю). */
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => Present::user($request->user())]);
    }
}
