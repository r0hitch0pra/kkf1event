<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class PatronCheckedIn implements ShouldBroadcastNow
{
    public function __construct(
        public readonly array $patron,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('staff')];
    }

    public function broadcastAs(): string
    {
        return 'PatronCheckedIn';
    }
}
