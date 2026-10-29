<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Support\EventPresenter;
use App\Support\Paginate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EventController extends Controller
{
    /**
     * GET /api/events — афиша опубликованных мероприятий (отменённые и черновики не показываются).
     * Фильтры: category_id, club_id, format, date_from, date_to, upcoming=true, q.
     * Сортировка: sort=starts_at|popularity, order=asc|desc.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => ['nullable', 'integer'],
            'club_id' => ['nullable', 'integer'],
            'format' => ['nullable', 'in:offline,online'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:starts_at,popularity'],
            'order' => ['nullable', 'in:asc,desc'],
        ]);

        $query = Event::query()
            ->with(['club', 'category'])
            ->withCounters()
            ->where('status', Event::STATUS_PUBLISHED);

        $this->applyFilters($query, $request);

        $sort = $request->query('sort', 'starts_at');
        if ($sort === 'popularity') {
            $query->orderByRaw('(registrations_count + likes_count + interested_count) '.($request->query('order') === 'asc' ? 'asc' : 'desc'))
                ->orderBy('starts_at');
        } else {
            $query->orderBy('starts_at', $request->query('order') === 'desc' ? 'desc' : 'asc');
        }
        $query->orderBy('id');

        $presenter = null;

        return Paginate::response(
            $query,
            $request,
            function (Event $e) use (&$presenter) {
                return $presenter->present($e);
            },
            function ($items) use (&$presenter, $request) {
                $presenter = EventPresenter::for($request->user(), $items);
            },
        );
    }

    /**
     * GET /api/events/{id} — карточка. Отменённое доступно по прямой ссылке,
     * черновик — только представителям Комьюнити (иначе 404).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $event = Event::with(['club', 'category'])->withCounters()->find($id);
        $user = $request->user();

        if (! $event || ($event->status === Event::STATUS_DRAFT && ! $user?->isRepresentativeOf($event->club_id))) {
            throw ApiException::notFound('Мероприятие не найдено');
        }

        return response()->json(['data' => EventPresenter::for($user, [$event])->present($event)]);
    }

    private function applyFilters($query, Request $request): void
    {
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }
        if ($request->filled('club_id')) {
            $query->where('club_id', $request->integer('club_id'));
        }
        if ($request->filled('format')) {
            $query->where('format', $request->query('format'));
        }
        if ($request->filled('date_from')) {
            $query->where('starts_at', '>=', Carbon::parse($request->query('date_from'))->startOfDay());
        }
        if ($request->filled('date_to')) {
            $query->where('starts_at', '<=', Carbon::parse($request->query('date_to'))->endOfDay());
        }
        if ($request->boolean('upcoming')) {
            $query->where('starts_at', '>', now());
        }
        if ($request->filled('q')) {
            $q = '%'.str_replace(['%', '_'], ['\%', '\_'], trim($request->query('q'))).'%';
            $query->where(fn ($w) => $w->where('title', 'like', $q)->orWhere('description', 'like', $q));
        }
    }
}
