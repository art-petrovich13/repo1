<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Club;
use App\Models\User;
use App\Support\Paginate;
use App\Support\Present;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Администратор: блокировка пользователей, верификация представителей,
 * управление Комьюнити и категориями. Все маршруты — /api/admin/*, middleware admin.
 */
class AdminController extends Controller
{
    /** GET /api/admin/users?q=&blocked=true */
    public function users(Request $request): JsonResponse
    {
        $query = User::with('clubs')
            ->when($request->query('q'), fn ($q, $s) => $q->where(fn ($w) => $w->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->when($request->has('blocked'), fn ($q) => $q->where('is_blocked', $request->boolean('blocked')))
            ->orderBy('id');

        return Paginate::response($query, $request, fn (User $u) => Present::user($u));
    }

    /** POST /api/admin/users/{id}/block, /unblock */
    public function block(Request $request, int $id): JsonResponse
    {
        return $this->setBlocked($request, $id, true);
    }

    public function unblock(Request $request, int $id): JsonResponse
    {
        return $this->setBlocked($request, $id, false);
    }

    /** POST /api/admin/clubs/{clubId}/representatives — {"user_id"}: выдать верификацию. */
    public function verify(Request $request, int $clubId): JsonResponse
    {
        $data = $request->validate(['user_id' => ['required', 'integer', 'exists:users,id']]);
        $club = Club::findOrFail($clubId);
        $club->members()->syncWithoutDetaching([$data['user_id'] => ['verified' => true, 'verified_at' => now()]]);

        return response()->json(['message' => 'Представитель верифицирован', 'data' => Present::user(User::find($data['user_id']))]);
    }

    /** DELETE /api/admin/clubs/{clubId}/representatives/{userId}: отозвать верификацию. */
    public function unverify(int $clubId, int $userId): JsonResponse
    {
        $club = Club::findOrFail($clubId);
        if (! $club->members()->where('users.id', $userId)->exists()) {
            throw ApiException::notFound('Пользователь не состоит в этом Комьюнити');
        }
        $club->members()->updateExistingPivot($userId, ['verified' => false, 'verified_at' => null]);

        return response()->json(['message' => 'Верификация отозвана', 'data' => Present::user(User::find($userId))]);
    }

    /** POST /api/admin/clubs, PATCH /api/admin/clubs/{id}, DELETE /api/admin/clubs/{id} */
    public function storeClub(Request $request): JsonResponse
    {
        $club = Club::create($request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]));

        return response()->json(['data' => $club], 201);
    }

    public function updateClub(Request $request, int $id): JsonResponse
    {
        $club = Club::findOrFail($id);
        $club->update($request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]));

        return response()->json(['data' => $club]);
    }

    public function destroyClub(int $id): JsonResponse
    {
        $club = Club::findOrFail($id);
        if ($club->events()->exists()) {
            throw ApiException::conflict('HAS_EVENTS', 'Нельзя удалить Комьюнити с мероприятиями');
        }
        $club->delete();

        return response()->json(['message' => 'Комьюнити удалено']);
    }

    /** POST /api/admin/categories, PATCH /api/admin/categories/{id}, DELETE /api/admin/categories/{id} */
    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100', 'unique:categories,name']]);
        $category = Category::create($data + ['slug' => Str::slug($data['name']) ?: Str::random(8)]);

        return response()->json(['data' => $category], 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->update($request->validate(['name' => ['required', 'string', 'max:100', 'unique:categories,name,'.$id]]));

        return response()->json(['data' => $category]);
    }

    public function destroyCategory(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        if ($category->events()->exists()) {
            throw ApiException::conflict('HAS_EVENTS', 'Нельзя удалить категорию, в которой есть мероприятия');
        }
        $category->delete();

        return response()->json(['message' => 'Категория удалена']);
    }

    private function setBlocked(Request $request, int $id, bool $blocked): JsonResponse
    {
        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id) {
            throw ApiException::conflict('SELF_BLOCK', 'Нельзя заблокировать самого себя');
        }
        // Токены не удаляем: заблокированный с действующим токеном получает 403 USER_BLOCKED (middleware not_blocked)
        $user->update(['is_blocked' => $blocked]);

        return response()->json([
            'message' => $blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
            'data' => Present::user($user),
        ]);
    }
}
