<?php

namespace App\Support;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Пагинация списков в формате {"data": [...], "meta": {"page", "per_page", "total"}}.
 * Параметры запроса: page (по умолчанию 1), per_page (по умолчанию 12, максимум 100).
 */
class Paginate
{
    /**
     * @param  callable  $transform  преобразует элемент страницы в массив
     * @param  callable|null  $prepare  получает элементы страницы до преобразования (например, для предзагрузки)
     * @param  array  $meta  дополнительные поля meta
     */
    public static function response(Builder $query, Request $request, callable $transform, ?callable $prepare = null, array $meta = []): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('per_page', 12)));

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        if ($prepare) {
            $prepare(collect($paginator->items()));
        }

        return response()->json([
            'data' => collect($paginator->items())->map($transform)->values(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ] + $meta,
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }
}
