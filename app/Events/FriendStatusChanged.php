<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class FriendStatusChanged implements ShouldBroadcastNow
{
    public function __construct(
        public readonly array $recipientIds,
        public readonly int $userId,
        public readonly string $name,
        public readonly int $amenityId,
        public readonly string $slug,
        public readonly string $status,
        public readonly ?string $assignment,
    ) {}

    public function broadcastOn(): array
    {
        return array_map(
            fn ($id) => new PrivateChannel("user.{$id}"),
            $this->recipientIds,
        );
    }

    public function broadcastAs(): string
    {
        return 'FriendStatusChanged';
    }
}
