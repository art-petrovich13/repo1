<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventReminder extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['event_id', 'user_id', 'kind'];
}
