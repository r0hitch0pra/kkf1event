<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AmenityStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $userId,
        public readonly int $amenityId,
        public readonly string $slug,
        public readonly string $amenityName,
        public readonly bool $requiresAssignment,
        public readonly string $status,
        public readonly ?string $assignment,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->userId}"),
            new PrivateChannel('staff'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'AmenityStatusChanged';
    }
}
