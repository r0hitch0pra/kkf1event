<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class FriendAdded implements ShouldBroadcastNow
{
    public function __construct(
        public readonly int $recipientId,
        public readonly array $friend,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("user.{$this->recipientId}")];
    }

    public function broadcastAs(): string
    {
        return 'FriendAdded';
    }
}
