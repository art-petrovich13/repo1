<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Reaction;
use App\Support\EventPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReactionController extends Controller
{
    /** POST /api/events/{id}/reactions — {"type": "like" | "interested"}. Повторная реакция того же типа не дублируется. */
    public function store(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['type' => ['required', Rule::in(Reaction::TYPES)]]);
        $event = $this->findEvent($id);

        if ($event->status === Event::STATUS_CANCELLED) {
            throw ApiException::conflict('EVENT_CANCELLED', 'Мероприятие отменено');
        }

        $reaction = Reaction::firstOrCreate([
            'event_id' => $event->id,
            'user_id' => $request->user()->id,
            'type' => $data['type'],
        ]);

        return $this->eventResponse($request, $event, $reaction->wasRecentlyCreated ? 201 : 200, 'Реакция сохранена');
    }

    /** DELETE /api/events/{id}/reactions?type=like|interested */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['type' => ['required', Rule::in(Reaction::TYPES)]]);
        $event = $this->findEvent($id);

        $deleted = Reaction::where('event_id', $event->id)
            ->where('user_id', $request->user()->id)
            ->where('type', $data['type'])
            ->delete();
        if (! $deleted) {
            throw ApiException::notFound('Реакция не найдена');
        }

        return $this->eventResponse($request, $event, 200, 'Реакция снята');
    }

    private function findEvent(int $id): Event
    {
        $event = Event::find($id);
        if (! $event || $event->status === Event::STATUS_DRAFT) {
            throw ApiException::notFound('Мероприятие не найдено');
        }

        return $event;
    }

    private function eventResponse(Request $request, Event $event, int $status, string $message): JsonResponse
    {
        $event = Event::with(['club', 'category'])->withCounters()->find($event->id);

        return response()->json([
            'message' => $message,
            'data' => EventPresenter::for($request->user(), [$event])->present($event),
        ], $status);
    }
}
