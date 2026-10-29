<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * Бизнес-ошибка API в едином формате:
 * {"error": {"code": "EVENT_FULL", "message": "Свободных мест нет"}}
 */
class ApiException extends Exception
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly ?array $fields = null,
    ) {
        parent::__construct($message);
    }

    public static function unauthorized(string $message = 'Требуется авторизация'): self
    {
        return new self(401, 'UNAUTHORIZED', $message);
    }

    public static function forbidden(string $message = 'Недостаточно прав'): self
    {
        return new self(403, 'FORBIDDEN', $message);
    }

    public static function notFound(string $message = 'Ресурс не найден'): self
    {
        return new self(404, 'NOT_FOUND', $message);
    }

    public static function conflict(string $code, string $message): self
    {
        return new self(409, $code, $message);
    }

    public static function validation(array $fields, string $message = 'Ошибка валидации'): self
    {
        return new self(422, 'VALIDATION_ERROR', $message, $fields);
    }

    public function render(): JsonResponse
    {
        return self::response($this->status, $this->errorCode, $this->getMessage(), $this->fields);
    }

    public static function response(int $status, string $code, string $message, ?array $fields = null): JsonResponse
    {
        $error = ['code' => $code, 'message' => $message];
        if ($fields !== null) {
            $error['fields'] = $fields;
        }

        return response()->json(['error' => $error], $status, [], JSON_UNESCAPED_UNICODE);
    }
}
