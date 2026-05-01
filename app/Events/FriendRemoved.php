<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class FriendRemoved implements ShouldBroadcastNow
{
    public function __construct(
        public readonly int $recipientId,
        public readonly int $removedUserId,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("user.{$this->recipientId}")];
    }

    public function broadcastAs(): string
    {
        return 'FriendRemoved';
    }
}
